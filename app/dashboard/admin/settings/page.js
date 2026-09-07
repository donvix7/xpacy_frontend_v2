import DashboardGridItem from "@/app/_components/DashboardGridItems";
import ProfileForm from "@/app/_components/ProfileForm";
import UpdatePasswordForm from "@/app/_components/UpdatePasswordForm";
import { getAdminProfile } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const user = await getAdminProfile(token);

    return (
        <div className="p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Settings</h1>
            <div className="flex flex-col gap-12">
                <DashboardGridItem title={"Edit Profile"}>
                    <ProfileForm user={user} />
                </DashboardGridItem>
                <DashboardGridItem title={"Update Password"}>
                    <UpdatePasswordForm />
                </DashboardGridItem>
            </div>
        </div>
    );
}
