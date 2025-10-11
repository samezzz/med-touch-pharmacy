import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-middleware";
import { db } from "@/db";
import { inventoryTable, inventoryTransactionTable, productTable } from "@/db/schema";
import { eq, and, like, or, type SQLWrapper } from "drizzle-orm";

// GET /api/admin/inventory - Get enhanced inventory with product data
const getHandler = withAdminAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search");
      const categoryId = searchParams.get("categoryId");
      const status = searchParams.get("status");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = (page - 1) * limit;

      // Build where conditions for products
      const productWhereConditions: SQLWrapper[] = [];

      if (search) {
        productWhereConditions.push(
          or(
            like(productTable.name, `%${search}%`),
            like(productTable.sku, `%${search}%`)
          )!
        );
      }

      if (categoryId) {
        productWhereConditions.push(eq(productTable.categoryId, categoryId));
      }

      // Get products with inventory data
      const products = await db.query.productTable.findMany({
        where: productWhereConditions.length > 0 ? and(...productWhereConditions) : undefined,
        with: {
          category: true,
          inventory: true,
        },
        orderBy: (products, { desc }) => [desc(products.createdAt)],
        limit,
        offset,
      });

      // Filter products by status if needed
      let filteredProducts = products;
      if (status === "low-stock") {
        filteredProducts = products.filter(product => {
          if (!product.inventory) return false;
          return product.inventory.quantityInStock <= product.inventory.lowStockThreshold;
        });
      } else if (status === "out-of-stock") {
        filteredProducts = products.filter(product => {
          if (!product.inventory) return false;
          return product.inventory.quantityInStock === 0;
        });
      } else if (status === "in-stock") {
        filteredProducts = products.filter(product => {
          if (!product.inventory) return false;
          return product.inventory.quantityInStock > 0 && 
                 product.inventory.quantityInStock > product.inventory.lowStockThreshold;
        });
      }

      // Get total count for pagination
      const totalCount = await db.$count(
        productTable,
        productWhereConditions.length > 0 ? and(...productWhereConditions) : undefined,
      );

      // Get recent transactions
      const recentTransactions = await db.query.inventoryTransactionTable.findMany({
        with: {
          product: true,
          performedBy: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
        limit: 20,
      });

      // Calculate stats
      const allInventory = await db.query.inventoryTable.findMany({
        with: {
          product: true,
        },
      });

      const totalProducts = allInventory.length;
      const lowStockItems = allInventory.filter(inv => inv.quantityInStock <= inv.lowStockThreshold).length;
      const outOfStockItems = allInventory.filter(inv => inv.quantityInStock === 0).length;
      const inStockItems = allInventory.filter(inv => 
        inv.quantityInStock > 0 && inv.quantityInStock > inv.lowStockThreshold
      ).length;

      return NextResponse.json({
        products: filteredProducts,
        recentTransactions,
        stats: {
          totalProducts,
          lowStockItems,
          outOfStockItems,
          inStockItems,
        },
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return NextResponse.json(
        { error: "Failed to fetch inventory" },
        { status: 500 }
      );
    }
  },
  "canManageInventory"
);

export async function GET(request: NextRequest, context: { params: Promise<Record<string, never>> }) {
  await context.params;
  return getHandler(request);
}

// POST /api/admin/inventory - Create product or make inventory adjustment
const postHandler = withAdminAuth(
  async (request: NextRequest, adminUser) => {
    try {
      const body = await request.json();
      const { action } = body;

      if (action === "create-product") {
        // Handle product creation
        const {
          name,
          description,
          shortDescription,
          categoryId,
          price,
          originalPrice,
          sku,
          barcode,
          images,
          isActive = true,
          isFeatured = false,
          requiresPrescription = false,
          weight,
          dimensions,
          manufacturer,
          expiryDate,
          batchNumber,
          tags,
          seoTitle,
          seoDescription,
          initialStock = 0,
          lowStockThreshold = 10,
          reorderPoint = 5,
          reorderQuantity = 50,
        } = body;

        if (!name || !categoryId || !price || !sku) {
          return NextResponse.json(
            { error: "Name, category, price, and SKU are required" },
            { status: 400 }
          );
        }

        // Check if SKU already exists
        const existingProduct = await db.query.productTable.findFirst({
          where: eq(productTable.sku, sku),
        });

        if (existingProduct) {
          return NextResponse.json(
            { error: "Product with this SKU already exists" },
            { status: 400 }
          );
        }

        // Create slug from name
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Create new product
        const newProduct = {
          id: `prod-${Date.now()}`,
          name,
          slug,
          description: description || "",
          shortDescription: shortDescription || "",
          categoryId,
          price: price.toString(),
          originalPrice: originalPrice ? originalPrice.toString() : null,
          sku,
          barcode: barcode || "",
          images: JSON.stringify(images || []),
          isActive,
          isFeatured,
          requiresPrescription,
          weight: weight ? weight.toString() : null,
          dimensions: dimensions ? JSON.stringify(dimensions) : null,
          manufacturer: manufacturer || "",
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          batchNumber: batchNumber || "",
          tags: tags ? JSON.stringify(tags) : null,
          seoTitle: seoTitle || "",
          seoDescription: seoDescription || "",
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: adminUser.id,
        };

        await db.insert(productTable).values(newProduct);

        // Create inventory record for the new product
        const newInventory = {
          id: `inv-${Date.now()}`,
          productId: newProduct.id,
          quantityInStock: Math.max(0, initialStock),
          quantityReserved: 0,
          quantityAvailable: Math.max(0, initialStock),
          lowStockThreshold,
          reorderPoint,
          reorderQuantity,
          lastCounted: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(inventoryTable).values(newInventory);

        return NextResponse.json({ 
          message: "Product created successfully",
          product: newProduct,
        }, { status: 201 });

      } else if (action === "adjust-inventory") {
        // Handle inventory adjustment
        const { productId, type, quantity, reason, reference, notes } = body;

        if (!productId || !type || quantity === undefined || !reason) {
          return NextResponse.json(
            { error: "Product ID, type, quantity, and reason are required" },
            { status: 400 }
          );
        }

        if (!["in", "out", "adjustment"].includes(type)) {
          return NextResponse.json(
            { error: "Invalid adjustment type. Must be 'in', 'out', or 'adjustment'" },
            { status: 400 }
          );
        }

        if (!Number.isFinite(quantity)) {
          return NextResponse.json(
            { error: "Quantity must be a finite number" },
            { status: 400 }
          );
        }

        // Create transaction record
        const transaction = {
          id: `trans-${Date.now()}`,
          productId,
          type,
          quantity,
          reason,
          reference: reference || "",
          notes: notes || "",
          performedBy: adminUser.id,
          createdAt: new Date(),
        };

        await db.insert(inventoryTransactionTable).values(transaction);

        // Update inventory
        const existingInventory = await db.query.inventoryTable.findFirst({
          where: eq(inventoryTable.productId, productId),
        });

        if (!existingInventory && type === "out") {
          return NextResponse.json(
            { error: "Cannot decrease stock for a product with no existing inventory" },
            { status: 400 }
          );
        }

        if (existingInventory) {
          let delta = quantity;
          if (type === "in") {
            delta = Math.abs(quantity);
          } else if (type === "out") {
            delta = -Math.abs(quantity);
          } // adjustment: use signed quantity as-is

          const newQuantity = existingInventory.quantityInStock + delta;
          const boundedQuantityInStock = Math.max(0, newQuantity);
          const newAvailable = Math.max(0, newQuantity - existingInventory.quantityReserved);

          await db.update(inventoryTable)
            .set({
              quantityInStock: boundedQuantityInStock,
              quantityAvailable: newAvailable,
              lastCounted: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(inventoryTable.productId, productId));
        } else {
          // Create new inventory record if it doesn't exist
          const initialQuantity = type === "in" ? Math.max(0, Math.abs(quantity)) : Math.max(0, quantity);
          await db.insert(inventoryTable).values({
            id: `inv-${Date.now()}`,
            productId,
            quantityInStock: initialQuantity,
            quantityReserved: 0,
            quantityAvailable: initialQuantity,
            lowStockThreshold: 10,
            reorderPoint: 5,
            reorderQuantity: 50,
            lastCounted: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return NextResponse.json({ 
          message: "Inventory adjustment successful",
          transaction,
        });

      } else {
        return NextResponse.json(
          { error: "Invalid action. Must be 'create-product' or 'adjust-inventory'" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error in inventory operation:", error);
      return NextResponse.json(
        { error: "Failed to process request" },
        { status: 500 }
      );
    }
  },
  "canManageInventory"
);

export async function POST(request: NextRequest, context: { params: Promise<Record<string, never>> }) {
  await context.params;
  return postHandler(request);
}
