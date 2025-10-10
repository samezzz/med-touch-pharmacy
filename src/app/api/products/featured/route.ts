import { NextResponse } from "next/server";
import { db } from "@/db";
import { productTable, categoryTable, inventoryTable } from "@/db/schema";
import { eq, and, desc, gt } from "drizzle-orm";

export async function GET() {
  try {
    // Get featured products with category information
    const featuredProducts = await db
      .select({
        id: productTable.id,
        name: productTable.name,
        slug: productTable.slug,
        description: productTable.description,
        shortDescription: productTable.shortDescription,
        price: productTable.price,
        originalPrice: productTable.originalPrice,
        sku: productTable.sku,
        barcode: productTable.barcode,
        images: productTable.images,
        isActive: productTable.isActive,
        isFeatured: productTable.isFeatured,
        quantityAvailable: inventoryTable.quantityAvailable,
        manufacturer: productTable.manufacturer,
        categoryId: productTable.categoryId,
        categoryName: categoryTable.name,
        createdAt: productTable.createdAt,
        updatedAt: productTable.updatedAt,
        createdBy: productTable.createdBy,
      })
      .from(productTable)
      .leftJoin(categoryTable, eq(productTable.categoryId, categoryTable.id))
      .leftJoin(inventoryTable, eq(productTable.id, inventoryTable.productId))
      .where(and(
        eq(productTable.isActive, true),
        eq(productTable.isFeatured, true),
        gt(inventoryTable.quantityAvailable, 0)
      ))
      .orderBy(desc(productTable.createdAt))
      .limit(8);

    return NextResponse.json({ products: featuredProducts });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured products" },
      { status: 500 }
    );
  }
}
