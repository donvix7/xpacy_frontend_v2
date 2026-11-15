/**
 * Pure helpers for turning the various member shapes returned by the API into
 * the flat records the membership UI renders. Kept free of server imports so
 * both server pages and server actions can share them.
 */

export function getOrganizationMemberRole(member) {
    const role =
        member?.role?.name || member?.role?.value || member?.role?.code || member?.role
        || member?.organizationRole?.name || member?.organizationRole?.value || member?.organizationRole?.code || member?.organizationRole
        || member?.memberRole?.name || member?.memberRole?.value || member?.memberRole?.code || member?.memberRole
        || member?.membership?.role?.name || member?.membership?.role?.value || member?.membership?.role
        || member?.member?.role?.name || member?.member?.role?.value || member?.member?.role?.code || member?.member?.role
        || member?.member?.organizationRole?.name || member?.member?.organizationRole?.value || member?.member?.organizationRole?.code || member?.member?.organizationRole
        || member?.roleName;
    return typeof role === "string" ? role : "";
}

export function normalizeOrganizationMember(member, index = 0) {
    const user =
        member?.user
        || member?.profile
        || member?.member?.user
        || member?.member?.profile
        || {};
    const name =
        member?.name
        || [user?.firstName || user?.firstname, user?.lastName || user?.lastname].filter(Boolean).join(" ")
        || user?.name
        || user?.username
        || user?.email
        || member?.email
        || `Member ${index + 1}`;

    return {
        id: String(member?.id || member?._id || member?.userId || member?.user_id || index),
        name: String(name),
        email: String(member?.email || user?.email || ""),
        role: getOrganizationMemberRole(member),
    };
}

export function normalizeOrganizationMembers(members) {
    if (!Array.isArray(members)) return [];
    return members.map((member, index) => normalizeOrganizationMember(member, index));
}
