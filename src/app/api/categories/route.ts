import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const categories = await db.query.categoryTable.findMany({
      where: eq(categoryTable.isActive, true),
      orderBy: [asc(categoryTable.sortOrder), asc(categoryTable.name)],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}