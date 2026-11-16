import FaqSection from "@/app/_components/FaqSection";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import AdminFaqsSummary from "@/app/_components/AdminFaqsSummary";
import { getFaqs } from "@/app/_lib/data-services";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page() {
    const results = await Promise.allSettled([getFaqs()]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const faqs = results[0].status === "fulfilled" ? results[0].value : [];
    return (
        <div className="p-2">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">FAQs</p>
            
            <AdminFaqsSummary faqs={faqs} />

            <DashboardGridItem title={"Frequently Asked Questions"}>
                <FaqSection faqWidth="w-full" />
            </DashboardGridItem>
        </div>
    );
}
