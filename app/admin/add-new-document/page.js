import { Suspense } from "react";
import { cookies } from "next/headers";
import DocumentForm from "@/app/_components/DocumentForm";
import {
    getManagedProperties,
    getMyProperties,
} from "@/app/_lib/data-services";

export const metadata = {
    title: "Add New Document | Xpacy",
    description: "Upload or link a new property or organization document.",
};

export default async function AddNewDocumentPage({ searchParams }) {
    const resolved = (await searchParams) || {};
    const cookieStore = await cookies();

    const rawPropertyId = resolved?.propertyId;
    const propertyId = Array.isArray(rawPropertyId)
        ? rawPropertyId[0]
        : rawPropertyId || "";

    const rawReturnTo = resolved?.returnTo;
    const returnTo = Array.isArray(rawReturnTo)
        ? rawReturnTo[0]
        : rawReturnTo || "";

    const organizationId =
        cookieStore.get("organizationId")?.value ||
        cookieStore.get("organization_id")?.value ||
        "";

    const [ownedRes, managedRes] = await Promise.allSettled([
        getMyProperties().catch(() => []),
        getManagedProperties().catch(() => []),
    ]);

    const unwrap = (r) =>
        r.status === "fulfilled" && Array.isArray(r.value) ? r.value : [];

    const seen = new Set();
    const properties = [...unwrap(ownedRes), ...unwrap(managedRes)].filter(
        (p) => {
            const key = p?.id || p?._id;
            if (!key) return false;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }
    );

    return (
        <Suspense fallback={null}>
            <DocumentForm
                properties={properties}
                defaultPropertyId={typeof propertyId === "string" ? propertyId.trim() : ""}
                organizationId={organizationId}
                defaultReturnTo={returnTo}
            />
        </Suspense>
    );
}

