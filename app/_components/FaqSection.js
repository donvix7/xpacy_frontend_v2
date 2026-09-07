import { getFaqs } from "../_lib/data-services";
import FaqToggle from "./FaqToggle";


export default async function FaqSection({faqWidth="w-full md:w-3/4"}){
  const faqs = await getFaqs();
    return (
      <div className="container flex flex-col items-center space-y-6 ">
        {faqs?.map((faq) => (
          <FaqToggle key={faq.id} question={faq.question} answer={faq.answer} width={faqWidth} />
        ))}
      </div>
    );
}