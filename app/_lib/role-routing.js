const normalizeRole = (role) => String(role || "").trim().toLowerCase().replace(/[\s_-]/g, "");

const dashboardRoleByUserRole = {
    user: "user",
    admin: "admin",
    administrator: "admin",
    superadmin: "admin",
    superadministrator: "admin",
    propertyowner: "property-owner",
    propertymanager: "property-manager",
    facilitymanager: "facility-manager",
};

const dashboardRoleByOrganizationRole = {
    facilitymanager: "facility-manager",
    propertymanager: "property-manager",
    propertyowner: "property-owner",
    organizationadmin: "property-owner",
    organizationadministrator: "property-owner",
    organizationowner: "property-owner",
    orgadmin: "property-owner",
    owner: "property-owner",
    admin: "property-owner",
    tenant: "user",
};

export function getDashboardRole(userRole, organizationRole) {
    const normalizedUserRole = normalizeRole(userRole);
    const baseDashboardRole = dashboardRoleByUserRole[normalizedUserRole];
    if (baseDashboardRole === "admin") return baseDashboardRole;

    return dashboardRoleByOrganizationRole[normalizeRole(organizationRole)]
        || baseDashboardRole
        || null;
}

export function getDashboardPath(role) {
    const paths = {
        user: "/dashboard/user",
        admin: "/dashboard/admin",
        "property-owner": "/dashboard/property-owner",
        "property-manager": "/dashboard/property-manager",
        "facility-manager": "/dashboard/facility-manager",
    };
    return paths[role] || paths.user;
}
