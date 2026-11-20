import { cookies } from "next/headers";
import Link from "next/link";
import { getUserProfile } from "../_lib/data-services";
import Image from "next/image";
import { getDashboardRole, getDashboardPath } from "../_lib/role-routing";

const MobileHeaderCta = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const userProfile = await getUserProfile();
    const profile = userProfile;
    const role = cookieStoreRole(cookieStore);
    const dashboardRole = getDashboardRole(role, cookieStore.get("organizationRole")?.value) || "user";

    return (
        <>
            {token ? (
                <>
                    <li className="flex items-center justify-between p-3.5 hover:bg-soft transition-colors">
                        <Link href={getDashboardPath(dashboardRole)} className="text-sm font-semibold text-ink">
                            Dashboard
                        </Link>
                        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-line">
                            <Image unoptimized src={profile?.display_picture ? `https://app.xpacy.com/src/upload/display_img/${profile?.display_picture}` : "/avatar.png"} alt="avatar" fill className="rounded-full object-cover" />
                        </div>
                    </li>
                    {dashboardRole === "user" && (
                        <li className="p-3.5 text-sm font-semibold text-side-active hover:bg-soft transition-colors">
                            <Link href="/dashboard/user/create-organization">Create Organization</Link>
                        </li>
                    )}
                </>
            ) : (
                <li className="p-3">
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/auth/log-in"
                            className="xp-btn w-full py-2.5 text-center font-mono text-sm font-medium"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/auth/sign-up"
                            className="xp-btn xp-btn-fill w-full py-2.5 text-center font-mono text-sm font-medium"
                        >
                            Sign Up
                        </Link>
                    </div>
                </li>
            )}
        </>
    );
};

const cookieStoreRole = (cookieStore) => cookieStore.get("userRole")?.value?.toLowerCase().replace(/[\s_-]/g, "");

export default MobileHeaderCta;
