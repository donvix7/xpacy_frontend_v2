import { Suspense } from "react";
import BookingForm from "@/app/_components/BookingForm";
import {
    getListingById,
    getAllUnits,
    getSingleListing,
} from "@/app/_lib/data-services";

export const metadata = {
    title: "Add New Booking | Xpacy",
    description: "Book a listing or schedule a stay on Xpacy.",
};

export default async function AddNewBookingPage({ searchParams }) {
    const resolved = await searchParams;

    const rawListingId = resolved?.listingId || resolved?.id;
    const listingId = Array.isArray(rawListingId)
        ? rawListingId[0]
        : rawListingId || "";

    const rawPropertyId = resolved?.propertyId;
    const propertyId = Array.isArray(rawPropertyId)
        ? rawPropertyId[0]
        : rawPropertyId || "";

    const rawUnitId = resolved?.unitId;
    const unitId = Array.isArray(rawUnitId) ? rawUnitId[0] : rawUnitId || "";

    const cleanListingId =
        typeof listingId === "string" && listingId.trim() ? listingId.trim() : "";
    const cleanPropertyId =
        typeof propertyId === "string" && propertyId.trim()
            ? propertyId.trim()
            : "";
    const cleanUnitId =
        typeof unitId === "string" && unitId.trim() ? unitId.trim() : "";

    const [listingResult, propertyListingsResult, unitsResult] =
        await Promise.allSettled([
            cleanListingId
                ? getSingleListing(cleanListingId)
                : Promise.resolve(null),
            cleanPropertyId
                ? getListingById(cleanPropertyId)
                : Promise.resolve([]),
            cleanPropertyId
                ? getAllUnits(cleanPropertyId)
                : Promise.resolve([]),
        ]);

    const rawPropertyListings =
        propertyListingsResult.status === "fulfilled"
            ? propertyListingsResult.value
            : [];
    const allListings = (Array.isArray(rawPropertyListings)
        ? rawPropertyListings
        : Array.isArray(rawPropertyListings?.data)
          ? rawPropertyListings.data
          : []
    ).filter(
        (l) => String(l?.status || "").toUpperCase() === "PUBLISHED"
    );

    let listing = null;
    if (cleanListingId) {
        const res =
            listingResult.status === "fulfilled" ? listingResult.value : null;
        listing = res?.data ?? res?.listing ?? res ?? null;

        if (!listing && allListings.length > 0) {
            listing =
                allListings.find(
                    (l) =>
                        String(l.id || l._id) === cleanListingId
                ) || null;
        }
    }

    const rawUnits = unitsResult.status === "fulfilled" ? unitsResult.value : [];
    const units = Array.isArray(rawUnits)
        ? rawUnits
        : Array.isArray(rawUnits?.data)
          ? rawUnits.data
          : [];

    const resolvedUnitId =
        cleanUnitId ||
        listing?.unitId ||
        listing?.unit?.id ||
        (units.length === 1 ? String(units[0]?.id || units[0]?._id || "") : "");

    const resolvedPropertyId =
        cleanPropertyId ||
        listing?.propertyId ||
        listing?.property?.id ||
        listing?.unit?.propertyId ||
        "";

    return (
        <Suspense fallback={null}>
            <BookingForm
                listing={listing}
                listings={allListings}
                units={units}
                defaultListingId={cleanListingId}
                defaultUnitId={resolvedUnitId}
                defaultPropertyId={resolvedPropertyId}
            />
        </Suspense>
    );
}

