import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin-auth";
import { ProductManagement } from "@/ui/components/admin/product-management";

export default async function ProductsPage() {
  const adminUser = await isAdmin();

  if (!adminUser) {
    redirect("/auth/sign-in?redirect=/admin/products");
  }

  if (!adminUser.role.permissions.canManageProducts) {
    redirect("/admin");
  }

  return <ProductManagement adminUser={adminUser} />;
}
