import DocumentsListView from "@/app/_components/DocumentsListView";
import { getAllDocuments, getPropertyById } from "@/app/_lib/data-services";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export const metadata = {
    title: "Property Documents | Xpacy",
    description: "View and manage documents linked to this property.",
};

export default async function ManagerPropertyDocumentsPage({ params }) {
    const resolved = await params;
    const propertyId = resolved?.propertyId || resolved?.id;

    const results = await Promise.allSettled([
        getAllDocuments({ propertyId }),
        propertyId ? getPropertyById(propertyId) : Promise.resolve(null),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const documents =
        results[0].status === "fulfilled" && Array.isArray(results[0].value)
            ? results[0].value
            : [];
    const rawProp = results[1].status === "fulfilled" ? results[1].value : null;
    const property = rawProp?.data ?? rawProp?.property ?? rawProp ?? null;

    return (
        <DocumentsListView
            documents={documents}
            basePath="/dashboard/property-manager"
            propertyId={propertyId}
            propertyName={property?.name || property?.property_name || null}
            dataErrorMessages={dataErrorMessages}
        />
    );
}

