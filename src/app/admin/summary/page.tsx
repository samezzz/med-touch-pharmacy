import { redirect } from "next/navigation";

export default function AdminSummaryPage() {
  // Redirect to customers page since summary content moved there
  redirect("/admin/customers");
}
