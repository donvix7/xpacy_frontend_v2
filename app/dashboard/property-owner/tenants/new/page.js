import { redirect } from "next/navigation";

export default function Page() {
    redirect("/admin/add-new-tenant?returnTo=/dashboard/property-owner/tenants");
}

