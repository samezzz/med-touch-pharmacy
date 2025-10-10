import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-middleware";
import { db } from "@/db";
import { userTable, adminUserTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// DELETE /api/admin/users/[id] - Delete user
export const DELETE = withAdminAuth(
  async (_request: NextRequest, _adminUser, context?: { params: Record<string, string> }) => {
    try {
      const params = context?.params as { id: string };
      const userId = params.id;

      // Check if user exists
      const user = await db.query.userTable.findFirst({
        where: eq(userTable.id, userId),
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Check if user is an admin
      const adminUserRecord = await db.query.adminUserTable.findFirst({
        where: eq(adminUserTable.userId, userId),
      });

      if (adminUserRecord) {
        return NextResponse.json(
          { error: "Cannot delete admin users. Please remove admin privileges first." },
          { status: 400 }
        );
      }

      // Delete the user (this will cascade delete related records)
      await db.delete(userTable)
        .where(eq(userTable.id, userId));

      return NextResponse.json({ 
        message: "User deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }
  },
  "canManageCustomers"
);
