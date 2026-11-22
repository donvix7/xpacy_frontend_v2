import { Suspense } from "react";
import LeaseForm from "@/app/_components/LeaseForm";
import {
    getAllTenants,
    getAllUnits,
    getLeaseById,
    getPropertyById,
    getPropertyTenants,
    getSingleLease,
} from "@/app/_lib/data-services";

export async function generateMetadata({ searchParams }) {
    const resolved = await searchParams;
    const isEdit = Boolean(resolved?.leaseId || resolved?.id || resolved?.edit);
    return {
        title: isEdit ? "Edit Lease | Xpacy" : "Add New Lease | Xpacy",
        description: isEdit
            ? "Update lease terms, rent schedule, and dates."
            : "Create a new lease agreement for a property unit and tenant.",
    };
}

function toArray(raw) {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.tenants)) return raw.tenants;
    if (Array.isArray(raw?.units)) return raw.units;
    return [];
}

export default async function AddNewLeasePage({ searchParams }) {
    const resolved = await searchParams;

    const rawLeaseId = resolved?.leaseId || resolved?.id || resolved?.edit;
    const leaseId = Array.isArray(rawLeaseId) ? rawLeaseId[0] : rawLeaseId || "";

    const rawPropertyId = resolved?.propertyId;
    const propertyId = Array.isArray(rawPropertyId)
        ? rawPropertyId[0]
        : rawPropertyId || "";

    const rawUnitId = resolved?.unitId;
    const unitId = Array.isArray(rawUnitId) ? rawUnitId[0] : rawUnitId || "";

    const rawTenantId = resolved?.tenantProfileId || resolved?.tenantId;
    const tenantId = Array.isArray(rawTenantId)
        ? rawTenantId[0]
        : rawTenantId || "";

    const rawOrgId = resolved?.organizationId;
    const queryOrgId = Array.isArray(rawOrgId) ? rawOrgId[0] : rawOrgId || "";

    const cleanLeaseId =
        typeof leaseId === "string" && leaseId.trim() ? leaseId.trim() : null;
    const cleanPropertyId =
        typeof propertyId === "string" && propertyId.trim()
            ? propertyId.trim()
            : "";
    const cleanUnitId =
        typeof unitId === "string" && unitId.trim() ? unitId.trim() : "";
    const cleanTenantId =
        typeof tenantId === "string" && tenantId.trim() ? tenantId.trim() : "";

    const [
        leaseResult,
        unitsResult,
        allTenantsResult,
        propertyTenantsResult,
        propertyResult,
    ] = await Promise.allSettled([
        cleanLeaseId ? getSingleLease(cleanLeaseId) : Promise.resolve(null),
        cleanPropertyId ? getAllUnits(cleanPropertyId) : Promise.resolve([]),
        getAllTenants(),
        cleanPropertyId ? getPropertyTenants(cleanPropertyId) : Promise.resolve([]),
        cleanPropertyId ? getPropertyById(cleanPropertyId) : Promise.resolve(null),
    ]);

    let initialData = null;
    let isEditMode = false;

    if (cleanLeaseId) {
        isEditMode = true;
        const res =
            leaseResult.status === "fulfilled" ? leaseResult.value : null;
        initialData = res?.data ?? res?.lease ?? res ?? null;

        if (!initialData && cleanPropertyId) {
            try {
                const all = await getLeaseById(cleanPropertyId);
                if (Array.isArray(all)) {
                    initialData =
                        all.find(
                            (l) =>
                                l.id === cleanLeaseId || l._id === cleanLeaseId
                        ) || null;
                }
            } catch {
                initialData = null;
            }
        }
    }

    const units = toArray(
        unitsResult.status === "fulfilled" ? unitsResult.value : []
    );

    // Merge property tenants + all tenants, deduplicated by id
    const propertyTenants = toArray(
        propertyTenantsResult.status === "fulfilled"
            ? propertyTenantsResult.value
            : []
    );
    const allTenants = toArray(
        allTenantsResult.status === "fulfilled" ? allTenantsResult.value : []
    );
    const tenantMap = new Map();
    for (const t of [...propertyTenants, ...allTenants]) {
        const key = t?.id || t?._id;
        if (key && !tenantMap.has(key)) {
            tenantMap.set(key, t);
        }
    }
    const tenants = Array.from(tenantMap.values());

    const rawProp =
        propertyResult.status === "fulfilled" ? propertyResult.value : null;
    const property = rawProp?.data ?? rawProp?.property ?? rawProp ?? null;

    const resolvedOrgId =
        queryOrgId ||
        property?.organizationId ||
        property?.organization?.id ||
        initialData?.organizationId ||
        "";

    const resolvedUnitId =
        cleanUnitId ||
        (units.length === 1 ? String(units[0]?.id || units[0]?._id || "") : "");

    return (
        <Suspense fallback={null}>
            <LeaseForm
                leaseId={cleanLeaseId}
                initialData={initialData}
                isEditMode={isEditMode}
                units={units}
                tenants={tenants}
                defaultUnitId={resolvedUnitId}
                defaultTenantId={cleanTenantId}
                organizationId={resolvedOrgId}
                propertyName={property?.name || ""}
            />
        </Suspense>
    );
}

