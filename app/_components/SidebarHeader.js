import { Suspense } from "react";
import Link from "next/link";
import SearchInput from "./SearchInput";
import ProfileDisplay from "./ProfileDisplay";
import DashboardHeading from "./DashboardHeading";
import MobileProfileMenu from "./MobileProfileMenu";
import { getPropertyOwnerProfile, getUserProfile } from "../_lib/data-services";
import { cookies } from "next/headers";
import MobileNav from "./MobileNav";
import { UserPlus } from "lucide-react";
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
    const activeOrganizationId = cookieStore.get("organizationId")?.value || "";
    const canCreateOwner = !["admin", "administrator", "superadmin", "superadministrator"].includes(normalizeOrganizationRole(cookieStore.get("userRole")?.value))
        && ["property-owner", "property-manager", "facility-manager"].includes(role)
        && ["property-owner", "property-manager", "facility-manager"].includes(activeRole)
        && isValidOrganizationId(activeOrganizationId);
    const createOwnerHref = (returnTo) =>
        `/admin/add-new-owner?organizationId=${encodeURIComponent(activeOrganizationId)}&returnTo=${encodeURIComponent(returnTo)}`;
    const createOwnerBtnClass =
        "group inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-900 px-3.5 py-2.5 font-sans text-sm font-semibold text-white transition-all hover:bg-primary-700";
    return (
        <div className=" top-0 z-[10] flex items-center justify-between gap-3 border-b border-line bg-card px-3 py-3 shadow-[0_1px_2px_rgba(31,58,82,0.05)] md:px-8 lg:py-4">
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
                        <Link href="/auth/proceed" className="xp-btn xp-btn-fill hidden text-sm lg:inline-flex">Switch organization</Link>
                        <div className="hidden h-10 w-px bg-line lg:block"></div>
                    </>
                )}
                
                {activeRole === "admin" && (
                    <>
                        <div className="hidden h-10 w-px bg-line lg:block"></div>
                    </>
                )}
                
                {activeRole === "property-owner" && (
                    <>
                        <Link href="/auth/proceed" className="xp-btn xp-btn-fill hidden text-sm lg:inline-flex">Switch organization</Link>
                        {canCreateOwner && (
                            <Link href={createOwnerHref("/dashboard/property-owner")} className={createOwnerBtnClass}>
                                <UserPlus size={16} aria-hidden="true" />
                                <span className="hidden sm:inline">Create Owner</span>
                                <span className="sm:hidden">Owner</span>
                            </Link>
                        )}
                        {activeOrganizationAdmin && <Link href="/admin/add-new-manager" className="xp-btn xp-btn-fill px-3 py-2 text-sm lg:px-5 lg:py-3 lg:text-[15px]">Add Manager</Link>}
                        <div className="hidden h-10 w-px bg-line lg:block"></div>
                    </>
                )}
                {activeRole === "property-manager" && (
                    <>
                        <Link href="/auth/proceed" className="xp-btn xp-btn-fill hidden text-sm lg:inline-flex">Switch organization</Link>
                        {canCreateOwner && (
                            <Link href={createOwnerHref("/dashboard/property-manager/overview")} className={createOwnerBtnClass}>
                                <UserPlus size={16} aria-hidden="true" />
                                <span className="hidden sm:inline">Create Owner</span>
                                <span className="sm:hidden">Owner</span>
                            </Link>
                        )}
                        <Link href="/book-service" className="xp-btn hidden text-sm lg:inline-flex">New Service Request</Link>
                        <Link href="/property-manager/invite-staff" className="xp-btn xp-btn-fill px-3 py-2 text-sm lg:px-5 lg:py-3 lg:text-[15px]">Invite staff</Link>
                        <div className="hidden h-10 w-px bg-line lg:block"></div>
                    </>
                )}
                {activeRole === "facility-manager" && (
                    <>
                        <Link href="/auth/proceed" className="xp-btn xp-btn-fill hidden text-sm lg:inline-flex">Switch organization</Link>
                        {canCreateOwner && (
                            <Link href={createOwnerHref("/dashboard/facility-manager/overview")} className={createOwnerBtnClass}>
                                <UserPlus size={16} aria-hidden="true" />
                                <span className="hidden sm:inline">Create Owner</span>
                                <span className="sm:hidden">Owner</span>
                            </Link>
                        )}
                        <div className="hidden h-10 w-px bg-line lg:block"></div>
                    </>
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

async function ProfileWrapper({ role }) {


    let profile;
    if (["property-owner", "property-manager", "facility-manager"].includes(role)) {
        profile = await getUserProfile();
    } else if (role === "admin") {
        profile = await getUserProfile();
    } else {
        profile = await getUserProfile();
    }

    return (
        <ProfileDisplay role={role} profile={profile} />
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
