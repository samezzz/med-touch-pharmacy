import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin-auth";
import { AdminDashboard } from "@/ui/components/admin/admin-dashboard";

export default async function AdminPage() {
  const adminUser = await isAdmin();

  if (!adminUser) {
    redirect("/auth/sign-in?redirect=/admin");
  }

  return <AdminDashboard adminUser={adminUser} />;
}