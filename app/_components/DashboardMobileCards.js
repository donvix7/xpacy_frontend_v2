export default function DashboardMobileCards({ items }) {
    return (
        <div className="grid gap-3 lg:hidden">
            {items.map((item, index) => (
                <article key={item.key ?? index} className="rounded-xl border border-primary-100 bg-white p-4 shadow-sm">
                    {item.title && <h4 className="mb-3 truncate font-semibold text-gray-900">{item.title}</h4>}
                    <dl className="grid gap-3">
                        {item.fields.map(({ label, value }) => (
                            <div key={label} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                <dt className="shrink-0 text-xs font-medium text-gray-500">{label}</dt>
                                <dd className="min-w-0 text-right text-sm text-gray-900">{value || "—"}</dd>
                            </div>
                        ))}
                    </dl>
                </article>
            ))}
        </div>
    );
}
