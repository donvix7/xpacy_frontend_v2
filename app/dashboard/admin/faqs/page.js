import FaqSection from "@/app/_components/FaqSection";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import AdminFaqsSummary from "@/app/_components/AdminFaqsSummary";
import { getFaqs } from "@/app/_lib/data-services";

export default async function Page() {
    const faqs = await getFaqs();
    return (
        <div className="p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">FAQs</h1>
            
            <AdminFaqsSummary faqs={faqs} />

            <DashboardGridItem title={"Frequently Asked Questions"}>
                <FaqSection faqWidth="w-full" />
            </DashboardGridItem>
        </div>
    );
}
