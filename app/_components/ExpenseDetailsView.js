import Link from "next/link";
import {
    Calendar,
    CalendarCheck,
    ChevronLeft,
    Coins,
    ExternalLink,
    Home,
    Link2,
    Pencil,
    Receipt,
    Store,
    Tag,
    Wallet,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import KeyValueDataTable from "@/app/_components/KeyValueDataTable";
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

const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
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

export default function ExpenseDetailsView({
    expense,
    basePath = "/dashboard/property-owner",
    dataErrorMessages = [],
}) {
    const expensesHref = `${basePath}/expenses`;

    if (!expense || typeof expense !== "object") {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href={expensesHref}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to expenses
                </Link>
                <EmptyState
                    icon={<Receipt className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Expense not found"
                    message="This expense record may have been removed or the link is incorrect."
                />
            </div>
        );
    }

    const expId = expense.id || expense._id || "";
    const category = titleCase(expense.category);
    const currency = (expense.currency || "NGN").toUpperCase();
    const amountText = formatMoney(expense.amount, currency);
    const title = expense.vendor || category;
    const propertyName = expense.property?.name || expense.propertyName || null;
    const propertyId = expense.property?.id || expense.propertyId || null;
    const editHref = `/admin/add-new-expense?expenseId=${encodeURIComponent(expId)}&returnTo=${encodeURIComponent(`${expensesHref}/${expId}`)}`;

    const detailRows = [
        { label: "Category", value: category, icon: Tag },
        { label: "Vendor / Payee", value: expense.vendor, icon: Store },
        { label: "Amount", value: amountText, icon: Wallet, mono: true },
        { label: "Currency", value: currency, icon: Coins, mono: true },
        { label: "Expense Date", value: formatDate(expense.date), icon: Calendar },
        {
            label: "Property",
            value: propertyName || (propertyId ? "Linked Property" : "Organization-wide"),
            icon: Home,
            href: propertyId
                ? `${basePath}/properties/${encodeURIComponent(propertyId)}`
                : null,
        },
        {
            label: "Receipt",
            value: expense.receipt ? (
                <a
                    href={expense.receipt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                >
                    <span>View receipt</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
            ) : null,
            icon: Link2,
        },
        { label: "Created", value: formatDateTime(expense.createdAt), icon: Calendar },
        { label: "Last Updated", value: formatDateTime(expense.updatedAt), icon: CalendarCheck },
    ];

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href={expensesHref}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to expenses
            </Link>

            <HeroBand
                tagline="Expense Record"
                title={title}
                description={[category, propertyName || "Organization-wide"]
                    .filter(Boolean)
                    .join(" · ")}
                badge={
                    <span className="inline-flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                        {category}
                    </span>
                }
                stats={[
                    { label: "Amount", value: amountText, hint: currency },
                    { label: "Category", value: category, hint: "Cost type" },
                    { label: "Vendor", value: expense.vendor || "—", hint: "Payee" },
                    { label: "Date", value: formatDate(expense.date), hint: "Expense date" },
                ]}
                actions={
                    <>
                        {expense.receipt && (
                            <a
                                href={expense.receipt}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                View Receipt
                            </a>
                        )}
                        {expId && (
                            <Link
                                href={editHref}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3.5 py-2 text-xs font-semibold text-side transition-colors hover:bg-white"
                            >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                Edit Expense
                            </Link>
                        )}
                    </>
                }
            />

            <DashboardGridItem title="Expense Information">
                <KeyValueDataTable rows={detailRows} />
            </DashboardGridItem>

            {expense.description && (
                <DashboardGridItem title="Description">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                        {expense.description}
                    </p>
                </DashboardGridItem>
            )}
        </div>
    );
}

