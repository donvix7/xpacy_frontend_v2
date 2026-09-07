
import LocationForm from "@/app/_components/LocationForm";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import ProfileForm from "@/app/_components/ProfileForm";
import ProfilePhoto from "@/app/_components/ProfilePhoto";
import UpdatePasswordForm from "@/app/_components/UpdatePasswordForm";
import { getCities, getUserProfile } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")
    const [profile, cities] = await Promise.all([getUserProfile(token), getCities()])
    return (
        <div className="px-6 pt-6 lg:pb-[109px] pb-12">
            <MobileDashboardHeader/>
            <div className="flex flex-col gap-12 lg:max-w-[796px] lg:mx-auto lg:px-6 w-full">
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