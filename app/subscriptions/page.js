import { getSubscriptionList } from "../_lib/data-services";
import AppHeader from "../_components/AppHeader";
import Footer from "../_components/Footer";
import FaqSection from "../_components/FaqSection";
import SubscriptionClient from "./SubscriptionClient";

export const metadata = {
  title: "Subscription Plans | Xpacy",
  description:
    "Choose the perfect Xpacy subscription plan for your property management needs. Transparent pricing, powerful features, and dedicated support.",
};

export default async function SubscriptionPage() {
  const subscriptionPlans = await getSubscriptionList();
  console.log(subscriptionPlans)

  return (
    <SubscriptionClient
      subscriptionPlans={subscriptionPlans}
      header={<AppHeader />}
      footer={<Footer />}
      faqSection={<FaqSection />}
    />
  );
}
