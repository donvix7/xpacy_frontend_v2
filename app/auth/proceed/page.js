import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAllOrganization, getOrganizationMembers } from "@/app/_lib/data-services";
import { toDataServiceError } from "@/app/_lib/api-error";
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

    const normalizedRole = String(role).toLowerCase().replace(/[\s_-]/g, "");
    if (["admin", "administrator", "superadmin", "superadministrator"].includes(normalizedRole)) {
        redirect("/dashboard/admin");
    }

    let organizations = [];
    let listedOrganizations = [];
    let loadError = "";

    try {
        const response = await getAllOrganization();
        organizations = getOrganizations(response);

        listedOrganizations = await Promise.all(
            organizations.map(async (item) => {
                const members = await getOrganizationMembers(item.id);
                return {
                    id: item.id,
                    name: item.name,
                    members,
                };
            })
        );
        console.log(listedOrganizations)
    } catch (error) {
        organizations = [];
        listedOrganizations = [];
        loadError = toDataServiceError(error, "Unable to load organizations").message;
    }

    return (
        <ProceedSelection
            organizations={listedOrganizations}
            role={role}
            returnTo={typeof params?.returnTo === "string" ? params.returnTo : ""}
            errorMessage={loadError}
        />
    );
}