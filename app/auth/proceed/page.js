import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    getAllOrganization,
    getAdminOrganizationMembers,
    getOrganizationMembers,
    getOrganizationSubscription,
    getUserProfile,
} from "@/app/_lib/data-services";
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
    const cookieUserId = cookieStore.get("userId")?.value;
    const cookieEmail = cookieStore.get("userEmail")?.value;

    if (!token || !role) redirect("/auth/log-in");

    const normalizedRole = String(role).toLowerCase().replace(/[\s_-]/g, "");
    if (["admin", "administrator", "superadmin", "superadministrator"].includes(normalizedRole)) {
        redirect("/dashboard/admin");
    }

    let organizations = [];
    let listedOrganizations = [];
    let loadError = "";
    let currentUserId = String(cookieUserId || "").trim();
    let currentUserEmail = String(cookieEmail || "").trim().toLowerCase();

    try {
        const [orgsResponse, profileResponse] = await Promise.allSettled([
            getAllOrganization(),
            getUserProfile(),
        ]);

        if (profileResponse.status === "fulfilled") {
            const rawProfile = profileResponse.value;
            const profileData = rawProfile?.data || rawProfile?.user || rawProfile;
            if (!currentUserId && profileData?.id) {
                currentUserId = String(profileData.id).trim();
            }
            if (!currentUserEmail && profileData?.email) {
                currentUserEmail = String(profileData.email).trim().toLowerCase();
            }
        }

        if (orgsResponse.status === "fulfilled") {
            organizations = getOrganizations(orgsResponse.value);
            listedOrganizations = await Promise.all(
                organizations.map(async (item) => {
                    let members = [];
                    let membersError = "";
                    try {
                        // Use getAdminOrganizationMembers first, as in admin/organizations/[id] page
                        members = await getAdminOrganizationMembers(item.id, 100);
                    } catch {
                        try {
                            members = await getOrganizationMembers(item.id);
                        } catch (err) {
                            members = [];
                            membersError = err?.message || "Failed to load members";
                        }
                    }

                    const rawMembers = Array.isArray(members)
                        ? members
                        : Array.isArray(members?.data)
                          ? members.data
                          : Array.isArray(members?.members)
                            ? members.members
                            : [];

                    // Check what role the current user has in this organization
                    const matchedMember = rawMembers.find((entry) => {
                        const u = entry?.user || entry?.profile || {};
                        const ids = [
                            entry?.userId,
                            entry?.user_id,
                            entry?.id,
                            entry?.member?.userId,
                            entry?.member?.user_id,
                            u?.id,
                            u?._id,
                            u?.userId,
                        ]
                            .filter(Boolean)
                            .map(String);

                        const emails = [
                            entry?.email,
                            entry?.member?.email,
                            u?.email,
                        ]
                            .filter(Boolean)
                            .map((e) => String(e).trim().toLowerCase());

                        return (
                            (currentUserId && ids.includes(currentUserId)) ||
                            (currentUserEmail && emails.includes(currentUserEmail))
                        );
                    });

                    const organizationRole =
                        matchedMember?.role?.name ||
                        matchedMember?.role?.value ||
                        matchedMember?.role ||
                        matchedMember?.organizationRole?.name ||
                        matchedMember?.organizationRole ||
                        matchedMember?.memberRole ||
                        matchedMember?.roleName ||
                        "";

                    const formattedMembers = rawMembers.map((m) => {
                        const u = m?.user || m?.profile || {};
                        const name =
                            [u?.firstName || u?.firstname, u?.lastName || u?.lastname]
                                .filter(Boolean)
                                .join(" ") ||
                            u?.name ||
                            u?.username ||
                            m?.name ||
                            m?.email ||
                            "Member";

                        const memberRole =
                            m?.role?.name ||
                            m?.role?.value ||
                            m?.role ||
                            m?.organizationRole ||
                            m?.memberRole ||
                            m?.roleName ||
                            "Member";

                        return {
                            id: m?.id || m?.userId || u?.id,
                            name,
                            email: u?.email || m?.email || "",
                            role: memberRole,
                            status: m?.status || (m?.isActive === false ? "inactive" : "active"),
                        };
                    });

                    const resolvedOrgRole = organizationRole || item.organizationRole || "";
                    const normalizedOrgRole = String(resolvedOrgRole)
                        .trim()
                        .toLowerCase()
                        .replace(/[\s_-]/g, "");
                    const requiresSubscriptionCheck = [
                        "owner",
                        "organizationowner",
                        "orgowner",
                    ].includes(normalizedOrgRole);

                    const orgSubscription = requiresSubscriptionCheck
                        ? await getOrganizationSubscription(item.id, item).catch(() => ({
                              data: null,
                              plan: null,
                              status: "NONE",
                              isActive: false,
                              isExpired: false,
                              endDate: null,
                          }))
                        : null;

                    return {
                        ...item,
                        id: item.id,
                        name: item.name,
                        organizationRole: resolvedOrgRole,
                        requiresSubscriptionCheck,
                        subscription: orgSubscription,
                        members: formattedMembers,
                        membersError,
                    };
                })
            );
        } else {
            loadError = toDataServiceError(orgsResponse.reason, "Unable to load organizations").message;
        }
    } catch (error) {
        organizations = [];
        listedOrganizations = [];
        loadError = toDataServiceError(error, "Unable to load organizations").message;
    }

    return (
        <ProceedSelection
            organizations={listedOrganizations}
            role={role}
            currentUserId={currentUserId}
            currentUserEmail={currentUserEmail}
            returnTo={typeof params?.returnTo === "string" ? params.returnTo : ""}
            errorMessage={loadError}
        />
    );
}