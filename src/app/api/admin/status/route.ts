import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // First check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ isAdmin: false });
    }

    const adminUser = await isAdmin();
    
    if (adminUser) {
      return NextResponse.json({ 
        isAdmin: true, 
        adminUser: {
          id: adminUser.id,
          userId: adminUser.userId,
          roleId: adminUser.roleId,
          createdAt: adminUser.createdAt,
          updatedAt: adminUser.updatedAt,
          createdById: adminUser.createdBy?.id ?? null,
          user: {
            id: adminUser.user.id,
            name: adminUser.user.name || 'Admin User',
            email: adminUser.user.email,
            image: adminUser.user.image
          },
          role: {
            id: adminUser.role.id,
            name: adminUser.role.name,
            // derive a human-friendly display name from role name
            displayName: adminUser.role.name.replace("_", " ").toUpperCase(),
            description: adminUser.role.description,
            permissions: adminUser.role.permissions,
            createdAt: adminUser.role.createdAt,
            updatedAt: adminUser.role.updatedAt
          }
        }
      });
    }
    
    return NextResponse.json({ isAdmin: false });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
