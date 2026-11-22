import Link from "next/link";
import {
    Building2,
    ChevronLeft,
    Coins,
    DoorOpen,
    Hash,
    Home,
    Layers,
    Sparkles,
    Wallet,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import KeyValueDataTable from "@/app/_components/KeyValueDataTable";
import StatusChips from "@/app/_components/StatusChips";
import { getSubscriptionList } from "@/app/_lib/data-services";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

function getPlans(result) {
    if (Array.isArray(result)) return result;
    return (
        result?.plans ||
        result?.items ||
        result?.results ||
        result?.data?.plans ||
        result?.data?.items ||
        result?.data?.results ||
        (Array.isArray(result?.data) ? result.data : []) ||
        []
    );
}

function getFeatureRows(features) {
    if (Array.isArray(features)) {
        return features.map((item, index) => ({
            label: `Feature ${index + 1}`,
            value:
                typeof item === "string"
                    ? item
                    : item?.name || JSON.stringify(item),
            icon: Sparkles,
        }));
    }
    if (features && typeof features === "object") {
        return Object.entries(features).map(([key, value]) => ({
            label: key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim(),
            value:
                typeof value === "boolean"
                    ? value
                        ? "Included"
                        : "Not included"
                    : typeof value === "string"
                      ? value
                      : JSON.stringify(value),
            icon: Sparkles,
        }));
    }
    return [];
}

export default async function Page({ params }) {
    const { id } = await params;
    const results = await Promise.allSettled([getSubscriptionList()]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const plans = getPlans(
        results[0].status === "fulfilled" ? results[0].value : null
    );
    const plan = plans.find(
        (item) =>
            String(item?.id || item?._id || item?.planId || "") === String(id)
    );

    if (!plan) {
        return (
            <div className="space-y-6 p-4 md:p-6">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href="/dashboard/admin/subscriptions"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to subscriptions
                </Link>
                <EmptyState message="Subscription plan not found." />
            </div>
        );
    }

    const name = plan.name || plan.title || "Untitled plan";
    const status =
        plan.isActive === false ||
        String(plan.status || "").toUpperCase() === "INACTIVE"
            ? "Inactive"
            : "Active";
    const currency = plan.currency || "NGN";
    const formatPrice = (val) =>
        val == null ? "Custom" : `${currency} ${Number(val).toLocaleString()}`;

    const monthlyPrice = formatPrice(
        plan.price ?? plan.monthly ?? plan.monthlyPrice
    );
    const quarterlyPrice = formatPrice(plan.quarterly ?? plan.quarterlyPrice);
    const yearlyPrice = formatPrice(plan.yearly ?? plan.yearlyPrice);

    const planDetailRows = [
        { label: "Monthly Price", value: monthlyPrice, icon: Wallet, mono: true },
        { label: "Quarterly Price", value: quarterlyPrice, icon: Wallet, mono: true },
        { label: "Yearly Price", value: yearlyPrice, icon: Wallet, mono: true },
        { label: "Currency", value: currency, icon: Coins, mono: true },
        { label: "Sort Order", value: String(plan.sortOrder ?? 0), icon: Hash, mono: true },
        {
            label: "Maximum Organizations",
            value: String(plan.maxOrganizations ?? 0),
            icon: Building2,
            mono: true,
        },
        {
            label: "Maximum Properties",
            value: String(plan.maxProperties ?? 0),
            icon: Home,
            mono: true,
        },
        {
            label: "Maximum Buildings",
            value: String(plan.maxBuildings ?? 0),
            icon: Layers,
            mono: true,
        },
        {
            label: "Maximum Units",
            value: String(plan.maxUnits ?? 0),
            icon: DoorOpen,
            mono: true,
        },
    ];

    const featureRows = getFeatureRows(plan.features);

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href="/dashboard/admin/subscriptions"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to subscriptions
            </Link>

            <HeroBand
                tagline="Subscription Plan"
                title={name}
                description={plan.description || "No description provided."}
                actions={<StatusChips status={status} />}
                stats={[
                    { label: "Monthly", value: monthlyPrice, hint: "Per month" },
                    { label: "Quarterly", value: quarterlyPrice, hint: "Per quarter" },
                    { label: "Yearly", value: yearlyPrice, hint: "Per year" },
                    { label: "Max Properties", value: plan.maxProperties ?? 0, hint: `${plan.maxUnits ?? 0} max units` },
                ]}
            />

            <DashboardGridItem title="Plan Details">
                <KeyValueDataTable rows={planDetailRows} />
            </DashboardGridItem>

            <DashboardGridItem title="Features">
                <KeyValueDataTable
                    rows={featureRows}
                    fieldHeading="Feature"
                    valueHeading="Allowance"
                    emptyMessage="No features have been set for this plan."
                />
            </DashboardGridItem>
        </div>
    );
}
