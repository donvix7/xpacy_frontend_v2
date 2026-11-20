import Link from "next/link";
import ProfileDisplay from "./ProfileDisplay";
import { cookies } from "next/headers";
import { getUserProfile } from "../_lib/data-services";
import { getDashboardRole } from "../_lib/role-routing";

const HeaderCta = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    let userProfile = null;
    let adminProfile = null;

    if (token) {
        try {
            [userProfile, adminProfile] = await Promise.all([
                getUserProfile(token).catch(() => null),
            ]);
        } catch {
            userProfile = null;
            adminProfile = null;
        }
    }

    const role = adminProfile || userProfile;
    const dashboardRole = getDashboardRole(
        cookieStore.get("userRole")?.value || role?.role,
        cookieStore.get("organizationRole")?.value
    );

    if (token) {
        return <ProfileDisplay role={dashboardRole || role?.role || "user"} profile={role} />;
    }

    return (
        <div className="hidden lg:flex items-center gap-2.5">
            <Link
                href="/auth/log-in"
                className="xp-btn px-4 py-2 font-mono text-[13px] font-medium transition-colors hover:bg-soft"
            >
                Log in
            </Link>
            <Link
                href="/auth/sign-up"
                className="xp-btn xp-btn-fill px-4 py-2 font-mono text-[13px] font-medium transition-opacity hover:opacity-90"
            >
                Sign up
            </Link>
        </div>
    );
};

export default HeaderCta;
