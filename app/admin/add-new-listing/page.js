import { Suspense } from "react";
import ListingForm from "@/app/_components/ListingForm";
import {
    getAllUnits,
    getSingleListing,
    getListingById,
    getPropertyById,
} from "@/app/_lib/data-services";

export async function generateMetadata({ searchParams }) {
    const resolved = await searchParams;
    const isEdit = Boolean(resolved?.listingId || resolved?.id || resolved?.edit);
    return {
        title: isEdit ? "Edit Listing | Xpacy" : "Add New Listing | Xpacy",
        description: isEdit
            ? "Update listing details, pricing, and availability."
            : "Create a new listing for a property or unit.",
    };
}

export default async function AddNewListingPage({ searchParams }) {
    const resolved = await searchParams;
    const rawListingId = resolved?.listingId || resolved?.id || resolved?.edit;
    const listingId = Array.isArray(rawListingId) ? rawListingId[0] : rawListingId;

    const rawPropertyId = resolved?.propertyId;
    const propertyId = Array.isArray(rawPropertyId)
        ? rawPropertyId[0]
        : rawPropertyId || "";

    const rawUnitId = resolved?.unitId;
    const unitId = Array.isArray(rawUnitId) ? rawUnitId[0] : rawUnitId || "";

    let initialData = null;
    let isEditMode = false;

    const [listingResult, unitsResult, propertyResult] = await Promise.allSettled([
        listingId && typeof listingId === "string" && listingId.trim()
            ? getSingleListing(listingId.trim())
            : Promise.resolve(null),
        propertyId && typeof propertyId === "string" && propertyId.trim()
            ? getAllUnits(propertyId.trim())
            : Promise.resolve([]),
        propertyId && typeof propertyId === "string" && propertyId.trim()
            ? getPropertyById(propertyId.trim())
            : Promise.resolve(null),
    ]);

    const cleanListingId =
        listingId && typeof listingId === "string" && listingId.trim()
            ? listingId.trim()
            : null;

    if (cleanListingId) {
        isEditMode = true;
        const res =
            listingResult.status === "fulfilled" ? listingResult.value : null;
        initialData = res?.data ?? res?.listing ?? res ?? null;

        if (!initialData && propertyId) {
            try {
                const all = await getListingById(propertyId.trim());
                if (Array.isArray(all)) {
                    initialData =
                        all.find(
                            (l) =>
                                l.id === cleanListingId || l._id === cleanListingId
                        ) || null;
                }
            } catch {
                initialData = null;
            }
        }
    }

    const rawUnits = unitsResult.status === "fulfilled" ? unitsResult.value : [];
    const units = Array.isArray(rawUnits)
        ? rawUnits
        : Array.isArray(rawUnits?.data)
          ? rawUnits.data
          : [];

    const rawProp =
        propertyResult.status === "fulfilled" ? propertyResult.value : null;
    const property = rawProp?.data ?? rawProp?.property ?? rawProp ?? null;
    const defaultLocation = property
        ? [property.address, property.city, property.state, property.country]
              .filter(Boolean)
              .join(", ")
        : "";

    const resolvedUnitId =
        unitId ||
        (units.length === 1 ? String(units[0]?.id || units[0]?._id || "") : "");

    return (
        <Suspense fallback={null}>
            <ListingForm
                listingId={cleanListingId}
                initialData={initialData}
                isEditMode={isEditMode}
                units={units}
                defaultUnitId={resolvedUnitId}
                defaultLocation={defaultLocation}
            />
        </Suspense>
    );
}
