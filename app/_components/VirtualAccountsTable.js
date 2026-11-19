import DataTable from "./DataTable";

const getStatus = (acc) => String(acc?.status || "").toLowerCase();

const statusBadge = (status) => {
  const s = getStatus({ status });
  if (["active", "enabled"].includes(s))
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (["inactive", "disabled", "closed"].includes(s))
    return "bg-red-500/10 text-red-600 dark:text-red-400";
  return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
};

const formatAmount = (acc) => {
  const n = parseFloat(
    acc?.balance ?? acc?.amount ?? acc?.available_balance ?? 0,
  );
  return Number.isFinite(n) ? `₦${n.toLocaleString()}` : "₦0";
};

const getAccountNumber = (acc) =>
  acc?.account_number || acc?.accountNumber || acc?.number || "—";
const getBankName = (acc) =>
  acc?.bank_name || acc?.bankName || acc?.bank || "—";
const getAccountName = (acc) =>
  acc?.account_name || acc?.accountName || acc?.name || "—";

const tableHeadings = [
  { heading: "Bank" },
  { heading: "Account Name" },
  { heading: "Account Number" },
  { heading: "Balance" },
  { heading: "Status", center: true },
];

export default function VirtualAccountsTable({ accounts = [] }) {
  const renderRow = (acc, i) => (
    <tr
      key={acc.id || acc._id || i}
      className="border-b border-line hover:bg-soft transition-colors font-mono text-sm last:border-0"
    >
      <td className="p-4 font-medium text-ink">{getBankName(acc)}</td>
      <td className="p-4 text-mute">{getAccountName(acc)}</td>
      <td className="p-4 font-mono text-mute">{getAccountNumber(acc)}</td>
      <td className="p-4 font-semibold text-ink">{formatAmount(acc)}</td>
      <td className="p-4 text-center">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadge(acc.status)}`}
        >
          {acc.status || "active"}
        </span>
      </td>
    </tr>
  );

  const renderMobileCard = (acc, i) => (
    <div
      key={acc.id || acc._id || i}
      className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4 font-mono text-sm shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">{getBankName(acc)}</p>
          <p className="truncate text-xs text-mute">{getAccountName(acc)}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadge(acc.status)}`}
        >
          {acc.status || "active"}
        </span>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-soft p-3">
        <div>
          <p className="text-[10px] font-bold uppercase text-mute">Account</p>
          <p className="text-ink">{getAccountNumber(acc)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase text-mute">Balance</p>
          <p className="font-semibold text-ink">{formatAmount(acc)}</p>
        </div>
      </div>
    </div>
  );

  return (
    <DataTable
      headers={tableHeadings}
      data={accounts}
      renderRow={renderRow}
      renderMobileCard={renderMobileCard}
      showPagination={false}
      emptyMessage="No virtual accounts found."
      className="p-0 border-none shadow-none"
    />
  );
}
