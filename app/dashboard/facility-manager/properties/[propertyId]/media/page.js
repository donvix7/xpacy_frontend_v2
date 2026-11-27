import MediaListView from "@/app/_components/MediaListView";
import { getAllMedia, getPropertyById } from "@/app/_lib/data-services";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export const metadata = {
    title: "Property Media | Xpacy",
    description: "View and manage photos, videos, floor plans, and virtual tours linked to this property.",
};

export default async function PropertyManagerMediaPage({ params }) {
    const resolved = await params;
    const propertyId = resolved?.propertyId || resolved?.id;

    const results = await Promise.allSettled([
        getAllMedia({ propertyId }),
        propertyId ? getPropertyById(propertyId) : Promise.resolve(null),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const media =
        results[0].status === "fulfilled" && Array.isArray(results[0].value)
            ? results[0].value
            : [];
    const rawProp = results[1].status === "fulfilled" ? results[1].value : null;
    const property = rawProp?.data ?? rawProp?.property ?? rawProp ?? null;

    return (
        <MediaListView
            media={media}
            basePath="/dashboard/property-manager"
            propertyId={propertyId}
            propertyName={property?.name || property?.property_name || null}
            dataErrorMessages={dataErrorMessages}
        />
    );
}

