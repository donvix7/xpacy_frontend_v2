import { Suspense } from "react";
import TenantForm from "@/app/_components/TenantForm";
import { getTenantById } from "@/app/_lib/data-services";
import { SAMPLE_TENANT_DETAIL } from "@/app/_lib/sample-tenants";

export async function generateMetadata({ searchParams }) {
    const resolved = await searchParams;
    const isEdit = Boolean(resolved?.tenantId || resolved?.id || resolved?.edit);
    return {
        title: isEdit ? "Edit Tenant | Xpacy" : "Add New Tenant | Xpacy",
        description: isEdit
            ? "Update tenant personal, identification, emergency contact, and employment details."
            : "Create a new tenant profile with personal, identification, emergency, and employment details.",
    };
}

export default async function AddNewTenantPage({ searchParams }) {
    const resolved = await searchParams;
    const rawId = resolved?.tenantId || resolved?.id || resolved?.edit;
    const tenantId = Array.isArray(rawId) ? rawId[0] : rawId;

    let initialData = null;
    let isEditMode = false;

    if (tenantId && typeof tenantId === "string" && tenantId.trim()) {
        const cleanId = tenantId.trim();
        isEditMode = true;
        try {
            const result = await getTenantById(cleanId);
            initialData =
                result?.data?.tenant ??
                result?.data ??
                result?.tenant ??
                result ??
                null;
        } catch {
            initialData = null;
        }

        if (!initialData && cleanId === SAMPLE_TENANT_DETAIL.id) {
            initialData = SAMPLE_TENANT_DETAIL;
        }
    }

    return (
        <Suspense fallback={null}>
            <TenantForm
                initialData={initialData}
                isEditMode={isEditMode}
            />
        </Suspense>
    );
}
