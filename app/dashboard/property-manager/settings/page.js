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
    const token = cookieStore.get("token")
    const results = await Promise.allSettled([getPropertyOwnerProfile(token), getCities()])
    const dataErrorMessages = getSettledErrorMessages(results);
    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const cities = results[1].status === "fulfilled" ? results[1].value : [];
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            <p className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-4">Account Settings</p>
            
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