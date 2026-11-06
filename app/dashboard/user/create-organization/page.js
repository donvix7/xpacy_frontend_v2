import Link from "next/link";
import { cookies } from "next/headers";
import CreateOrganizationForm from "@/app/_components/CreateOrganizationForm";

export default async function Page() {
    const cookieStore = await cookies();
    const subscribed = cookieStore.get("organizationSubscription")?.value === "active";

    return (
        <div className="space-y-6 p-3 sm:p-6">
            <div>
                <p className="text-3xl font-bold text-primary">Create an organization</p>
                <p className="mt-2 text-sm text-gray-600">Set up your organization, subscribe, then finish creating it.</p>
            </div>
            {!subscribed && (
                <div className="rounded-xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-900">
                    Your organization details will be saved in this browser while you complete the subscription step.
                </div>
            )}
            {subscribed && <p className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">Subscription confirmed. Review your details and finish creating the organization.</p>}
            <CreateOrganizationForm subscribed={subscribed} />
            <Link href="/dashboard/user" className="inline-flex text-sm font-medium text-gray-500 hover:text-primary">Back to dashboard</Link>
        </div>
    );
}
