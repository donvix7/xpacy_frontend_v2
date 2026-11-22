import Link from "next/link";
import { UserPlus } from "lucide-react";
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
    const token = cookieStore.get("token");
    const organizationId = cookieStore.get("organizationId")?.value;
    const results = await Promise.allSettled([getUserProfile(), getCities()])
    const dataErrorMessages = getSettledErrorMessages(results);
    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const cities = results[1].status === "fulfilled" ? results[1].value : [];
    return (
        <div className="p-2">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Account Settings</p>
                {organizationId && (
                    <Link
                        href={`/admin/add-new-owner?organizationId=${encodeURIComponent(organizationId)}&returnTo=${encodeURIComponent("/dashboard/property-owner/profile-settings")}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                    >
                        <UserPlus className="h-4 w-4" aria-hidden="true" />
                        Create owner profile
                    </Link>
                )}
            </div>
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