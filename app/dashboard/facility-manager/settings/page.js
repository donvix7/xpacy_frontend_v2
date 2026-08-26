import LocationForm from "@/app/_components/LocationForm";
import ProfileForm from "@/app/_components/ProfileForm";
import ProfilePhoto from "@/app/_components/ProfilePhoto";
import UpdatePasswordForm from "@/app/_components/UpdatePasswordForm";
import { getCities, getPropertyOwnerProfile } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")
    const [profile, cities] = await Promise.all([getPropertyOwnerProfile(token), getCities()])
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <h1 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-4">Account Settings</h1>
            
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
            <h3 className="lg:text-md text-base text-black">{title}</h3>
            {children}
        </section>
    )
} 