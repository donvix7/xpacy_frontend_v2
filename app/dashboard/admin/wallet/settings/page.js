import Link from "next/link";
import { ChevronLeft, RefreshCw, Wallet } from "lucide-react";
import HeroBand from "@/app/_components/HeroBand";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import AdminVirtualAccountsManager from "@/app/_components/AdminVirtualAccountsManager";
import { getSettledErrorMessages } from "@/app/_lib/api-error";
import { getAdminVirtualAccounts } from "@/app/_lib/data-services";

export const metadata = {
    title: "Virtual Accounts Management | Admin Dashboard",
    description: "Manage and monitor all provisioned virtual bank accounts across the platform.",
};

export default async function AdminWalletSettingsPage(props) {
    const searchParams = await props?.searchParams;
    const page = Number(searchParams?.page || 1);
    const limit = Number(searchParams?.limit || 20);
    const search = searchParams?.search || "";

    const results = await Promise.allSettled([
        getAdminVirtualAccounts({ page, limit, search }),
    ]);

    const dataErrorMessages = getSettledErrorMessages(results);
    const rawResponse =
        results[0]?.status === "fulfilled" ? results[0].value : null;

    // Normalizing payload format: { success: true, data: [...], meta: { page, limit, total, totalPages } }
    const accounts = Array.isArray(rawResponse?.data)
        ? rawResponse.data
        : Array.isArray(rawResponse)
          ? rawResponse
          : [];

    const meta = rawResponse?.meta || {
        page,
        limit,
        total: accounts.length,
        totalPages: Math.ceil(accounts.length / limit) || 1,
    };

    const activeCount = accounts.filter((a) => !a.expired).length;
    const expiredCount = accounts.filter((a) => !!a.expired).length;
    const uniqueBanks = Array.from(
        new Set(accounts.map((a) => a.bankName).filter(Boolean))
    );
    const primaryBankLabel =
        uniqueBanks.length > 0 ? uniqueBanks.join(", ") : "Nombank MFB";

    const heroStats = [
        {
            label: "Total Accounts",
            value: meta.total ?? accounts.length,
            hint: "Platform-wide",
        },
        {
            label: "Active Accounts",
            value: activeCount,
            hint: "Receiving deposits",
        },
        {
            label: "Expired Accounts",
            value: expiredCount,
            hint: "Deactivated / lapsed",
        },
        {
            label: "Supported Bank",
            value: primaryBankLabel,
            hint: "Default deposit provider",
        },
    ];

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="space-y-6 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {/* Back navigation */}
            <Link
                href="/dashboard/admin/wallet"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-mute transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to admin wallet
            </Link>

            {/* Hero banner */}
            <HeroBand
                tagline={`Admin console · ${today}`}
                title="Virtual Accounts"
                description="Monitor and manage all virtual bank accounts provisioned for users and organizations to receive direct wallet deposits."
                stats={heroStats}
                actions={
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/admin/wallet"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <Wallet className="h-3.5 w-3.5" />
                            Admin wallet
                        </Link>
                    </div>
                }
            />

            {/* Interactive Virtual Accounts Table & Filters */}
            <AdminVirtualAccountsManager
                initialAccounts={accounts}
                meta={meta}
            />
        </div>
    );
}
