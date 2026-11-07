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

export default async function SidebarHeader({ role = "user", isOrganizationAdmin = false }) {
    const cookieStore = await cookies();
    const organizationRole = normalizeOrganizationRole(cookieStore.get("organizationRole")?.value);
    const activeRole = organizationRoleToDashboardRole[organizationRole] || role;
    const organizationRoleIsAdmin = ["admin", "organizationadmin", "organizationadministrator", "organizationowner", "orgadmin", "owner"].includes(organizationRole);
    const activeOrganizationAdmin = isOrganizationAdmin || organizationRoleIsAdmin;
    const organizations = activeOrganizationAdmin && activeRole === "property-owner"
        ? getOrganizationList(await getAllOrganization())
        : [];
    const activeOrganizationId = cookieStore.get("organizationId")?.value || "";
    return (
        <div className="sticky top-0 z-[10000] flex items-center justify-between border-b border-primary-200 bg-primary-50 px-3 py-3 md:px-6">
            <DashboardHeading />
            <Suspense fallback={<div className="h-8 w-8" />}>
                <MobileNav isSidebar={true} role={activeRole} isOrganizationAdmin={activeOrganizationAdmin} />
            </Suspense>
            
            <div className="flex gap-2 md:gap-4 items-center relative">
                {/* Static Navigations hoisted out of Suspense to ensure they always load instantly */}
                {activeRole === "user" && (
                    <>
                        <Link href="/dashboard/user/create-organization" className="px-4 py-2 rounded-lg bg-primary hidden lg:flex items-center justify-center text-white font-mono font-bold whitespace-nowrap">Create Organization</Link>
                        <Link href="/book-service" className="p-2 px-4 rounded-lg bg-primary hidden lg:flex items-center justify-center text-white font-mono font-bold">Book A Service</Link>
                        <div className="w-0.5 h-10 bg-gray-300 hidden lg:block"></div>
                    </>
                )}
                
                {activeRole === "admin" && (
                    <>
                        <Link href="/dashboard/admin/services" className="px-4 py-2 rounded-lg bg-white border border-primary hidden lg:flex items-center justify-center text-primary font-mono font-bold lg:text-base whitespace-nowrap">Manage Service Requests</Link>
                        <Link href="/admin/add-new-property" className="px-4 py-2 rounded-lg bg-primary flex items-center justify-center text-white font-mono font-bold lg:text-base text-sm whitespace-nowrap">Add New Property</Link>
                        <div className="w-0.5 h-10 bg-gray-300 hidden lg:block"></div>
                    </>
                )}
                
                {activeRole === "property-owner" && (
                    <>
                        {activeOrganizationAdmin && <OrganizationSwitcher organizations={organizations} activeOrganizationId={activeOrganizationId} />}
                        {activeOrganizationAdmin && <Link href="/admin/add-new-property" className="px-2 py-2 lg:p-4 rounded-lg bg-primary flex items-center justify-center text-white font-mono font-bold lg:text-base whitespace-nowrap">Add Property</Link>}
                        {activeOrganizationAdmin && <Link href="/property-owner/invite-manager" className="px-2 py-2 lg:p-4 rounded-lg bg-primary flex items-center justify-center text-white font-mono font-bold lg:text-base whitespace-nowrap">Add Manager</Link>}
                        <div className="w-0.5 h-10 bg-gray-300 hidden lg:block"></div>
                    </>
                )}
                {activeRole === "property-manager" && (
                    <>
                        {isValidOrganizationId(activeOrganizationId) && (
                            <ShareOrganizationListings organizationId={activeOrganizationId} inHeader />
                        )}
                        <Link href="/book-service" className="p-4 rounded-lg bg-white border border-primary hidden lg:flex items-center justify-center text-primary font-mono font-bold">New Service Request</Link>
                        <Link href="/property-manager/invite-staff" className="px-2 py-2 lg:p-4 rounded-lg bg-primary flex items-center justify-center text-white font-mono font-bold lg:text-base whitespace-nowrap">Invite staff</Link>
                        <div className="w-0.5 h-10 bg-gray-300 hidden lg:block"></div>
                    </>
                )}
                {activeRole === "facility-manager" && isValidOrganizationId(activeOrganizationId) && (
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

const organizationRoleToDashboardRole = {
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
