import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-middleware";
import { db } from "@/db";
import { categoryTable } from "@/db/schema";
// (no additional operators needed)

// GET /api/admin/categories - Get all categories
export const GET = withAdminAuth(
  async (_request: NextRequest, _adminUser) => {
    try {
      const categories = await db.query.categoryTable.findMany({
        orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
      });

      return NextResponse.json({ categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }
  },
  "canManageCategories"
);

// POST /api/admin/categories - Create new category
export const POST = withAdminAuth(
  async (request: NextRequest, adminUser) => {
    try {
      const body = await request.json();
      const { name, slug, description, image, isActive, sortOrder } = body;

      if (!name || !slug) {
        return NextResponse.json(
          { error: "Name and slug are required" },
          { status: 400 }
        );
      }

      const newCategory = {
        id: `cat-${Date.now()}`,
        name,
        slug,
        description: description || "",
        image: image || "",
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminUser.id,
      };

      await db.insert(categoryTable).values(newCategory);

      return NextResponse.json({ category: newCategory }, { status: 201 });
    } catch (error) {
      console.error("Error creating category:", error);
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 500 }
      );
    }
  },
  "canManageCategories"
);
