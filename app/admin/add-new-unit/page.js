import { Suspense } from "react";
import UnitForm from "@/app/_components/UnitForm";
import { getAllBuildings, getUnitById } from "@/app/_lib/data-services";

export async function generateMetadata({ searchParams }) {
    const resolved = await searchParams;
    const isEdit = Boolean(resolved?.unitId || resolved?.id || resolved?.edit);
    return {
        title: isEdit ? "Edit Unit | Xpacy" : "Add New Unit | Xpacy",
        description: isEdit
            ? "Update unit specifications, pricing, and availability."
            : "Create a new unit under a property.",
    };
}

export default async function AddNewUnitPage({ searchParams }) {
    const resolved = await searchParams;
    const rawUnitId = resolved?.unitId || resolved?.id || resolved?.edit;
    const unitId = Array.isArray(rawUnitId) ? rawUnitId[0] : rawUnitId;

    const rawPropertyId = resolved?.propertyId;
    const propertyId = Array.isArray(rawPropertyId)
        ? rawPropertyId[0]
        : rawPropertyId || "";

    const rawBuildingId = resolved?.buildingId;
    const buildingId = Array.isArray(rawBuildingId)
        ? rawBuildingId[0]
        : rawBuildingId || "";

    let initialData = null;
    let isEditMode = false;

    const [unitResult, buildingsResult] = await Promise.allSettled([
        unitId && typeof unitId === "string" && unitId.trim()
            ? getUnitById(unitId.trim())
            : Promise.resolve(null),
        propertyId && typeof propertyId === "string" && propertyId.trim()
            ? getAllBuildings(propertyId.trim())
            : Promise.resolve([]),
    ]);

    if (unitId && typeof unitId === "string" && unitId.trim()) {
        isEditMode = true;
        const res = unitResult.status === "fulfilled" ? unitResult.value : null;
        initialData = res?.data ?? res?.unit ?? res ?? null;
    }

    const rawBuildings =
        buildingsResult.status === "fulfilled" ? buildingsResult.value : [];
    const buildings = Array.isArray(rawBuildings)
        ? rawBuildings
        : Array.isArray(rawBuildings?.data)
          ? rawBuildings.data
          : [];

    return (
        <Suspense fallback={null}>
            <UnitForm
                initialData={initialData}
                isEditMode={isEditMode}
                buildings={buildings}
                defaultBuildingId={buildingId}
            />
        </Suspense>
    );
}

