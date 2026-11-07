import Link from "next/link";
import { cookies } from "next/headers";
import CreateOrganizationForm from "@/app/_components/CreateOrganizationForm";

const planNames = { core: "Core", growth: "Growth", enterprise: "Enterprise" };

export default async function CreateOrganizationPage() {
  const cookieStore = await cookies();
  const planId = cookieStore.get("organizationSubscriptionPlan")?.value || "";
  const selectedPlan = planNames[planId] ? planId : "";

  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/dashboard/user" className="w-fit text-sm font-semibold text-gray-500 hover:text-primary">← Back to dashboard</Link>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary-500">Organization setup</p>
        <h1 className="mt-1 text-3xl font-bold text-primary">Create your organization</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Add your organization details. Choose a subscription plan before you can finish setup.</p>
      </div>
      <CreateOrganizationForm selectedPlan={selectedPlan} />
    </div>
  );
}
