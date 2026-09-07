import FaqSection from "@/app/_components/FaqSection";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import SupportForm from "@/app/_components/SupportForm"
import { getUserProfile } from "@/app/_lib/data-services";
import { cookies } from "next/headers";


export default async function Page() {
      const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const profile = await getUserProfile(token)
    return (
        <div className="px-6 pt-6 pb-12 lg:pb-[109px] ">
            <MobileDashboardHeader/>
            <div className="flex flex-col gap-12 lg:max-w-[796px] lg:mx-auto lg:px-6 w-full">
                <Section title={"Need Help?"} subtitle={"Have a question or need assistance? Fill out the form below, and we'll get back to you shortly."}>
                    <SupportForm profile={profile}/>
                </Section>
                <Section title={"Personal Information"}>
                    <FaqSection faqWidth={"w-full"}/>
                </Section>

            </div>
        </div>
    )
}



const Section = ({ children, title, subtitle }) => {
    return (
        <section className="flex flex-col p-6 lg:gap-8 gap-12 rounded-lg border-2 bg-white border-primary-200">
            <div className="space-y-4">
                <h3 className="lg:text-md text-base text-black">{title}</h3>
                {subtitle && <p className="text-neutral-800 font-mono">{subtitle}</p>}
            </div>
            {children}
        </section>
    )
}