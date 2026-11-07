import { cookies } from "next/headers";
import OrganizationSubscriptionPlans from "@/app/_components/OrganizationSubscriptionPlans";

function getSafeReturnTo(value) {
  return typeof value === "string" && value.startsWith("/dashboard/user/create-organization")
    ? value
    : "/dashboard/user/create-organization";
}

export default async function SubscriptionsPage({ searchParams }) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  const selectedPlan = cookieStore.get("organizationSubscriptionPlan")?.value || "";

  return <OrganizationSubscriptionPlans
    returnTo={getSafeReturnTo(params?.returnTo)}
    selectedPlan={selectedPlan}
    hasError={params?.error === "invalid-plan"}
    showBackToDashboard
  />;
}
