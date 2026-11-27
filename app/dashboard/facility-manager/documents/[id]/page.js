import DocumentDetailsView from "@/app/_components/DocumentDetailsView";
import { getAllDocuments, getDocumentById } from "@/app/_lib/data-services";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

async function fetchDocument(id) {
    try {
        const doc = await getDocumentById(id);
        if (doc && typeof doc === "object" && (doc.id || doc._id || doc.name)) {
            return doc;
        }
    } catch {
        // fallback below
    }
    const all = await getAllDocuments();
    if (Array.isArray(all)) {
        return all.find((d) => String(d.id || d._id) === String(id)) || null;
    }
    return null;
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    try {
        const doc = await fetchDocument(id);
        return {
            title: doc?.name ? `${doc.name} | Documents` : "Document Details | Xpacy",
        };
    } catch {
        return { title: "Document Details | Xpacy" };
    }
}

export default async function PropertyManagerDocumentDetailsPage({ params }) {
    const { id } = await params;
    const results = await Promise.allSettled([fetchDocument(id)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const document = results[0].status === "fulfilled" ? results[0].value : null;

    return (
        <DocumentDetailsView
            document={document}
            basePath="/dashboard/facility-manager"
            dataErrorMessages={dataErrorMessages}
        />
    );
}

