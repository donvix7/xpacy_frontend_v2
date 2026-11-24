import MediaDetailsView from "@/app/_components/MediaDetailsView";
import { getAllMedia, getMediaById } from "@/app/_lib/data-services";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

async function fetchMedia(id, propertyId) {
    try {
        const item = await getMediaById(id);
        if (item && typeof item === "object" && (item.id || item._id || item.url)) {
            return item;
        }
    } catch {
        // fallback below
    }
    const all = await getAllMedia({ propertyId });
    if (Array.isArray(all)) {
        return all.find((m) => String(m.id || m._id) === String(id)) || null;
    }
    return null;
}

export async function generateMetadata({ params }) {
    const { id, propertyId } = await params;
    try {
        const item = await fetchMedia(id, propertyId);
        const title = item?.title || item?.name;
        return {
            title: title ? `${title} | Media` : "Media Details | Xpacy",
        };
    } catch {
        return { title: "Media Details | Xpacy" };
    }
}

export default async function PropertyMediaDetailsPage({ params }) {
    const resolved = await params;
    const propertyId = resolved?.propertyId || resolved?.id;
    const mediaId = resolved?.id;

    const results = await Promise.allSettled([fetchMedia(mediaId, propertyId)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const media = results[0].status === "fulfilled" ? results[0].value : null;

    return (
        <MediaDetailsView
            media={media}
            basePath="/dashboard/property-owner"
            propertyId={propertyId}
            dataErrorMessages={dataErrorMessages}
        />
    );
}

