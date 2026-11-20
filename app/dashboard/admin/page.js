import Link from "next/link";
import {
    getUserNotifications,
    getUserProfile,
    getAllAdminOrganization,
    getAllUsers,
    getAccountSubscriptions,
    getOrganizationIdFromProperty,
    getSubscriptionPlans,
} from "@/app/_lib/data-services";
import SummaryCards from "@/app/_components/SummaryCards";
import OverviewPanel from "@/app/_components/OverviewPanel";
import HeroBand from "@/app/_components/HeroBand";
import AdminPropertyList from "@/app/_components/AdminPropertyList";
import AdminNotificationList from "@/app/_components/AdminNotificationList";
import {
    ArrowUpRight,
    Banknote,
    BellRing,
    Building2,
    CircleAlert,
    CreditCard,
    Layers,
    Plus,
    UserCircle2,
    Users,
    Wrench,
    Package,
    CheckCircle2,
} from "lucide-react";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function ViewAll({ href, label = "View all" }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-ink px-3 py-1.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-soft"
        >
            {label}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
    );
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

function daysLeft(endDate) {
    if (!endDate) return null;
    const ms = new Date(endDate).getTime() - Date.now();
    if (Number.isNaN(ms)) return null;
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function unwrapPlans(result) {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.plans)) return result.plans;
    if (Array.isArray(result?.data?.plans)) return result.data.plans;
    if (Array.isArray(result?.data)) return result.data;
    return [];
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default async function Page() {
    const results = await Promise.allSettled([
        getUserProfile(),
        getAllAdminOrganization(),
        getAllUsers(),
        getUserNotifications(),
        getAccountSubscriptions(),
        getSubscriptionPlans(),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const organizationsRaw =
        results[1].status === "fulfilled" ? results[1].value : null;
    const users = results[2].status === "fulfilled" ? results[2].value : [];
    const notifications = results[3].status === "fulfilled" ? results[3].value : [];
    const subscriptionsRaw =
        results[4].status === "fulfilled" ? results[4].value : null;

    /* ---------- Plans catalog ---------- */
    const subscriptionPlans =
        results[5].status === "fulfilled" ? unwrapPlans(results[5].value) : [];
    const totalPlans = subscriptionPlans.length;
    const activePlans = subscriptionPlans.filter(
        (p) =>
            p?.isActive === true ||
            p?.active === true ||
            String(p?.status || "").toUpperCase() === "ACTIVE"
    ).length;

    /* ---------- Organizations ---------- */
    const organizations = (() => {
        if (!organizationsRaw) return [];
        if (Array.isArray(organizationsRaw)) return organizationsRaw;
        if (Array.isArray(organizationsRaw?.organizations))
            return organizationsRaw.organizations;
        if (Array.isArray(organizationsRaw?.data?.organizations))
            return organizationsRaw.data.organizations;
        if (Array.isArray(organizationsRaw?.data)) return organizationsRaw.data;
        return [];
    })();

    const totalOrganizations = organizations.length;

    /* ---------- Subscription / payments ---------- */
    const subscription =
        subscriptionsRaw?.subscription ??
        subscriptionsRaw?.data?.subscription ??
        subscriptionsRaw?.data ??
        subscriptionsRaw ??
        null;

    const plan = subscription?.plan ?? null;
    const limits = subscriptionsRaw?.limits ?? {};

    const planPrices = plan
        ? {
              monthly: Number(plan.monthlyPrice) || 0,
              quarterly: Number(plan.quarterlyPrice) || 0,
              yearly: Number(plan.yearlyPrice) || 0,
          }
        : { monthly: 0, quarterly: 0, yearly: 0 };

    const activeIntervalPrice = (() => {
        if (!plan) return 0;
        if (subscription?.interval === "MONTHLY") return planPrices.monthly;
        if (subscription?.interval === "QUARTERLY") return planPrices.quarterly;
        if (subscription?.interval === "YEARLY") return planPrices.yearly;
        return planPrices.monthly;
    })();

    const remaining = daysLeft(subscription?.endDate);
    const paymentCount = subscription?._count?.payments ?? 0;

    /* ---------- Properties ---------- */
    const properties = (organizationsRaw?.properties || []).filter(
        (property) => !getOrganizationIdFromProperty(property)
    );
    const totalProperties = properties.length;

    /* ---------- Users ---------- */
    const allUsers = Array.isArray(users) ? users : [];
    const allNotifications = Array.isArray(notifications) ? notifications : [];

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const newUsers = allUsers.filter((user) => {
        const created = new Date(
            user?.createdAt || user?.created_at || user?.date_joined
        );
        return (
            !Number.isNaN(created.getTime()) &&
            now - created.getTime() <= thirtyDays
        );
    }).length;

    const admins = allUsers.filter((u) =>
        ["admin", "superadmin", "super_admin"].includes(
            String(u?.role || "").toLowerCase()
        )
    );
    const owners = allUsers.filter(
        (u) => String(u?.role || "").toLowerCase() === "owner"
    );

    /* ---------- Date ---------- */
    const today = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date());

    const firstName = profile?.username?.split(" ")[0] || "Admin";

    /* ---------- Summary cards ---------- */
    const summaryCards = [
        {
            label: "Total Properties",
            value: totalProperties,
            icon: <Building2 className="h-5 w-5 text-blue-600" />,
            iconBackground: "bg-blue-50",
            accent: "bg-blue-500",
        },
        {
            label: "Organizations",
            value: totalOrganizations,
            icon: <Layers className="h-5 w-5 text-fuchsia-600" />,
            iconBackground: "bg-fuchsia-50",
            accent: "bg-fuchsia-500",
            meta:
                limits?.maxOrganizations != null
                    ? `${limits.maxOrganizations} max on plan`
                    : undefined,
        },
        {
            label: "Total Users",
            value: allUsers.length,
            icon: <Users className="h-5 w-5 text-violet-600" />,
            iconBackground: "bg-violet-50",
            accent: "bg-violet-500",
            meta: `${admins.length} admin${admins.length === 1 ? "" : "s"}`,
        },
        {
            label: "Property Owners",
            value: owners.length,
            icon: <UserCircle2 className="h-5 w-5 text-sky-600" />,
            iconBackground: "bg-sky-50",
            accent: "bg-sky-500",
        },
        {
            label: "Subscription Plans",
            value: totalPlans,
            icon: <Package className="h-5 w-5 text-amber-600" />,
            iconBackground: "bg-amber-50",
            accent: "bg-amber-500",
            meta: `${activePlans} active plan${activePlans === 1 ? "" : "s"}`,
        },
        {
            label: "Total Revenue",
            value: formatPrice(activeIntervalPrice, plan?.currency ?? "NGN"),
            icon: <Banknote className="h-5 w-5 text-emerald-600" />,
            iconBackground: "bg-emerald-50",
            accent: "bg-emerald-500",
            meta: `${paymentCount} payment${paymentCount === 1 ? "" : "s"} recorded`,
        },
    ];

    /* ---------- Hero stats ---------- */
    const heroStats = [
        {
            label: "New users",
            value: newUsers,
            hint: "Joined in 30 days",
        },
        {
            label: "Organizations",
            value: totalOrganizations,
            hint: "On the platform",
        },
        {
            label: "Plans",
            value: totalPlans,
            hint: "Configured tiers",
        },
        {
            label: "Notifications",
            value: allNotifications.length,
            hint: "Latest activity",
        },
    ];

    /* ---------- Attention items ---------- */
    const attentionItems = [
        {
            label: "Organizations",
            value: totalOrganizations,
            hint: "Registered on the platform",
            href: "/dashboard/admin/organizations",
            dot: "bg-fuchsia-500",
        },
        {
            label: "Active plans",
            value: totalPlans,
            hint: `${activePlans} active · ${totalPlans - activePlans} inactive`,
            href: "/dashboard/admin/subscriptions",
            dot: "bg-amber-500",
        },
        {
            label: "New user accounts",
            value: newUsers,
            hint: "Registered in the last 30 days",
            href: "/dashboard/admin/users",
            dot: "bg-violet-500",
        },
        {
            label: "Platform notifications",
            value: allNotifications.length,
            hint: "Recent account and payment activity",
            href: "/dashboard/admin/notifications",
            dot: "bg-blue-500",
        },
    ];

    /* ---------- Panel data ---------- */
    const organizationList = organizations.slice(0, 6);
    const slicedNotifications = allNotifications.slice(0, 4);
    const planList = subscriptionPlans.slice(0, 4);

    return (
        <div className="flex flex-col gap-5 p-2">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {/* Hero band */}
            <HeroBand
                tagline={`Admin console · ${today}`}
                title={`Welcome back, ${firstName}`}
                description="Here is the pulse of the platform: organizations, users, plans, and revenue health in one place."
                actions={
                    <>
                        <Link
                            href="/dashboard/admin/subscriptions"
                            className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <Package className="h-4 w-4" aria-hidden="true" />
                            Manage plans
                        </Link>
                       
                    </>
                }
                stats={heroStats}
            />

            <SummaryCards cards={summaryCards} title={null} />

            {/* Sectional grid */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                {/* Properties */}
                <OverviewPanel
                    className="xl:col-span-8"
                    title="Property portfolio"
                    subtitle={`${totalProperties} propert${
                        totalProperties === 1 ? "y" : "ies"
                    } under management`}
                    icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
                    tone="slate"
                    action={<ViewAll href="/dashboard/admin/properties" />}
                    contentClassName="p-3 sm:p-4"
                >
                    <AdminPropertyList properties={properties.slice(0, 6)} />
                </OverviewPanel>

                {/* Needs attention */}
                <OverviewPanel
                    className="xl:col-span-4"
                    title="Needs your attention"
                    subtitle="Items waiting on a decision"
                    icon={<CircleAlert className="h-5 w-5" aria-hidden="true" />}
                    tone="slate"
                >
                    <ul className="flex flex-col divide-y divide-line">
                        {attentionItems.map((item, index) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={`group flex items-center gap-3 py-3 transition-colors hover:text-side-active ${
                                        index === 0 ? "pt-0" : ""
                                    } ${
                                        index === attentionItems.length - 1
                                            ? "pb-0"
                                            : ""
                                    }`}
                                >
                                    <span
                                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`}
                                        aria-hidden="true"
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-baseline justify-between gap-2">
                                            <span className="truncate text-[13.5px] font-medium text-ink group-hover:text-side-active">
                                                {item.label}
                                            </span>
                                            <span className="text-[17px] font-semibold leading-none text-ink tabular-nums">
                                                {item.value}
                                            </span>
                                        </span>
                                        <span className="mt-1 block truncate text-[12px] text-mute">
                                            {item.hint}
                                        </span>
                                    </span>
                                    <ArrowUpRight
                                        className="h-4 w-4 shrink-0 text-mute transition-transform group-hover:-translate-y-0.5 group-hover:text-side-active"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </OverviewPanel>

                {/* Organizations */}
                <OverviewPanel
                    className="xl:col-span-6"
                    title="Organizations"
                    subtitle={`${totalOrganizations} registered`}
                    icon={<Layers className="h-5 w-5" aria-hidden="true" />}
                    tone="slate"
                    action={<ViewAll href="/dashboard/admin/organizations" />}
                    contentClassName="p-3 sm:p-4"
                >
                    {organizationList.length === 0 ? (
                        <div className="px-2 py-6 text-center text-[12.5px] text-mute">
                            No organizations yet.
                        </div>
                    ) : (
                        <ul className="flex flex-col divide-y divide-line">
                            {organizationList.map((org) => {
                                const orgName =
                                    org?.name ||
                                    org?.organizationName ||
                                    org?.title ||
                                    "Untitled organization";
                                const orgId = org?.id ?? org?._id ?? orgName;
                                const owner =
                                    org?.owner?.name ||
                                    org?.ownerName ||
                                    org?.owner?.email ||
                                    org?.owner_email ||
                                    null;
                                const memberCount =
                                    org?.memberCount ??
                                    org?.membersCount ??
                                    org?._count?.members ??
                                    null;

                                return (
                                    <li key={orgId}>
                                        <Link
                                            href={`/dashboard/admin/organizations/${orgId}`}
                                            className="group flex items-center gap-3 py-3"
                                        >
                                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-fuchsia-50 text-[12px] font-semibold text-fuchsia-700 ring-1 ring-black/5">
                                                {orgName
                                                    .split(" ")
                                                    .filter(Boolean)
                                                    .slice(0, 2)
                                                    .map((p) => p[0]?.toUpperCase())
                                                    .join("")}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-baseline justify-between gap-2">
                                                    <span className="truncate text-[13.5px] font-medium text-ink group-hover:text-side-active">
                                                        {orgName}
                                                    </span>
                                                    {memberCount != null && (
                                                        <span className="shrink-0 text-[11px] font-semibold text-mute tabular-nums">
                                                            {memberCount} member
                                                            {memberCount === 1
                                                                ? ""
                                                                : "s"}
                                                        </span>
                                                    )}
                                                </span>
                                                {owner && (
                                                    <span className="mt-0.5 block truncate text-[11.5px] text-mute">
                                                        Owner · {owner}
                                                    </span>
                                                )}
                                            </span>
                                            <ArrowUpRight
                                                className="h-4 w-4 shrink-0 text-mute transition-transform group-hover:-translate-y-0.5 group-hover:text-side-active"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </OverviewPanel>

                {/* Plans catalog */}
                <OverviewPanel
                    className="xl:col-span-6"
                    title="Subscription plans"
                    subtitle={`${totalPlans} configured · ${activePlans} active`}
                    icon={<Package className="h-5 w-5" aria-hidden="true" />}
                    tone="slate"
                    action={
                        <ViewAll
                            href="/dashboard/admin/subscriptions"
                            label="Manage"
                        />
                    }
                >
                    {planList.length === 0 ? (
                        <div className="px-2 py-6 text-center text-[12.5px] text-mute">
                            No plans configured yet.
                        </div>
                    ) : (
                        <ul className="flex flex-col divide-y divide-line">
                            {planList.map((p) => {
                                const isActive =
                                    p?.isActive === true ||
                                    p?.active === true ||
                                    String(p?.status || "").toUpperCase() ===
                                        "ACTIVE";

                                return (
                                    <li
                                        key={p?.id ?? p?.slug ?? p?.name}
                                        className="py-3 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate text-[13.5px] font-semibold text-ink">
                                                        {p?.name ?? "Untitled plan"}
                                                    </span>
                                                    {isActive ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-emerald-700">
                                                            <CheckCircle2
                                                                className="h-2.5 w-2.5"
                                                                aria-hidden="true"
                                                            />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-gray-600">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 truncate text-[11.5px] text-mute">
                                                    {formatPrice(
                                                        p?.monthlyPrice,
                                                        p?.currency ?? "NGN"
                                                    )}{" "}
                                                    / mo ·{" "}
                                                    {formatPrice(
                                                        p?.yearlyPrice,
                                                        p?.currency ?? "NGN"
                                                    )}{" "}
                                                    / yr
                                                </p>
                                            </div>
                                            {p?.id && (
                                                <Link
                                                    href={`/dashboard/admin/subscriptions/${p.id}`}
                                                    className="shrink-0 text-[11.5px] font-medium text-primary hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                        </div>

                                        {p?.maxUnits != null && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10.5px] font-semibold text-primary">
                                                    {p.maxUnits} units
                                                </span>
                                                {p?.maxOrganizations != null && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10.5px] font-semibold text-primary">
                                                        {p.maxOrganizations} orgs
                                                    </span>
                                                )}
                                                {p?.maxProperties != null && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10.5px] font-semibold text-primary">
                                                        {p.maxProperties} props
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </OverviewPanel>

                {/* Notifications */}
                <OverviewPanel
                    className="xl:col-span-12"
                    title="Notifications"
                    subtitle="Latest platform activity"
                    icon={<BellRing className="h-5 w-5" aria-hidden="true" />}
                    tone="slate"
                    action={<ViewAll href="/dashboard/admin/notifications" />}
                >
                    <AdminNotificationList notifications={slicedNotifications} />
                </OverviewPanel>
            </div>
        </div>
    );
}