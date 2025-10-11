import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin-auth";
import { EnhancedInventoryManagement } from "@/ui/components/admin/enhanced-inventory-management";

export default async function InventoryPage() {
  const adminUser = await isAdmin();

  if (!adminUser) {
    redirect("/auth/sign-in?redirect=/admin/inventory");
  }

  if (!adminUser.role.permissions.canManageInventory) {
    redirect("/admin");
  }

  return <EnhancedInventoryManagement adminUser={adminUser} />;
}
