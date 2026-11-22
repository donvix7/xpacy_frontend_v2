import MaintenanceDetailsView from "@/app/_components/MaintenanceDetailsView";
import {
    getAllMaintenanceRequest,
    getMaintenanceById,
    getPropertyById,
} from "@/app/_lib/data-services";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

async function fetchMaintenance(propertyId, maintenanceId) {
    try {
        const res = await getMaintenanceById(maintenanceId);
        const item = res?.data ?? res?.maintenance ?? res ?? null;
        if (item && typeof item === "object" && (item.id || item._id)) {
            return item;
        }
    } catch {
        // fallback below
    }

    if (propertyId) {
        const all = await getAllMaintenanceRequest(propertyId);
        const list = Array.isArray(all)
            ? all
            : Array.isArray(all?.data)
              ? all.data
              : [];
        return (
            list.find(
                (m) =>
                    String(m.id || m._id) === String(maintenanceId)
            ) || null
        );
    }

    return null;
}

export async function generateMetadata({ params }) {
    const resolved = await params;
    const propertyId = resolved?.propertyId || resolved?.id;
    const maintenanceId = resolved?.maintenanceId;
    try {
        const req = await fetchMaintenance(propertyId, maintenanceId);
        return {
            title: req?.title
                ? `${req.title} | Maintenance Details`
                : "Maintenance Details | Xpacy",
            description: req?.description || "Maintenance request details.",
        };
    } catch {
        return { title: "Maintenance Details | Xpacy" };
    }
}

export default async function ManagerMaintenanceDetailsPage({ params }) {
    const resolved = await params;
    const propertyId = resolved?.propertyId || resolved?.id;
    const maintenanceId = resolved?.maintenanceId;

    const results = await Promise.allSettled([
        fetchMaintenance(propertyId, maintenanceId),
        propertyId ? getPropertyById(propertyId) : Promise.resolve(null),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const request = results[0].status === "fulfilled" ? results[0].value : null;
    const rawProp = results[1].status === "fulfilled" ? results[1].value : null;
    const property = rawProp?.data ?? rawProp?.property ?? rawProp ?? null;

    return (
        <MaintenanceDetailsView
            request={request}
            property={property}
            propertyId={propertyId}
            basePath="/dashboard/property-manager"
            dataErrorMessages={dataErrorMessages}
        />
    );
}

