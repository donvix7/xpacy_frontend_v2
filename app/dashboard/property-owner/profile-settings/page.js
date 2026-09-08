import LocationForm from "@/app/_components/LocationForm";
import ProfileForm from "@/app/_components/ProfileForm";
import ProfilePhoto from "@/app/_components/ProfilePhoto";
import UpdatePasswordForm from "@/app/_components/UpdatePasswordForm";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { getCities, getPropertyOwnerProfile } from "@/app/_lib/data-services";
import { updatePropertyOwnerDisplayPicture, updatePropertyOwnerProfile } from "@/app/_lib/action";
import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")
    const [profile, cities] = await Promise.all([getPropertyOwnerProfile(token), getCities()])
    return (
        <div className="p-2">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Account Settings</h1>
            <div className="flex flex-col gap-12">
                <DashboardGridItem title={"Profile Photo"}>
                    <ProfilePhoto profile={profile} uploadAction={updatePropertyOwnerDisplayPicture}/>
                </DashboardGridItem>
                <DashboardGridItem title={"Personal Information"}>
                    <ProfileForm profile={profile} updateAction={updatePropertyOwnerProfile}/>
                </DashboardGridItem>
                <DashboardGridItem title={"Account Security"}>
                    <UpdatePasswordForm/>
                </DashboardGridItem>
                <DashboardGridItem title={"Location Preference"}>
                    <LocationForm cities={cities} profile={profile}/>
                </DashboardGridItem>
            </div>
        </div>
    )
}