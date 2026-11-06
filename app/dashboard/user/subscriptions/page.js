import Link from "next/link";

export default async function SubscriptionsPage({ searchParams }) {
    const params = await searchParams;
    const returnTo = typeof params?.returnTo === "string" && params.returnTo.startsWith("/dashboard/user/create-organization")
        ? params.returnTo
        : "/dashboard/user/create-organization";

    return (
        <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
            <div>
                <p className="text-3xl font-bold text-primary">Organization subscription</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">A subscription is required before organization setup can be completed.</p>
            </div>
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
                <h1 className="text-lg font-semibold text-gray-900">Checkout needs billing details</h1>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                    No organization subscription plans or checkout endpoint are configured in this app yet. Your organization details remain saved in this browser; once checkout is connected, you can subscribe here and return to finish setup.
                </p>
                <Link href={returnTo} className="mt-5 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                    Return to organization setup
                </Link>
            </section>
        </main>
    );
}
