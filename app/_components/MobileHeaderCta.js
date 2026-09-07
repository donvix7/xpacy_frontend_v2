import { cookies } from "next/headers";
import Link from "next/link";
import { getAdminProfile, getUserProfile } from "../_lib/data-services";
import Image from "next/image";

const MobileHeaderCta = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const userProfile = await getUserProfile(token);
    const adminProfile = await getAdminProfile(token);
    const profile = adminProfile || userProfile;

    return (
        <>
            {token ? (
                <li className="py-2 border-b border-primary-100 flex items-center justify-between">
                    <Link href={profile?.role === "admin" ? "/dashboard/admin" : "/dashboard/user"} className="text-primary font-bold">Dashboard</Link>
                    <div className="w-8 h-8 p-0.5 border border-primary-200 rounded-full relative overflow-hidden">
                        <Image unoptimized src={profile?.display_picture ? `https://app.xpacy.com/src/upload/display_img/${profile?.display_picture}` : "/avatar.png"} alt="avatar" fill className="rounded-full object-cover" />
                    </div>
                </li>
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

export default MobileHeaderCta;