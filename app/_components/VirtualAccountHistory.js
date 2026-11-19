import DataTable from "./DataTable";

const getType = (tx) =>
  String(tx?.type || tx?.direction || "credit").toLowerCase();

const formatAmount = (tx) => {
  const n = parseFloat(tx?.amount ?? tx?.value ?? 0);
  if (!Number.isFinite(n)) return "—";
  const sign = getType(tx) === "debit" ? "-" : "+";
  return `${sign}₦${n.toLocaleString()}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const tableHeadings = [
  { heading: "Date" },
  { heading: "Description" },
  { heading: "Account" },
  { heading: "Type" },
  { heading: "Amount", center: true },
];

export default function VirtualAccountHistory({ history = [] }) {
  const renderRow = (tx, i) => (
    <tr
      key={tx.id || tx._id || i}
      className="border-b border-line hover:bg-soft transition-colors font-mono text-sm last:border-0"
    >
      <td className="p-4 text-mute">
        {formatDate(tx.created_at || tx.date || tx.timestamp)}
      </td>
      <td className="p-4 font-medium text-ink">
        {tx.narration || tx.description || "Transaction"}
      </td>
      <td className="p-4 font-mono text-mute">
        {tx.account_number || tx.accountNumber || "—"}
      </td>
      <td className="p-4 capitalize text-mute">{getType(tx)}</td>
      <td
        className={`p-4 text-right font-semibold ${
          getType(tx) === "debit" ? "text-down" : "text-up"
        }`}
      >
        {formatAmount(tx)}
      </td>
    </tr>
  );

  const renderMobileCard = (tx, i) => (
    <div
      key={tx.id || tx._id || i}
      className="rounded-xl border border-line bg-card p-4 font-mono text-sm shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">
            {tx.narration || tx.description || "Transaction"}
          </p>
          <p className="mt-0.5 truncate text-xs text-mute">
            {tx.account_number || tx.accountNumber || "—"}
          </p>
        </div>
        <p
          className={`shrink-0 font-semibold ${
            getType(tx) === "debit" ? "text-down" : "text-up"
          }`}
        >
          {formatAmount(tx)}
        </p>
      </div>
      <p className="mt-2 text-xs text-mute">
        {formatDate(tx.created_at || tx.date || tx.timestamp)}
      </p>
    </div>
  );

  return (
    <DataTable
      headers={tableHeadings}
      data={history}
      renderRow={renderRow}
      renderMobileCard={renderMobileCard}
      showPagination={false}
      emptyMessage="No transaction history available."
      className="p-0 border-none shadow-none"
    />
  );
}
