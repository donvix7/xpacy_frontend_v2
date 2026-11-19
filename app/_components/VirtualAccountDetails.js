const getStatus = (acc) => String(acc?.status || "").toLowerCase();

const statusBadge = (status) => {
  const s = getStatus({ status });
  if (["active", "enabled"].includes(s))
    return "bg-green-100 text-green-700";
  if (["inactive", "disabled", "closed", "expired"].includes(s))
    return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
};

const formatAmount = (acc) => {
  const n = parseFloat(
    acc?.balance ?? acc?.amount ?? acc?.available_balance ?? 0,
  );
  return Number.isFinite(n) ? `₦${n.toLocaleString()}` : "₦0";
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function VirtualAccountDetail({ account }) {
  const fields = [
    {
      label: "Bank",
      value: account?.bank_name || account?.bankName || account?.bank || "—",
    },
    {
      label: "Account Name",
      value:
        account?.account_name || account?.accountName || account?.name || "—",
    },
    {
      label: "Account Number",
      value:
        account?.account_number ||
        account?.accountNumber ||
        account?.number ||
        "—",
      mono: true,
    },
    {
      label: "Balance",
      value: formatAmount(account),
    },
    {
      label: "Created",
      value: formatDate(
        account?.created_at || account?.createdAt || account?.date,
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header strip */}
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-gray-900">
            {account?.bank_name || account?.bankName || account?.bank || "—"}
          </p>
          <p className="mt-0.5 truncate text-sm text-gray-500">
            {account?.account_name ||
              account?.accountName ||
              account?.name ||
              "—"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadge(account?.status)}`}
        >
          {account?.status || "active"}
        </span>
      </div>

      {/* Fields */}
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.label}>
            <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500">
              {f.label}
            </dt>
            <dd
              className={`mt-1 text-sm text-gray-900 ${f.mono ? "font-mono" : ""}`}
            >
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}