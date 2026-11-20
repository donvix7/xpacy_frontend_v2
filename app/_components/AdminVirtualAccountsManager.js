"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Search,
    Landmark,
    Hash,
    Link2,
    CalendarDays,
    Eye,
    X,
    User,
    Building2,
    ArrowUpRight,
} from "lucide-react";
import DataTable from "./DataTable";
import CopyButton from "./CopyButton";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function formatDateTime(v) {
    if (!v) return "—";
    try {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return String(v);
        return d.toLocaleString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return String(v);
    }
}

function getUserDisplayName(account) {
    const u = account?.user;
    if (u?.firstName || u?.lastName) {
        return `${u.firstName || ""} ${u.lastName || ""}`.trim();
    }
    if (u?.name) return u.name;
    if (account?.accountName) {
        return account.accountName.replace(/^XPACY\/?/i, "");
    }
    return "Unknown User";
}

function getUserInitials(name) {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export default function AdminVirtualAccountsManager({
    initialAccounts = [],
    meta = {},
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'expired'

    // Filter accounts locally for instant feedback
    const filteredAccounts = useMemo(() => {
        let list = Array.isArray(initialAccounts) ? initialAccounts : [];

        // Status filter
        if (statusFilter === "active") {
            list = list.filter((acc) => !acc.expired);
        } else if (statusFilter === "expired") {
            list = list.filter((acc) => !!acc.expired);
        }

        // Search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter((acc) => {
                const u = acc.user || {};
                const userName = getUserDisplayName(acc).toLowerCase();
                const userEmail = String(u.email || "").toLowerCase();
                const accName = String(acc.accountName || "").toLowerCase();
                const bankAccName = String(acc.bankAccountName || "").toLowerCase();
                const bankName = String(acc.bankName || "").toLowerCase();
                const accNumber = String(acc.bankAccountNumber || "").toLowerCase();
                const ref = String(acc.accountRef || "").toLowerCase();
                const id = String(acc.id || "").toLowerCase();

                return (
                    userName.includes(q) ||
                    userEmail.includes(q) ||
                    accName.includes(q) ||
                    bankAccName.includes(q) ||
                    bankName.includes(q) ||
                    accNumber.includes(q) ||
                    ref.includes(q) ||
                    id.includes(q)
                );
            });
        }

        return list;
    }, [initialAccounts, statusFilter, searchQuery]);

    const activeCount = useMemo(
        () => initialAccounts.filter((a) => !a.expired).length,
        [initialAccounts]
    );
    const expiredCount = useMemo(
        () => initialAccounts.filter((a) => !!a.expired).length,
        [initialAccounts]
    );

    /* ---------------------------------------------------------------------- */
    /* Table Columns                                                          */
    /* ---------------------------------------------------------------------- */
    const columns = [
        {
            heading: "User / Account Name",
            render: (acc) => {
                const displayName = getUserDisplayName(acc);
                const email = acc.user?.email;
                const initials = getUserInitials(displayName);
                return (
                    <Link
                        href={`/dashboard/admin/wallet/settings/${acc.id}`}
                        className="group flex items-center gap-3"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-sans text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white dark:bg-primary/20">
                            {initials}
                        </div>
                        <div className="min-w-0 max-w-[200px]">
                            <p className="truncate text-[13px] font-semibold text-ink transition-colors group-hover:text-primary">
                                {displayName}
                            </p>
                            <p className="truncate text-[11.5px] text-mute">
                                {email || acc.accountName || "No email attached"}
                            </p>
                        </div>
                    </Link>
                );
            },
        },
        {
            heading: "Bank & Account Number",
            render: (acc) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <Landmark className="h-3.5 w-3.5 text-mute" />
                        <span className="text-[12.5px] font-medium text-ink">
                            {acc.bankName || "Unknown Bank"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-bold tracking-tight text-ink tabular-nums">
                            {acc.bankAccountNumber || "—"}
                        </span>
                        {acc.bankAccountNumber && (
                            <CopyButton
                                value={acc.bankAccountNumber}
                                label="account number"
                                className="inline-flex h-6 w-6 items-center justify-center rounded border border-line bg-card text-mute hover:text-ink transition-colors"
                                iconSize={12}
                            />
                        )}
                    </div>
                </div>
            ),
        },
        {
            heading: "Account Reference",
            render: (acc) => (
                <div className="flex items-center gap-2">
                    <span className="max-w-[140px] truncate font-mono text-[11.5px] text-mute">
                        {acc.accountRef || "—"}
                    </span>
                    {acc.accountRef && (
                        <CopyButton
                            value={acc.accountRef}
                            label="account reference"
                            className="inline-flex h-6 w-6 items-center justify-center rounded border border-line bg-card text-mute hover:text-ink transition-colors"
                            iconSize={12}
                        />
                    )}
                </div>
            ),
        },
        {
            heading: "Currency",
            center: true,
            render: (acc) => (
                <span className="inline-flex items-center rounded-md bg-soft px-2 py-0.5 font-mono text-[11px] font-semibold text-mute">
                    {acc.currency || "NGN"}
                </span>
            ),
        },
        {
            heading: "Status",
            center: true,
            render: (acc) => {
                const isExpired = !!acc.expired;
                return (
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                            isExpired
                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                isExpired ? "bg-red-500" : "bg-emerald-500"
                            }`}
                        />
                        {isExpired ? "Expired" : "Active"}
                    </span>
                );
            },
        },
        {
            heading: "Created At",
            render: (acc) => (
                <span className="whitespace-nowrap text-[12px] text-mute">
                    {formatDateTime(acc.createdAt)}
                </span>
            ),
        },
        {
            heading: "",
            align: "right",
            render: (acc) => (
                <Link
                    href={`/dashboard/admin/wallet/settings/${acc.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 py-1.5 text-[11.5px] font-medium text-ink transition-colors hover:bg-soft hover:text-primary"
                >
                    <Eye className="h-3.5 w-3.5" />
                    Details
                    <ArrowUpRight className="h-3 w-3 text-mute" />
                </Link>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            {/* ---------------- Filters & Search Bar ---------------- */}
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                {/* Search */}
                <div className="relative min-w-[240px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                    <input
                        type="text"
                        placeholder="Search by user, bank, account number or ref…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-line bg-soft py-2 pl-9 pr-3 text-[13px] text-ink placeholder:text-mute focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-mute hover:text-ink"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Status Segmented Buttons */}
                <div className="flex items-center gap-1 rounded-xl border border-line bg-soft p-1">
                    <button
                        type="button"
                        onClick={() => setStatusFilter("all")}
                        className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                            statusFilter === "all"
                                ? "bg-card text-ink shadow-sm"
                                : "text-mute hover:text-ink"
                        }`}
                    >
                        All ({initialAccounts.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter("active")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                            statusFilter === "active"
                                ? "bg-card text-emerald-600 shadow-sm dark:text-emerald-400"
                                : "text-mute hover:text-ink"
                        }`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active ({activeCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter("expired")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                            statusFilter === "expired"
                                ? "bg-card text-red-600 shadow-sm dark:text-red-400"
                                : "text-mute hover:text-ink"
                        }`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Expired ({expiredCount})
                    </button>
                </div>
            </div>

            {/* ---------------- Virtual Accounts Table ---------------- */}
            <DataTable
                columns={columns}
                data={filteredAccounts}
                pagination={meta}
                emptyMessage={
                    searchQuery || statusFilter !== "all"
                        ? "No virtual accounts match your search or filters."
                        : "No virtual accounts found."
                }
            />
        </div>
    );
}
