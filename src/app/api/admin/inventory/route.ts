import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-middleware";
import { db } from "@/db";
import { inventoryTable, inventoryTransactionTable } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";

// GET /api/admin/inventory - Get inventory overview
const getHandler = withAdminAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const filter = searchParams.get("filter");

      const whereConditions = [];

      if (filter === "low-stock") {
        whereConditions.push(
          lte(inventoryTable.quantityInStock, inventoryTable.lowStockThreshold)
        );
      } else if (filter === "out-of-stock") {
        whereConditions.push(eq(inventoryTable.quantityInStock, 0));
      } else if (filter === "reorder") {
        whereConditions.push(
          lte(inventoryTable.quantityInStock, inventoryTable.reorderPoint)
        );
      }

      const inventory = await db.query.inventoryTable.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          product: {
            with: {
              category: true,
            },
          },
        },
        orderBy: (inventory, { asc }) => [asc(inventory.quantityInStock)],
      });

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
      const totalProducts = inventory.length;
      const lowStockItems = inventory.filter(inv => inv.quantityInStock <= inv.lowStockThreshold).length;
      const outOfStockItems = inventory.filter(inv => inv.quantityInStock === 0).length;
      const reorderItems = inventory.filter(inv => inv.quantityInStock <= inv.reorderPoint).length;

      return NextResponse.json({
        inventory,
        recentTransactions,
        stats: {
          totalProducts,
          lowStockItems,
          outOfStockItems,
          reorderItems,
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

// POST /api/admin/inventory/adjustment - Make inventory adjustment
const postHandler = withAdminAuth(
  async (request: NextRequest, adminUser) => {
    try {
      const body = await request.json();
      const { productId, type, quantity, reason, reference, notes } = body as {
        productId: string;
        type: "in" | "out" | "adjustment";
        quantity: number; // positive integer; for adjustment can be negative
        reason: string;
        reference?: string;
        notes?: string;
      };

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
    } catch (error) {
      console.error("Error adjusting inventory:", error);
      return NextResponse.json(
        { error: "Failed to adjust inventory" },
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
