import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin-auth";
import { InventoryManagement } from "@/ui/components/admin/inventory-management";

export default async function InventoryPage() {
  const adminUser = await isAdmin();

  if (!adminUser) {
    redirect("/auth/sign-in?redirect=/admin/inventory");
  }

  if (!adminUser.role.permissions.canManageInventory) {
    redirect("/admin");
  }

  return <InventoryManagement adminUser={adminUser} />;
}
