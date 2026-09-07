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
            <div className="bg-white border border-primary-100 rounded-xl overflow-x-scroll shadow-sm hidden lg:block">
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
            <div className="lg:hidden flex flex-col bg-white border border-primary-100 rounded-xl overflow-hidden shadow-sm">
                {data.map((item, index) => renderMobileCard(item, index))}
            </div>

            {showPagination && pagination && (
                <div className="mt-3">
                    <div className="flex items-center justify-between">
                        <span className="text-base font-mono text-base-500 ">
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

