import { cookies } from "next/headers";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import VirtualAccountSidebar from "@/app/_components/VirtualAccountSideBar";
import VirtualAccountDetail from "@/app/_components/VirtualAccountDetails";
import VirtualAccountHistory from "@/app/_components/VirtualAccountHistory";
import ExpireAccountButton from "@/app/_components/ExpireAccountButton";
import RefreshButton from "@/app/_components/RefreshButton";
import {
  getVirtualAccounts,
  getVirtualAccountHistory,
} from "@/app/_lib/data-services";

function toList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.accounts)) return payload.accounts;
  if (Array.isArray(payload?.virtualAccounts)) return payload.virtualAccounts;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.accounts)) return payload.data.accounts;
  return [];
}

function historyList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.history)) return payload.history;
  if (Array.isArray(payload?.transactions)) return payload.transactions;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.transactions))
    return payload.data.transactions;
  return [];
}

function parseAmount(acc) {
  const n = parseFloat(
    acc?.balance ?? acc?.amount ?? acc?.available_balance ?? 0,
  );
  return Number.isFinite(n) ? n : 0;
}

function parseTxAmount(tx) {
  const n = parseFloat(tx?.amount ?? tx?.value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

const getStatus = (acc) => String(acc?.status || "").toLowerCase();
const getId = (acc) => acc?.id || acc?._id;

export default async function Page({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const params = await searchParams;

  const [accountsRaw, historyRaw] = await Promise.allSettled([
    getVirtualAccounts(token),
    getVirtualAccountHistory(token),
  ]);

  const accounts = toList(
    accountsRaw.status === "fulfilled" ? accountsRaw.value : [],
  );
  const allHistory = historyList(
    historyRaw.status === "fulfilled" ? historyRaw.value : [],
  );

  // Resolve selected account — first from URL, else first account
  const requestedId = params?.id;
  const selectedAccount =
    accounts.find((a) => String(getId(a)) === String(requestedId)) ||
    accounts[0] ||
    null;

  const selectedId = getId(selectedAccount);

  // Filter history to the selected account when possible
  const accountHistory = selectedId
    ? allHistory.filter((tx) => {
        const txAccountId =
          tx?.virtual_account_id ||
          tx?.account_id ||
          tx?.virtualAccountId ||
          tx?.accountId;
        if (txAccountId) return String(txAccountId) === String(selectedId);

        const txAccountNumber =
          tx?.account_number || tx?.accountNumber || tx?.number;
        if (txAccountNumber) {
          const accNumber =
            selectedAccount?.account_number ||
            selectedAccount?.accountNumber ||
            selectedAccount?.number;
          return txAccountNumber === accNumber;
        }
        return false;
      })
    : [];

  const history = accountHistory.length
    ? accountHistory
    : selectedId
      ? []
      : allHistory;

  // ---- Hero stats ---------------------------------------------------------
  const active = accounts.filter((a) =>
    ["active", "enabled"].includes(getStatus(a)),
  ).length;
  const inactive = accounts.filter((a) =>
    ["inactive", "disabled", "closed", "expired"].includes(getStatus(a)),
  ).length;

  const historyCredits = history.filter(
    (tx) => String(tx?.type || tx?.direction || "").toLowerCase() !== "debit",
  );
  const historyTotal = historyCredits.reduce(
    (sum, tx) => sum + parseTxAmount(tx),
    0,
  );

  const heroStats = [
    {
      label: "Virtual Accounts",
      value: accounts.length,
      hint: "All accounts",
    },
    {
      label: "Active",
      value: active,
      hint: "Ready to receive",
    },
    {
      label: "Inactive",
      value: inactive,
      hint: "Closed or expired",
    },
    {
      label: "Collected",
      value: `₦${historyTotal.toLocaleString()}`,
      hint: `${history.length} transactions`,
    },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="grid grid-cols-1 gap-4 p-2 lg:grid-cols-12">
      {/* ---------- LEFT: Sidebar ---------- */}
      <aside className="lg:col-span-3 lg:sticky lg:top-4 lg:self-start">
        <DashboardGridItem
          title="Accounts"
          actions={
            <Link
              href="/dashboard/virtual-accounts/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Create
            </Link>
          }
        >
          <VirtualAccountSidebar
            accounts={accounts}
            selectedId={selectedId}
          />
        </DashboardGridItem>
      </aside>

      {/* ---------- RIGHT: Main pane ---------- */}
      <section className="flex flex-col gap-8 lg:col-span-9">
        {/* Hero summary */}
        <div className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
          <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                  Payments console · {today}
                </p>
                <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                  Virtual Accounts
                </h1>
                <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                  Every dedicated account number in one place — balances,
                  status and where payments are collected.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Refresh — glassy secondary */}
                <div className="[&_button]:inline-flex [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-lg [&_button]:border [&_button]:border-white/30 [&_button]:bg-white/10 [&_button]:px-4 [&_button]:py-2.5 [&_button]:text-[13px] [&_button]:font-medium [&_button]:text-white [&_button]:backdrop-blur-sm [&_button]:transition-colors [&_button:hover]:bg-white/20">
                  <RefreshButton>
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Refresh
                  </RefreshButton>
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4"
                >
                  <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.5px] text-white tabular-nums sm:text-[26px]">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </dd>
                  <p className="mt-1.5 truncate text-[11.5px] text-side-mute">
                    {stat.hint}
                  </p>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Detail + History */}
        {accounts.length === 0 ? (
          <DashboardGridItem title="Virtual Accounts">
            <EmptyState
              message="No virtual accounts yet. Create one to start collecting payments."
              cta="Create account"
              link="/dashboard/virtual-accounts/new"
            />
          </DashboardGridItem>
        ) : (
          <>
            {selectedAccount && (
              <DashboardGridItem
                title="Account Details"
                actions={
                  <div className="[&_button]:inline-flex [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-lg [&_button]:border [&_button]:border-red-200 [&_button]:bg-red-50 [&_button]:px-3 [&_button]:py-2 [&_button]:text-[12.5px] [&_button]:font-medium [&_button]:text-red-700 [&_button]:transition-colors [&_button:hover]:bg-red-100 [&_button:disabled]:opacity-50">
                    <ExpireAccountButton accountId={selectedId} />
                  </div>
                }
              >
                <VirtualAccountDetail account={selectedAccount} />
              </DashboardGridItem>
            )}

            <DashboardGridItem
              title="Account History"
              actions={
                <div className="[&_button]:inline-flex [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-lg [&_button]:border [&_button]:border-neutral-200 [&_button]:bg-white [&_button]:px-3 [&_button]:py-2 [&_button]:text-[12.5px] [&_button]:font-medium [&_button]:text-gray-700 [&_button]:transition-colors [&_button:hover]:bg-gray-50">
                  <RefreshButton>
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    Refresh
                  </RefreshButton>
                </div>
              }
            >
              {history.length === 0 ? (
                <EmptyState message="No account history yet. Transactions will appear here once this virtual account starts receiving payments." />
              ) : (
                <VirtualAccountHistory history={history} />
              )}
            </DashboardGridItem>
          </>
        )}
      </section>
    </div>
  );
}