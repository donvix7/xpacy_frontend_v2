
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import ProfileForm from "@/app/_components/ProfileForm";
import ProfilePhoto from "@/app/_components/ProfilePhoto";
import UpdatePasswordForm from "@/app/_components/UpdatePasswordForm";
import DeleteProfileButton from "@/app/_components/DeleteProfileButton";
import { getActiveOrganizationRole, getOrganizationById, getUserProfile } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")
    const organizationId = cookieStore.get("organizationId")?.value;
    const [profile, organizationResult, organizationRole] = await Promise.all([
        getUserProfile(token),
        organizationId ? getOrganizationById(organizationId) : Promise.resolve(null),
        getActiveOrganizationRole(),
    ]);
    const organization = organizationResult?.organization || organizationResult?.data?.organization || organizationResult?.data || organizationResult;

    return (
        <div className="px-6 pt-6 lg:pb-[109px] pb-12">
            <MobileDashboardHeader/>
            <div className="flex flex-col gap-12 lg:max-w-[796px] lg:mx-auto lg:px-6 w-full">
                <Section title={"Profile Photo"}>
                    <ProfilePhoto
                        profile={profile}
                        organizationId={organizationId}
                        organizationRole={organizationRole}
                        organizationName={organization?.name}
                    />
                </Section>
                <Section title={"Personal Information"}>
                    <ProfileForm profile={profile}/>
                </Section>
                <Section title={"Account Security"}>
                    <UpdatePasswordForm/>
                </Section>
                <Section title="Danger Zone">
                    <DeleteProfileButton />
                </Section>
            </div>
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
