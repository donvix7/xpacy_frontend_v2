import { Suspense } from "react";
import Link from "next/link";
import SearchInput from "./SearchInput";
import ProfileDisplay from "./ProfileDisplay";
import DashboardHeading from "./DashboardHeading";
import MobileProfileMenu from "./MobileProfileMenu";
import { getAdminProfile, getPropertyOwnerProfile, getUserProfile } from "../_lib/data-services";
import { cookies } from "next/headers";
import MobileNav from "./MobileNav";
import OrganizationSwitcher from "./OrganizationSwitcher";
import { getAllOrganization } from "../_lib/data-services";
import ShareOrganizationListings from "./ShareOrganizationListings";
import { isValidOrganizationId } from "../_lib/public-navigation";
import { getDashboardRole } from "../_lib/role-routing";
import ThemeToggle from "./ThemeToggle";

export default async function SidebarHeader({ role = "user", isOrganizationAdmin = false }) {
    const cookieStore = await cookies();
    const organizationRole = cookieStore.get("organizationRole")?.value || "";
    const activeRole = getDashboardRole(cookieStore.get("userRole")?.value, organizationRole) || role;
    const normalizedOrganizationRole = normalizeOrganizationRole(organizationRole);
    const organizationRoleIsAdmin = ["admin", "organizationadmin", "organizationadministrator", "organizationowner", "orgadmin", "owner"].includes(normalizedOrganizationRole);
    const activeOrganizationAdmin = isOrganizationAdmin || organizationRoleIsAdmin;
    const canShareListings = !["admin", "administrator", "superadmin", "superadministrator"].includes(normalizeOrganizationRole(cookieStore.get("userRole")?.value))
        && ["property-owner", "property-manager", "facility-manager"].includes(role)
        && ["property-owner", "property-manager", "facility-manager"].includes(activeRole)
        && isValidOrganizationId(cookieStore.get("organizationId")?.value);
    const organizations = activeOrganizationAdmin && activeRole === "property-owner"
        ? getOrganizationList(await getAllOrganization())
        : [];
    const activeOrganizationId = cookieStore.get("organizationId")?.value || "";
    return (
        <div className="sticky top-0 z-[10] flex items-center justify-between gap-3 border-b border-line bg-white px-3 py-3 shadow-[0_1px_2px_rgba(31,58,82,0.05)] md:px-8 lg:py-4">
            <DashboardHeading />
            <Suspense fallback={<div className="h-8 w-8" />}>
                <MobileNav isSidebar={true} role={activeRole} isOrganizationAdmin={activeOrganizationAdmin} />
            </Suspense>
            
            <div className="flex gap-2 md:gap-4 items-center relative">
                <ThemeToggle />
                {/* Static Navigations hoisted out of Suspense to ensure they always load instantly */}
                {activeRole === "user" && (
                    <>
                        <Link href="/dashboard/user/create-organization" className="xp-btn xp-btn-fill hidden text-sm lg:inline-flex">Create Organization</Link>
                        <Link href="/book-service" className="xp-btn xp-btn-fill hidden text-sm lg:inline-flex">Book A Service</Link>
                        <div className="hidden h-10 w-px bg-line lg:block"></div>
                    </>
                )}
                
                {activeRole === "admin" && (
                    <>
                        <Link href="/dashboard/admin/services" className="xp-btn hidden text-sm lg:inline-flex">Manage Service Requests</Link>
                        <Link href="/admin/add-new-property" className="xp-btn xp-btn-fill px-3 py-2 text-sm lg:px-5 lg:py-3 lg:text-[15px]">Add New Property</Link>
                        <div className="hidden h-10 w-px bg-line lg:block"></div>
                    </>
                )}
                
                {activeRole === "property-owner" && (
                    <>
                        {activeOrganizationAdmin && <OrganizationSwitcher organizations={organizations} activeOrganizationId={activeOrganizationId} />}
                        {canShareListings && (
                            <ShareOrganizationListings organizationId={activeOrganizationId} inHeader />
                        )}
                        {activeOrganizationAdmin && <Link href="/admin/add-new-property" className="xp-btn xp-btn-fill px-3 py-2 text-sm lg:px-5 lg:py-3 lg:text-[15px]">Add Property</Link>}
                        {activeOrganizationAdmin && <Link href="/property-owner/invite-manager" className="xp-btn xp-btn-fill px-3 py-2 text-sm lg:px-5 lg:py-3 lg:text-[15px]">Add Manager</Link>}
                        <div className="hidden h-10 w-px bg-line lg:block"></div>
                    </>
                )}
                {activeRole === "property-manager" && (
                    <>
                        {canShareListings && (
                            <ShareOrganizationListings organizationId={activeOrganizationId} inHeader />
                        )}
                        <Link href="/book-service" className="xp-btn hidden text-sm lg:inline-flex">New Service Request</Link>
                        <Link href="/property-manager/invite-staff" className="xp-btn xp-btn-fill px-3 py-2 text-sm lg:px-5 lg:py-3 lg:text-[15px]">Invite staff</Link>
                        <div className="hidden h-10 w-px bg-line lg:block"></div>
                    </>
                )}
                {activeRole === "facility-manager" && canShareListings && (
                    <ShareOrganizationListings organizationId={activeOrganizationId} inHeader />
                )}

                <Suspense fallback={<HeaderSkeleton />}>
                    <ProfileWrapper role={activeRole} />
                </Suspense>
            </div>
        </div>
    );
}

function normalizeOrganizationRole(role) {
    return String(role || "").trim().toLowerCase().replace(/[\s_-]/g, "");
}

function getOrganizationList(payload) {
    return [payload, payload?.data, payload?.organizations, payload?.data?.organizations, payload?.items]
        .find(Array.isArray) || [];
}

async function ProfileWrapper({ role }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    let profile;
    if (["property-owner", "property-manager", "facility-manager"].includes(role)) {
        profile = await getPropertyOwnerProfile(token);
    } else if (role === "admin") {
        profile = await getAdminProfile(token);
    } else {
        profile = await getUserProfile(token);
    }

    return (
        <>
            <ProfileDisplay role={role} profile={profile} />
            <MobileProfileMenu profile={profile} role={role} />
        </>
    );
}

function HeaderSkeleton() {
    return (
        <div className="flex gap-4 items-center opacity-50 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full lg:block hidden"></div>
            <div className="w-24 h-5 bg-gray-200 rounded-md lg:block hidden"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full lg:hidden block"></div>
        </div>
    );
}
