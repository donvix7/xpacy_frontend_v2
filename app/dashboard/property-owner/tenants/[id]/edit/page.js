import { redirect } from "next/navigation";

export default async function EditTenantRedirectPage({ params }) {
    const resolved = await params;
    const rawId = resolved?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
        redirect("/dashboard/property-owner/tenants");
    }

    const returnTo = encodeURIComponent(`/dashboard/property-owner/tenants/${id}`);
    redirect(`/admin/add-new-tenant?tenantId=${encodeURIComponent(id)}&returnTo=${returnTo}`);
}
