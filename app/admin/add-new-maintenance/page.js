import { Suspense } from "react";
import MaintenanceForm from "@/app/_components/MaintenanceForm";
import {
    getAllBuildings,
    getAllMaintenanceRequest,
    getAllUnits,
    getMaintenanceById,
    getOrganizationMembers,
    getPropertyById,
} from "@/app/_lib/data-services";

export async function generateMetadata({ searchParams }) {
    const resolved = (await searchParams) || {};
    const isEdit = Boolean(resolved?.maintenanceId || resolved?.id || resolved?.edit);
    return {
        title: isEdit
            ? "Edit Maintenance Request | Xpacy"
            : "Add New Maintenance | Xpacy",
        description: isEdit
            ? "Update maintenance request details, status, or schedule."
            : "Create a new maintenance request or work order for a property.",
    };
}

function toArray(raw) {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.units)) return raw.units;
    if (Array.isArray(raw?.buildings)) return raw.buildings;
    return [];
}

export default async function AddNewMaintenancePage({ searchParams }) {
    const resolved = (await searchParams) || {};

    const rawMaintenanceId =
        resolved?.maintenanceId || resolved?.id || resolved?.edit;
    const maintenanceId = Array.isArray(rawMaintenanceId)
        ? rawMaintenanceId[0]
        : rawMaintenanceId || "";
    const cleanMaintenanceId =
        typeof maintenanceId === "string" && maintenanceId.trim()
            ? maintenanceId.trim()
            : null;

    const rawPropertyId = resolved?.propertyId;
    const propertyId = Array.isArray(rawPropertyId)
        ? rawPropertyId[0]
        : rawPropertyId || "";

    const rawUnitId = resolved?.unitId;
    const unitId = Array.isArray(rawUnitId) ? rawUnitId[0] : rawUnitId || "";

    const rawBuildingId = resolved?.buildingId;
    const buildingId = Array.isArray(rawBuildingId)
        ? rawBuildingId[0]
        : rawBuildingId || "";

    const rawReturnTo = resolved?.returnTo;
    const returnTo = Array.isArray(rawReturnTo)
        ? rawReturnTo[0]
        : rawReturnTo || "";

    const cleanPropertyId =
        typeof propertyId === "string" && propertyId.trim()
            ? propertyId.trim()
            : "";

    const [maintenanceResult, propertyResult, unitsResult, buildingsResult] =
        await Promise.allSettled([
            cleanMaintenanceId
                ? getMaintenanceById(cleanMaintenanceId)
                : Promise.resolve(null),
            cleanPropertyId
                ? getPropertyById(cleanPropertyId)
                : Promise.resolve(null),
            cleanPropertyId
                ? getAllUnits(cleanPropertyId)
                : Promise.resolve([]),
            cleanPropertyId
                ? getAllBuildings(cleanPropertyId)
                : Promise.resolve([]),
        ]);

    const rawMaintenance =
        maintenanceResult.status === "fulfilled"
            ? maintenanceResult.value
            : null;
    let initialData =
        rawMaintenance?.data ?? rawMaintenance?.maintenance ?? rawMaintenance ?? null;

    if (!initialData && cleanMaintenanceId && cleanPropertyId) {
        try {
            const all = await getAllMaintenanceRequest(cleanPropertyId);
            const list = Array.isArray(all)
                ? all
                : Array.isArray(all?.data)
                  ? all.data
                  : [];
            initialData =
                list.find(
                    (m) =>
                        String(m.id || m._id) === String(cleanMaintenanceId)
                ) || null;
        } catch {
            initialData = null;
        }
    }

    const rawProp =
        propertyResult.status === "fulfilled" ? propertyResult.value : null;
    const property = rawProp?.data ?? rawProp?.property ?? rawProp ?? null;
    const units = toArray(
        unitsResult.status === "fulfilled" ? unitsResult.value : []
    );
    const buildings = toArray(
        buildingsResult.status === "fulfilled" ? buildingsResult.value : []
    );

    const orgId =
        property?.organizationId ||
        property?.organization_id ||
        initialData?.organizationId ||
        null;
    let members = [];
    if (orgId && cleanMaintenanceId) {
        try {
            const mRes = await getOrganizationMembers(orgId);
            if (Array.isArray(mRes)) members = mRes;
        } catch {
            members = [];
        }
    }

    return (
        <Suspense fallback={null}>
            <MaintenanceForm
                maintenanceId={cleanMaintenanceId}
                initialData={initialData}
                isEditMode={Boolean(cleanMaintenanceId)}
                propertyId={cleanPropertyId || initialData?.propertyId || ""}
                propertyName={property?.name || property?.property_name || ""}
                units={units}
                buildings={buildings}
                members={members}
                defaultUnitId={typeof unitId === "string" ? unitId.trim() : ""}
                defaultBuildingId={
                    typeof buildingId === "string" ? buildingId.trim() : ""
                }
                defaultReturnTo={returnTo}
            />
        </Suspense>
    );
}
