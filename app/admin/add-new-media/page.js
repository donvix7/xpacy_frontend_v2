import { Suspense } from "react";
import MediaForm from "@/app/_components/MediaForm";
import {
    getManagedProperties,
    getMediaById,
    getMyProperties,
    getPropertyById,
} from "@/app/_lib/data-services";

export async function generateMetadata({ searchParams }) {
    const resolved = (await searchParams) || {};
    const isEdit = Boolean(resolved?.mediaId || resolved?.id || resolved?.edit);
    return {
        title: isEdit ? "Edit Media | Xpacy" : "Add New Media | Xpacy",
        description: isEdit
            ? "Update media details, kind, caption, or URL."
            : "Add photos or videos to a property.",
    };
}

export default async function AddNewMediaPage({ searchParams }) {
    const resolved = (await searchParams) || {};

    const rawMediaId = resolved?.mediaId || resolved?.id || resolved?.edit;
    const mediaId = Array.isArray(rawMediaId) ? rawMediaId[0] : rawMediaId || "";

    const rawPropertyId = resolved?.propertyId;
    const propertyIdFromQuery = Array.isArray(rawPropertyId)
        ? rawPropertyId[0]
        : rawPropertyId || "";

    const rawReturnTo = resolved?.returnTo;
    const returnTo = Array.isArray(rawReturnTo)
        ? rawReturnTo[0]
        : rawReturnTo || "";

    let initialData = null;
    let isEditMode = false;

    const cleanMediaId =
        typeof mediaId === "string" && mediaId.trim() ? mediaId.trim() : "";
    const cleanQueryPropId =
        typeof propertyIdFromQuery === "string" && propertyIdFromQuery.trim()
            ? propertyIdFromQuery.trim()
            : "";

    const [mediaRes, propRes, ownedRes, managedRes] = await Promise.allSettled([
        cleanMediaId
            ? getMediaById(cleanMediaId).catch(() => null)
            : Promise.resolve(null),
        cleanQueryPropId
            ? getPropertyById(cleanQueryPropId).catch(() => null)
            : Promise.resolve(null),
        !cleanQueryPropId ? getMyProperties().catch(() => []) : Promise.resolve([]),
        !cleanQueryPropId
            ? getManagedProperties().catch(() => [])
            : Promise.resolve([]),
    ]);

    if (cleanMediaId) {
        isEditMode = true;
        const rawMedia = mediaRes.status === "fulfilled" ? mediaRes.value : null;
        initialData = rawMedia?.data ?? rawMedia?.media ?? rawMedia ?? null;
    }

    const resolvedPropertyId =
        cleanQueryPropId ||
        String(initialData?.propertyId || initialData?.property?.id || "").trim();

    let resolvedProperty = null;
    if (propRes.status === "fulfilled" && propRes.value) {
        const raw = propRes.value;
        resolvedProperty = raw?.data ?? raw?.property ?? raw ?? null;
    } else if (resolvedPropertyId && !cleanQueryPropId) {
        try {
            const raw = await getPropertyById(resolvedPropertyId);
            resolvedProperty = raw?.data ?? raw?.property ?? raw ?? null;
        } catch {
            resolvedProperty = null;
        }
    }

    if (!resolvedProperty) {
        const fallbackList = [
            ...(ownedRes.status === "fulfilled" && Array.isArray(ownedRes.value)
                ? ownedRes.value
                : []),
            ...(managedRes.status === "fulfilled" && Array.isArray(managedRes.value)
                ? managedRes.value
                : []),
        ];
        resolvedProperty =
            fallbackList.find(
                (p) => String(p?.id || p?._id) === resolvedPropertyId
            ) ||
            fallbackList[0] ||
            null;
    }

    const finalPropertyId =
        resolvedPropertyId ||
        String(resolvedProperty?.id || resolvedProperty?._id || "").trim();
    const finalPropertyName =
        resolvedProperty?.name ||
        resolvedProperty?.property_name ||
        initialData?.property?.name ||
        initialData?.propertyName ||
        "";

    return (
        <Suspense fallback={null}>
            <MediaForm
                initialData={initialData}
                isEditMode={isEditMode}
                defaultPropertyId={finalPropertyId}
                propertyName={finalPropertyName}
                defaultReturnTo={returnTo}
            />
        </Suspense>
    );
}
