import Link from "next/link";
import ProfileDisplay from "./ProfileDisplay";
import { cookies } from "next/headers";
import { getAdminProfile, getUserProfile } from "../_lib/data-services";

const HeaderCta = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const userProfile = await getUserProfile(token)
    const adminProfile = await getAdminProfile(token)
    const role = adminProfile || userProfile;
    return (
        <>
            {
                token ? <ProfileDisplay role={role?.role || "user"} profile={role} /> : (
                    <div className=" hidden md:flex items-center space-x-5">
                        <Link
                            href="/auth/log-in"
                            className={`bg-white text-primary border border-primary cursor-pointer  px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md`}
                        >
                            Log in
                        </Link>
                        <Link
                            href="/auth/sign-up"
                            className={`bg-primary text-white border border-primary cursor-pointer  px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md`}
                        >
                            Sign up
                        </Link>
                    </div>
                )
            }
        </>
    );
};

export default HeaderCta;