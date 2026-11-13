import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAllOrganization } from "@/app/_lib/data-services";
import { attachCurrentUserRolesToOrganizations } from "@/app/_lib/action";
import ProceedSelection from "./ProceedSelection";

const getOrganizations = (response) => {
    const candidates = [
        response,
        response?.data,
        response?.organizations,
        response?.docs,
        response?.results,
        response?.items,
        response?.list,
        response?.data?.organizations,
        response?.data?.docs,
        response?.data?.results,
        response?.data?.items,
        response?.data?.list,
        response?.data?.data,
    ];
    return candidates.find(Array.isArray) || [];
};

export default async function ProceedPage({ searchParams }) {
    const params = await searchParams;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const role = cookieStore.get("userRole")?.value;

    if (!token || !role) redirect("/auth/log-in");

    if (["admin", "administrator", "superadmin", "superadministrator"].includes(String(role).toLowerCase().replace(/[\s_-]/g, ""))) {
        redirect("/dashboard/admin");
    }

    let organizations = [];
    try {
        const listedOrganizations = getOrganizations(await getAllOrganization())
            .filter((organization) => organization && typeof organization === "object")
            .map((organization) => ({
                ...organization,
                id: organization.id || organization._id || organization.organizationId || organization.organization_id,
                name: organization.name || organization.organizationName || organization.organization_name || organization.displayName || "Organization",
            }))
            .filter((organization) => organization.id);
        organizations = await attachCurrentUserRolesToOrganizations(listedOrganizations);
    } catch {
        organizations = [];
    }

    return (
        <ProceedSelection
            organizations={organizations}
            role={role}
            returnTo={typeof params?.returnTo === "string" ? params.returnTo : ""}
        />
    );
}
