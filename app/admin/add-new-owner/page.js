import { Suspense } from "react";
import { cookies } from "next/headers";
import OwnerForm from "@/app/_components/OwnerForm";
import { getOrganizationById } from "@/app/_lib/data-services";

export const metadata = {
    title: "Create Owner Profile | Xpacy",
    description: "Create a new property owner profile linked to your organization.",
};

export default async function AddNewOwnerPage({ searchParams }) {
    const resolved = (await searchParams) || {};
    const cookieStore = await cookies();

    const rawOrgId = resolved?.organizationId;
    const queryOrgId = Array.isArray(rawOrgId) ? rawOrgId[0] : rawOrgId || "";
    const cookieOrgId =
        cookieStore.get("organizationId")?.value ||
        cookieStore.get("organization_id")?.value ||
        "";
    const organizationId = String(queryOrgId || cookieOrgId || "").trim();

    const rawOrgName = resolved?.organizationName;
    let organizationName = Array.isArray(rawOrgName)
        ? rawOrgName[0]
        : rawOrgName || "";

    const rawReturnTo = resolved?.returnTo;
    const returnTo = Array.isArray(rawReturnTo)
        ? rawReturnTo[0]
        : rawReturnTo || "";

    if (organizationId && !organizationName) {
        try {
            const rawOrg = await getOrganizationById(organizationId);
            const org =
                rawOrg?.organization ||
                rawOrg?.data?.organization ||
                rawOrg?.data ||
                rawOrg ||
                null;
            organizationName = org?.name || "";
        } catch {
            organizationName = "";
        }
    }

    return (
        <Suspense fallback={null}>
            <OwnerForm
                organizationId={organizationId}
                organizationName={organizationName}
                defaultReturnTo={returnTo}
            />
        </Suspense>
    );
}
