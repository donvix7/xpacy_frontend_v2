import Link from "next/link";

const getStatus = (acc) => String(acc?.status || "").toLowerCase();
const getId = (acc) => acc?.id || acc?._id;

const statusDot = (status) => {
  const s = getStatus({ status });
  if (["active", "enabled"].includes(s)) return "bg-green-500";
  if (["inactive", "disabled", "closed", "expired"].includes(s))
    return "bg-red-500";
  return "bg-amber-500";
};

const getAccountNumber = (acc) =>
  acc?.account_number || acc?.accountNumber || acc?.number || "—";
const getBankName = (acc) =>
  acc?.bank_name || acc?.bankName || acc?.bank || "—";
const getAccountName = (acc) =>
  acc?.account_name || acc?.accountName || acc?.name || "—";

const formatAmount = (acc) => {
  const n = parseFloat(
    acc?.balance ?? acc?.amount ?? acc?.available_balance ?? 0,
  );
  return Number.isFinite(n) ? `₦${n.toLocaleString()}` : "₦0";
};

export default function VirtualAccountSidebar({ accounts, selectedId }) {
  return (
    <nav className="flex flex-col gap-1">
      {accounts.map((acc) => {
        const id = getId(acc);
        const isSelected = String(id) === String(selectedId);
        const accNumber = getAccountNumber(acc);

        return (
          <Link
            key={id || accNumber}
            href={`/dashboard/virtual-accounts?id=${encodeURIComponent(id || accNumber)}`}
            scroll={false}
            className={`group relative flex flex-col gap-1.5 rounded-xl border px-3.5 py-3 transition-colors ${
              isSelected
                ? "border-primary-200 bg-primary-50"
                : "border-transparent hover:border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${statusDot(acc.status)}`}
                  aria-hidden="true"
                />
                <span className="truncate text-sm font-semibold text-gray-900">
                  {getBankName(acc)}
                </span>
              </div>
              <span className="shrink-0 text-xs font-semibold text-gray-700 tabular-nums">
                {formatAmount(acc)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
              <span className="truncate">{getAccountName(acc)}</span>
              <span className="shrink-0 font-mono">{accNumber}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}