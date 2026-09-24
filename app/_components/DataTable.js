import Pagination from "./Pagination";
import EmptyState from "./EmptyState";

/**
 * A generic data table component that handles both desktop table and mobile card views.
 * 
 * @param {string} title - The title of the table section.
 * @param {Array} headers - Array of header objects { heading: string, center: boolean }.
 * @param {Array} data - The data to display.
 * @param {Function} renderRow - Function to render a desktop table row <tr>.
 * @param {Function} renderMobileCard - Function to render a mobile card element.
 * @param {Object} pagination - Pagination object { page, limit, total, totalPages }.
 * @param {string} emptyMessage - Message to show when data is empty.
 * @param {ReactNode} headerActions - Actions/Filters to show in the header.
 * @param {string} className - Additional CSS classes for the container.
 * @param {boolean} showPagination - Whether to show pagination.
 */
export default function DataTable({
    title,
    headers = [],
    data = [],
    renderRow,
    renderMobileCard,
    pagination,
    emptyMessage = "No items found.",
    headerActions,
    className = "",
    showPagination = true,
    children
}) {
    if (!data?.length) return <EmptyState message={emptyMessage} />;

    return (
        <div className={`flex flex-col gap-6 rounded-lg ${className}`}>
           

            {/* Desktop View - Table */}
            <div className="bg-white border border-primary-100 rounded-xl overflow-x-auto shadow-sm hidden lg:block">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-neutrals-900 text-sm font-mono font-bold border-b border-primary-100">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className={`p-4 font-bold ${h.center ? "text-center" : ""}`}>
                                    {h.heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => renderRow(item, index))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="lg:hidden grid gap-3">
                {renderMobileCard
                    ? data.map((item, index) => renderMobileCard(item, index))
                    : data.map((item, index) => (
                        <article key={item?.id ?? item?._id ?? index} className="rounded-xl border border-primary-100 bg-white p-4 shadow-sm">
                            <dl className="grid grid-cols-1 gap-3">
                                {headers.map((header, columnIndex) => (
                                    <div key={header.heading ?? columnIndex} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                        <dt className="text-xs font-medium text-gray-500">{header.heading}</dt>
                                        <dd className="min-w-0 text-right text-sm text-gray-900">{item?.[header.key] ?? "—"}</dd>
                                    </div>
                                ))}
                            </dl>
                        </article>
                    ))}
            </div>

            {showPagination && pagination && (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm font-mono text-gray-500">
                            Showing <span>{(pagination.page - 1) * pagination.limit + 1}</span> - <span>{pagination?.page === pagination?.totalPages ? pagination.total : pagination?.page * pagination?.limit}</span> of <span>{pagination?.total}</span> results 
                        </span>
                        <Pagination pagination={pagination} />
                    </div>
                </div>
            )}
            {children}
        </div>
    );
}
