import FaqSection from "@/app/_components/FaqSection";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import AdminFaqsSummary from "@/app/_components/AdminFaqsSummary";
import { getFaqs } from "@/app/_lib/data-services";

export default async function Page() {
    const faqs = await getFaqs();
    return (
        <div className="p-2">
            <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">FAQs</p>
            
            <AdminFaqsSummary faqs={faqs} />

            <DashboardGridItem title={"Frequently Asked Questions"}>
                <FaqSection faqWidth="w-full" />
            </DashboardGridItem>
        </div>
    );
}
