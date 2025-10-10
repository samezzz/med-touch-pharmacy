import { getUsersWithRoles } from "@/lib/queries/uploads";

import CustomersPageClient from "./page.client";

export default async function CustomersPage() {
  const data = await getUsersWithRoles();
  return <CustomersPageClient initialData={data} />;
}
