import Link from "next/link";
import { ArrowUpRight, Pencil, Plus, Receipt } from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import DataErrorNotice from "@/app/_components/DataErrorNotice";

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
          });
};

const formatMoney = (amount, currency = "NGN") => {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "—";
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: (currency || "NGN").toUpperCase(),
            maximumFractionDigits: 0,
        }).format(n);
    } catch {
        return `${currency || "NGN"} ${n.toLocaleString()}`;
    }
};

const titleCase = (value) =>
    !value
        ? "Other"
        : String(value)
              .replace(/[_-]+/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase());

export default function ExpensesListView({
    expenses = [],
    basePath = "/dashboard/property-owner",
    dataErrorMessages = [],
}) {
    const list = Array.isArray(expenses) ? expenses : [];
    const expensesHref = `${basePath}/expenses`;
    const addHref = `/admin/add-new-expense?returnTo=${encodeURIComponent(expensesHref)}`;

    const totalSpend = list.reduce(
        (sum, e) => sum + (Number(e?.amount) || 0),
        0
    );

    const now = new Date();
    const thisMonthSpend = list
        .filter((e) => {
            const d = new Date(e?.date || e?.createdAt);
            return (
                !Number.isNaN(d.getTime()) &&
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
            );
        })
        .reduce((sum, e) => sum + (Number(e?.amount) || 0), 0);

    const categoriesCount = new Set(
        list.map((e) => String(e?.category || "OTHER").toUpperCase())
    ).size;

    const primaryCurrency = list[0]?.currency || "NGN";

    const today = now.toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <HeroBand
                tagline={`Expenses ledger · ${today}`}
                title="Expenses"
                description="Track operating costs, maintenance bills, vendor invoices, and property expenses in one place."
                stats={[
                    { label: "Total Expenses", value: list.length, hint: "Recorded entries" },
                    {
                        label: "Total Spend",
                        value: formatMoney(totalSpend, primaryCurrency),
                        hint: "All recorded expenses",
                    },
                    {
                        label: "This Month",
                        value: formatMoney(thisMonthSpend, primaryCurrency),
                        hint: "Current month spend",
                    },
                    { label: "Categories", value: categoriesCount, hint: "Distinct cost types" },
                ]}
                actions={
                    <Link
                        href={addHref}
                        className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Create expense
                    </Link>
                }
            />

            <DashboardGridItem title={`All Expenses (${list.length})`}>
                {list.length === 0 ? (
                    <EmptyState
                        icon={<Receipt className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No expenses recorded"
                        message="Start tracking maintenance bills, utilities, and operating expenses."
                        cta="Create expense"
                        link={addHref}
                    />
                ) : (
                    <DataTable
                        data={list}
                        showPagination={list.length > 10}
                        className="p-0! border-none shadow-none"
                        rowKey={(exp, idx) => exp.id ?? exp._id ?? idx}
                        columns={[
                            {
                                heading: "Expense",
                                render: (exp) => {
                                    const expId = exp.id || exp._id;
                                    const title =
                                        exp.vendor ||
                                        exp.description ||
                                        titleCase(exp.category);
                                    return (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Receipt className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                {expId ? (
                                                    <Link
                                                        href={`${expensesHref}/${encodeURIComponent(expId)}`}
                                                        className="block truncate font-semibold text-ink hover:text-primary hover:underline"
                                                    >
                                                        {title}
                                                    </Link>
                                                ) : (
                                                    <p className="truncate font-semibold text-ink">
                                                        {title}
                                                    </p>
                                                )}
                                                {exp.description && exp.vendor && (
                                                    <p className="truncate text-xs text-mute">
                                                        {exp.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                },
                            },
                            {
                                heading: "Category",
                                render: (exp) => (
                                    <span className="inline-flex items-center rounded-full bg-soft px-2.5 py-0.5 text-xs font-semibold text-ink">
                                        {titleCase(exp.category)}
                                    </span>
                                ),
                            },
                            {
                                heading: "Property",
                                className: "text-xs text-ink",
                                render: (exp) =>
                                    exp.property?.name ||
                                    exp.propertyName ||
                                    "Organization-wide",
                            },
                            {
                                heading: "Date",
                                className: "font-mono text-xs text-mute",
                                render: (exp) => formatDate(exp.date || exp.createdAt),
                            },
                            {
                                heading: "Amount",
                                align: "right",
                                render: (exp) => (
                                    <span className="font-mono text-sm font-bold text-ink">
                                        {formatMoney(exp.amount, exp.currency)}
                                    </span>
                                ),
                            },
                            {
                                heading: "",
                                align: "right",
                                render: (exp) => {
                                    const expId = exp.id || exp._id;
                                    if (!expId) return null;
                                    return (
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/add-new-expense?expenseId=${encodeURIComponent(expId)}&returnTo=${encodeURIComponent(expensesHref)}`}
                                                className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
                                            >
                                                <Pencil className="h-3 w-3" />
                                                Edit
                                            </Link>
                                            <Link
                                                href={`${expensesHref}/${encodeURIComponent(expId)}`}
                                                className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
                                            >
                                                View
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    );
                                },
                            },
                        ]}
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}

