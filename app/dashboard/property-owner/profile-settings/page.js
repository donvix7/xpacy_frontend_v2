import LocationForm from "@/app/_components/LocationForm";
import ProfileForm from "@/app/_components/ProfileForm";
import ProfilePhoto from "@/app/_components/ProfilePhoto";
import UpdatePasswordForm from "@/app/_components/UpdatePasswordForm";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { getCities, getPropertyOwnerProfile, getUserProfile } from "@/app/_lib/data-services";
import { updatePropertyOwnerDisplayPicture, updatePropertyOwnerProfile } from "@/app/_lib/action";
import { cookies } from "next/headers";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")
    const results = await Promise.allSettled([getUserProfile(), getCities()])
    const dataErrorMessages = getSettledErrorMessages(results);
    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const cities = results[1].status === "fulfilled" ? results[1].value : [];
    return (
        <div className="p-2">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Account Settings</p>
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