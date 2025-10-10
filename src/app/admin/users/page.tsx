import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin-auth";
import { AdminUserManagement } from "@/ui/components/admin/admin-user-management";

export default async function AdminUsersPage() {
  const adminUser = await isAdmin();

  if (!adminUser) {
    redirect("/auth/sign-in?redirect=/admin/users");
  }

  if (!adminUser.role.permissions.canManageAdmins) {
    redirect("/admin");
  }

  return <AdminUserManagement adminUser={adminUser} />;
}
