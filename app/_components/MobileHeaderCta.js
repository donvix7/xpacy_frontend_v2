import { cookies } from "next/headers";
import Link from "next/link";
import { getAdminProfile, getUserProfile } from "../_lib/data-services";
import Image from "next/image";
import { getDashboardRole, getDashboardPath } from "../_lib/role-routing";

const MobileHeaderCta = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const userProfile = await getUserProfile(token);
    const adminProfile = await getAdminProfile(token);
    const profile = adminProfile || userProfile;
    const role = cookieStoreRole(cookieStore);
    const dashboardRole = getDashboardRole(role, cookieStore.get("organizationRole")?.value) || "user";

    return (
        <>
            {token ? (
                <>
                    <li className="py-2 border-b border-primary-100 flex items-center justify-between">
                        <Link href={getDashboardPath(dashboardRole)} className="text-primary font-bold">Dashboard</Link>
                        <div className="w-8 h-8 p-0.5 border border-primary-200 rounded-full relative overflow-hidden">
                            <Image unoptimized src={profile?.display_picture ? `https://app.xpacy.com/src/upload/display_img/${profile?.display_picture}` : "/avatar.png"} alt="avatar" fill className="rounded-full object-cover" />
                        </div>
                    </li>
                    {dashboardRole === "user" && <li className="py-2 border-b border-primary-100 font-semibold text-primary"><Link href="/dashboard/user/create-organization">Create Organization</Link></li>}
                </>
            ) : (
                <>
                    <li className="py-2 border-b border-primary-100 text-secondary font-bold">
                        <Link href={"/auth/log-in"}>Log In </Link>
                    </li>
                    <li className="py-2 border-b border-primary-100 text-primary font-bold">
                        <Link href={"/auth/sign-up"}>Sign Up </Link>
                    </li>
                </>
            )}
        </>
    );
};

const cookieStoreRole = (cookieStore) => cookieStore.get("userRole")?.value?.toLowerCase().replace(/[\s_-]/g, "");

export default MobileHeaderCta;
