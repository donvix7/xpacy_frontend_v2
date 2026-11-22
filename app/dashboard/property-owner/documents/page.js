import DocumentsListView from "@/app/_components/DocumentsListView";
import { getAllDocuments } from "@/app/_lib/data-services";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export const metadata = {
    title: "Documents | Xpacy",
    description: "Manage property and organization documents.",
};

export default async function PropertyOwnerDocumentsPage() {
    const results = await Promise.allSettled([getAllDocuments()]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const documents =
        results[0].status === "fulfilled" && Array.isArray(results[0].value)
            ? results[0].value
            : [];

    return (
        <DocumentsListView
            documents={documents}
            basePath="/dashboard/property-owner"
            dataErrorMessages={dataErrorMessages}
        />
    );
}

