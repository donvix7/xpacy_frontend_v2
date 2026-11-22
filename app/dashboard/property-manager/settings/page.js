import Link from "next/link";
import { UserPlus } from "lucide-react";
import LocationForm from "@/app/_components/LocationForm";
import ProfileForm from "@/app/_components/ProfileForm";
import ProfilePhoto from "@/app/_components/ProfilePhoto";
import UpdatePasswordForm from "@/app/_components/UpdatePasswordForm";
import { getCities, getPropertyOwnerProfile } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const organizationId = cookieStore.get("organizationId")?.value;
    const results = await Promise.allSettled([getPropertyOwnerProfile(token), getCities()])
    const dataErrorMessages = getSettledErrorMessages(results);
    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const cities = results[1].status === "fulfilled" ? results[1].value : [];
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <p className="text-2xl font-bold text-gray-900">Account Settings</p>
                {organizationId && (
                    <Link
                        href={`/admin/add-new-owner?organizationId=${encodeURIComponent(organizationId)}&returnTo=${encodeURIComponent("/dashboard/property-manager/settings")}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                    >
                        <UserPlus className="h-4 w-4" aria-hidden="true" />
                        Create owner profile
                    </Link>
                )}
            </div>
            
            <Section title={"Profile Photo"}>
                <ProfilePhoto profile={profile}/>
            </Section>
            <Section title={"Personal Information"}>
                <ProfileForm profile={profile}/>
            </Section>
            <Section title={"Account Security"}>
                <UpdatePasswordForm/>
            </Section>
            <Section title={"Location Preference"}>
                <LocationForm cities={cities} profile={profile}/>
            </Section>
        </div>
    )
}


const Section = ({ children, title }) => {
    return (
        <section className="flex flex-col p-6 gap-8 rounded-lg border-2 bg-white border-primary-200">
            <p className="lg:text-md text-base text-black">{title}</p>
            {children}
        </section>
    )
} 