import { Suspense } from "react";
import BuildingForm from "@/app/_components/BuildingForm";
import { getBuildingById } from "@/app/_lib/data-services";

export async function generateMetadata({ searchParams }) {
    const resolved = await searchParams;
    const isEdit = Boolean(resolved?.buildingId || resolved?.id || resolved?.edit);
    return {
        title: isEdit ? "Edit Building | Xpacy" : "Add New Building | Xpacy",
        description: isEdit
            ? "Update building details, floor count, and description."
            : "Create a new building under a property.",
    };
}

export default async function AddNewBuildingPage({ searchParams }) {
    const resolved = await searchParams;
    const rawId = resolved?.buildingId || resolved?.id || resolved?.edit;
    const buildingId = Array.isArray(rawId) ? rawId[0] : rawId;

    let initialData = null;
    let isEditMode = false;

    if (buildingId && typeof buildingId === "string" && buildingId.trim()) {
        isEditMode = true;
        try {
            const res = await getBuildingById(buildingId.trim());
            initialData = res?.data ?? res?.building ?? res ?? null;
        } catch {
            initialData = null;
        }
    }

    return (
        <Suspense fallback={null}>
            <BuildingForm initialData={initialData} isEditMode={isEditMode} />
        </Suspense>
    );
}
