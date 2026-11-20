import Link from "next/link";
import {
    ChevronLeft,
    CreditCard,
    CalendarDays,
    Layers,
    Building2,
    Boxes,
    Home,
    Users,
    Sparkles,
    ArrowRightLeft,
    RefreshCw,
    AlertTriangle,
    Coins,
} from "lucide-react";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";
import { getAccountSubscriptions } from "@/app/_lib/data-services";
import SubscriptionActions from "@/app/_components/SubscriptionActions";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function formatDate(v) {
    if (!v) return "—";
    try {
        return new Date(v).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return String(v);
    }
}

function formatPrice(amount, currency = "NGN") {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "—";
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
        }).format(n);
    } catch {
        return `${currency} ${n.toLocaleString()}`;
    }
}

function daysLeft(endDate) {
    if (!endDate) return null;
    const ms = new Date(endDate).getTime() - Date.now();
    if (Number.isNaN(ms)) return null;
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default async function SubscriptionPage() {
    const results = await Promise.allSettled([getAccountSubscriptions()]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const raw = results[0].status === "fulfilled" ? results[0].value : null;

    /* ---------- Normalize response ---------- */
    const subscription =
        raw?.subscription ?? raw?.data?.subscription ?? raw?.data ?? null;
    const plan = subscription?.plan ?? null;
    const limits = raw?.limits ?? {};
    const ownedOrganizationCount = raw?.ownedOrganizationCount ?? 0;
    const canCreateOrganization = raw?.canCreateOrganization ?? false;

    const hasSubscription = !!subscription;

    const interval = subscription?.interval ?? plan?.interval ?? "MONTHLY";
    const status = subscription?.status ?? (hasSubscription ? "ACTIVE" : "NONE");
    const isActive = String(status).toUpperCase() === "ACTIVE";
    const isExpiringSoon = (() => {
        const d = daysLeft(subscription?.endDate);
        return d !== null && d <= 7 && d >= 0;
    })();

    const remainingDays = daysLeft(subscription?.endDate);

    const priceForInterval = (() => {
        if (!plan) return null;
        if (interval === "MONTHLY") return plan.monthlyPrice;
        if (interval === "QUARTERLY") return plan.quarterlyPrice;
        if (interval === "YEARLY") return plan.yearlyPrice;
        return null;
    })();

    const currency = plan?.currency ?? limits?.currency ?? "NGN";

    /* ---------- Hero stats ---------- */
    const heroStats = hasSubscription
        ? [
              {
                  label: "Plan",
                  value: plan?.name ?? "—",
                  hint: plan?.planType ?? "",
              },
              {
                  label: "Billing",
                  value: interval,
                  hint: `${formatPrice(priceForInterval, currency)} / cycle`,
              },
              {
                  label: "Status",
                  value: status,
                  hint:
                      remainingDays !== null
                          ? `${remainingDays} day${
                                remainingDays === 1 ? "" : "s"
                            } left`
                          : "—",
              },
              {
                  label: "Renews on",
                  value: formatDate(subscription?.endDate),
                  hint: `Started ${formatDate(subscription?.startDate)}`,
              },
          ]
        : [
              { label: "Plan", value: "None", hint: "No active subscription" },
              { label: "Billing", value: "—", hint: "—" },
              { label: "Status", value: "Inactive", hint: "—" },
              { label: "Renews on", value: "—", hint: "—" },
          ];

    /* ---------- Limit rows ---------- */
    const limitRows = [
        {
            icon: Building2,
            label: "Organizations",
            value: limits?.maxOrganizations,
            sub: `${ownedOrganizationCount} used`,
        },
        {
            icon: Home,
            label: "Properties",
            value: limits?.maxProperties,
        },
        {
            icon: Boxes,
            label: "Buildings",
            value: limits?.maxBuildings,
        },
        {
            icon: Users,
            label: "Units",
            value: limits?.maxUnits,
        },
    ];

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to dashboard
            </Link>

            {/* ---------- Hero ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Account billing
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                {hasSubscription
                                    ? plan?.name
                                        ? `${plan.name} plan`
                                        : "Subscription"
                                    : "Subscription"}
                            </h1>
                            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                                {hasSubscription
                                    ? `You are on the ${
                                          plan?.name ?? "current"
                                      } plan, billed ${String(
                                          interval
                                      ).toLowerCase()}. Manage renewals, switch plans, or review limits below.`
                                    : "You do not have an active subscription yet. Choose a plan to unlock property and organization limits."}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {hasSubscription && isActive && (
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                                        isExpiringSoon
                                            ? "bg-amber-500/15 text-amber-300"
                                            : "bg-emerald-500/15 text-emerald-300"
                                    }`}
                                >
                                    <span className="h-1 w-1 rounded-full bg-current" />
                                    {isExpiringSoon
                                        ? "Expiring soon"
                                        : "Active"}
                                </span>
                            )}
                            {!hasSubscription && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-red-300">
                                    <span className="h-1 w-1 rounded-full bg-current" />
                                    No active plan
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats grid */}
                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {heroStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4"
                            >
                                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                                    {stat.label}
                                </dt>
                                <dd className="mt-1 truncate text-[18px] font-semibold leading-tight tracking-[-0.3px] text-white tabular-nums sm:text-[20px]">
                                    {stat.value}
                                </dd>
                                <p className="mt-1 truncate text-[11.5px] text-side-mute">
                                    {stat.hint}
                                </p>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* ---------- Limits ---------- */}
            {hasSubscription && (
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3">
                        <div className="flex items-center gap-2">
                            <Layers
                                className="h-4 w-4 text-primary"
                                aria-hidden="true"
                            />
                            <h2 className="text-[13.5px] font-semibold text-ink">
                                Plan limits
                            </h2>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-gray-700">
                            <span className="h-1 w-1 rounded-full bg-current" />
                            {currency}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 sm:p-6">
                        {limitRows.map((row) => {
                            const Icon = row.icon;
                            return (
                                <div
                                    key={row.label}
                                    className="rounded-xl border border-gray-100 bg-gray-50/40 p-3.5"
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            className="h-3.5 w-3.5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                        <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-500">
                                            {row.label}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[20px] font-semibold leading-tight text-ink tabular-nums">
                                        {row.value ?? "—"}
                                    </p>
                                    {row.sub && (
                                        <p className="mt-0.5 text-[11px] text-gray-500">
                                            {row.sub}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {canCreateOrganization ? (
                        <div className="border-t border-gray-100 bg-emerald-50/40 px-5 py-3 text-[11.5px] text-emerald-800 sm:px-6">
                            You can create {limits?.maxOrganizations ?? "more"}{" "}
                            organizations on this plan.
                        </div>
                    ) : (
                        <div className="flex items-start gap-2 border-t border-gray-100 bg-amber-50/40 px-5 py-3 text-[11.5px] text-amber-800 sm:px-6">
                            <AlertTriangle
                                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                            />
                            <span>
                                You have reached your organization limit on this
                                plan. Upgrade to add more.
                            </span>
                        </div>
                    )}
                </section>
            )}

            {/* ---------- Subscription actions ---------- */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3">
                    <div className="flex items-center gap-2">
                        <CreditCard
                            className="h-4 w-4 text-primary"
                            aria-hidden="true"
                        />
                        <h2 className="text-[13.5px] font-semibold text-ink">
                            {hasSubscription
                                ? "Manage subscription"
                                : "Subscribe to a plan"}
                        </h2>
                    </div>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
                    {/* Renew */}
                    <div className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/40 p-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary">
                                <RefreshCw
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                            </span>
                            <h3 className="text-[13.5px] font-semibold text-ink">
                                Renew subscription
                            </h3>
                        </div>
                        <p className="text-[11.5px] leading-relaxed text-gray-600">
                            Extend your current plan by one billing cycle.
                        </p>
                        {hasSubscription && plan?.id ? (
                            <SubscriptionActions
                                action="renew"
                                planId={plan.id}
                                billingInterval={interval}
                                paymentMethod="GATEWAY"
                            >
                                <button
                                    type="button"
                                    className="mt-auto inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-primary-800"
                                >
                                    <RefreshCw
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    Renew now
                                </button>
                            </SubscriptionActions>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="mt-auto inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-gray-100 px-3.5 py-2 text-[12px] font-semibold text-gray-400"
                            >
                                <RefreshCw
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                Renew now
                            </button>
                        )}
                    </div>

                    {/* Switch */}
                    <div className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/40 p-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                <ArrowRightLeft
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                            </span>
                            <h3 className="text-[13.5px] font-semibold text-ink">
                                Switch plan
                            </h3>
                        </div>
                        <p className="text-[11.5px] leading-relaxed text-gray-600">
                            Move to a different tier. Prorated charges may
                            apply.
                        </p>
                        {hasSubscription && plan?.id ? (
                            <SubscriptionActions
                                action="switch"
                                planId={plan.id}
                                billingInterval={interval}
                                paymentMethod="GATEWAY"
                            >
                                <button
                                    type="button"
                                    className="mt-auto inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-[12px] font-semibold text-amber-800 transition-colors hover:bg-amber-100"
                                >
                                    <ArrowRightLeft
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    Switch plan
                                </button>
                            </SubscriptionActions>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="mt-auto inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-gray-100 px-3.5 py-2 text-[12px] font-semibold text-gray-400"
                            >
                                <ArrowRightLeft
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                Switch plan
                            </button>
                        )}
                    </div>

                    {/* Subscribe */}
                    <div className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/40 p-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <Sparkles
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                            </span>
                            <h3 className="text-[13.5px] font-semibold text-ink">
                                {hasSubscription
                                    ? "Subscribe again"
                                    : "Subscribe"}
                            </h3>
                        </div>
                        <p className="text-[11.5px] leading-relaxed text-gray-600">
                            {hasSubscription
                                ? "Start a new subscription on any available plan."
                                : "Pick a plan to unlock all features."}
                        </p>
                        {plan?.id ? (
                            <SubscriptionActions
                                action="subscribe"
                                planId={plan.id}
                                billingInterval={interval}
                                paymentMethod="GATEWAY"
                            >
                                <button
                                    type="button"
                                    className="mt-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-emerald-700"
                                >
                                    <Sparkles
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    Subscribe
                                </button>
                            </SubscriptionActions>
                        ) : (
                            <Link
                                href="/subscriptions"
                                className="mt-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-emerald-700"
                            >
                                <Sparkles
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                Browse plans
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* ---------- Billing metadata ---------- */}
            {hasSubscription && (
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3">
                        <div className="flex items-center gap-2">
                            <CalendarDays
                                className="h-4 w-4 text-primary"
                                aria-hidden="true"
                            />
                            <h2 className="text-[13.5px] font-semibold text-ink">
                                Billing details
                            </h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-left text-[12.5px]">
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    {
                                        label: "Subscription ID",
                                        value: subscription.id,
                                        mono: true,
                                    },
                                    {
                                        label: "Plan ID",
                                        value: plan?.id,
                                        mono: true,
                                    },
                                    {
                                        label: "Plan type",
                                        value: plan?.planType,
                                    },
                                    {
                                        label: "Interval",
                                        value: interval,
                                    },
                                    {
                                        label: "Status",
                                        value: status,
                                    },
                                    {
                                        label: "Start date",
                                        value: formatDate(
                                            subscription.startDate
                                        ),
                                    },
                                    {
                                        label: "End date",
                                        value: formatDate(
                                            subscription.endDate
                                        ),
                                    },
                                    {
                                        label: "Payments recorded",
                                        value:
                                            subscription?._count?.payments ??
                                            "—",
                                    },
                                ].map((row) => (
                                    <tr
                                        key={row.label}
                                        className="transition-colors hover:bg-primary-50/40"
                                    >
                                        <td className="whitespace-nowrap px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500 sm:px-6">
                                            {row.label}
                                        </td>
                                        <td
                                            className={`px-5 py-3 text-ink sm:px-6 ${
                                                row.mono
                                                    ? "font-mono text-[11.5px] font-semibold"
                                                    : "text-[12.5px] font-medium"
                                            }`}
                                        >
                                            {row.value ?? "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* ---------- No-subscription empty state ---------- */}
            {!hasSubscription && (
                <section className="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white">
                    <div className="px-5 py-10 text-center sm:px-6">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <CreditCard
                                className="h-6 w-6 text-gray-400"
                                aria-hidden="true"
                            />
                        </div>
                        <h2 className="mt-3 text-[15px] font-semibold text-ink">
                            No active subscription
                        </h2>
                        <p className="mx-auto mt-1 max-w-sm text-[12.5px] text-gray-500">
                            Subscribe to a plan to unlock properties, buildings,
                            and organization limits.
                        </p>
                        <Link
                            href="/subscriptions"
                            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-primary-800"
                        >
                            <Coins
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            />
                            Browse plans
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
}