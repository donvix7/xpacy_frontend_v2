import Pagination from "./Pagination";
import { Suspense } from "react";
import EmptyState from "./EmptyState";

/**
 * Unified data table used across all dashboards.
 *
 * Two ways to use it:
 *
 * 1. Declarative (preferred) — pass `columns`; rows and mobile cards are generated:
 *      columns = [{ heading, key, center, align: "right", className, render: (item, index) => node }]
 *
 * 2. Custom — pass `headers` + `renderRow` (+ optional `renderMobileCard`).
 *
 * @param {string}    title            Optional section title.
 * @param {Array}     columns          Declarative column definitions.
 * @param {Array}     headers          Legacy header objects { heading, center, key }.
 * @param {Array}     data             Rows to display.
 * @param {Function}  renderRow        Custom desktop <tr> renderer.
 * @param {Function}  renderMobileCard Custom mobile card renderer.
 * @param {Function}  rowKey           (item, index) => unique key.
 * @param {Object}    pagination       { page, limit, total, totalPages }.
 * @param {string}    emptyMessage     Message when there is no data.
 * @param {ReactNode} emptyState       Custom empty state node (overrides emptyMessage).
 * @param {ReactNode} headerActions    Actions / filters shown beside the title.
 * @param {ReactNode} footer           Optional node rendered under the table (e.g. totals).
 * @param {string}    className        Extra classes for the wrapper.
 * @param {boolean}   showPagination   Whether to render pagination.
 */
export default function DataTable({
    title,
    columns,
    headers = [],
    data = [],
    renderRow,
    renderMobileCard,
    rowKey,
    pagination,
    emptyMessage = "No items found.",
    emptyState,
    headerActions,
    footer,
    className = "",
    showPagination = true,
    children,
}) {
    const rows = Array.isArray(data) ? data : [];
    const cols = Array.isArray(columns) && columns.length ? columns : null;
    const heads = cols || headers;
    const keyOf = (item, index) =>
        (rowKey ? rowKey(item, index) : null) ?? item?.id ?? item?._id ?? index;

    const alignClass = (col) =>
        col?.align === "right" ? "text-right" : col?.center ? "text-center" : "";

    const cellValue = (col, item, index) => {
        if (typeof col.render === "function") return col.render(item, index);
        const value = col.key ? item?.[col.key] : undefined;
        return value === undefined || value === null || value === "" ? "—" : value;
    };

    const defaultRow = (item, index) => (
        <tr
            key={keyOf(item, index)}
            className="border-b border-line text-sm text-ink transition-colors last:border-0 hover:bg-soft"
        >
            {cols.map((col, i) => (
                <td key={col.heading || col.key || i} className={`p-4 align-middle ${alignClass(col)} ${col.className || ""}`}>
                    {cellValue(col, item, index)}
                </td>
            ))}
        </tr>
    );

    const defaultCard = (item, index) => {
        const [primary, ...rest] = cols || [];
        return (
            <article key={keyOf(item, index)} className="rounded-xl border border-line bg-card p-4 shadow-sm">
                {primary && (
                    <div className="mb-3 min-w-0 text-sm font-semibold text-ink">
                        {cellValue(primary, item, index)}
                    </div>
                )}
                <dl className="grid grid-cols-1 gap-2.5">
                    {rest.map((col, i) => (
                        <div
                            key={col.heading || col.key || i}
                            className="flex items-start justify-between gap-4 border-t border-line pt-2.5"
                        >
                            {col.heading ? (
                                <dt className="shrink-0 text-xs font-medium text-mute">{col.heading}</dt>
                            ) : (
                                <dt className="sr-only">Actions</dt>
                            )}
                            <dd className={`min-w-0 text-right text-sm text-ink ${col.heading ? "" : "ml-auto"}`}>
                                {cellValue(col, item, index)}
                            </dd>
                        </div>
                    ))}
                </dl>
            </article>
        );
    };

    const legacyCard = (item, index) => (
        <article key={keyOf(item, index)} className="rounded-xl border border-line bg-card p-4 shadow-sm">
            <dl className="grid grid-cols-1 gap-3">
                {heads.map((header, columnIndex) => (
                    <div key={header.heading ?? columnIndex} className="flex items-start justify-between gap-4 border-b border-line pb-2 last:border-0 last:pb-0">
                        <dt className="text-xs font-medium text-mute">{header.heading}</dt>
                        <dd className="min-w-0 text-right text-sm text-ink">{item?.[header.key] ?? "—"}</dd>
                    </div>
                ))}
            </dl>
        </article>
    );

    const rowRenderer = renderRow || (cols ? defaultRow : null);
    const cardRenderer = renderMobileCard || (cols ? defaultCard : legacyCard);

    return (
        <div className={`flex flex-col gap-6 rounded-lg ${className}`}>
            {(title || headerActions) && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
                    {headerActions && <div className="flex flex-wrap items-center gap-3">{headerActions}</div>}
                </div>
            )}

            {!rows.length && (emptyState || <EmptyState message={emptyMessage} />)}

            {/* Desktop view */}
            {rows.length > 0 && rowRenderer && (
                <div className="hidden overflow-x-auto rounded-xl border border-line bg-card shadow-sm lg:block">
                    <table className="w-full border-collapse text-left">
                        <thead className="border-b border-line bg-soft font-mono text-sm font-bold text-ink">
                            <tr>
                                {heads.map((h, i) => (
                                    <th key={i} className={`p-4 font-bold ${alignClass(h)}`}>
                                        {h.heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>{rows.map((item, index) => rowRenderer(item, index))}</tbody>
                    </table>
                    {footer}
                </div>
            )}

            {/* Mobile view */}
            {rows.length > 0 && (
                <div className="grid gap-3 lg:hidden">
                    {rows.map((item, index) => cardRenderer(item, index))}
                    {footer && <div className="rounded-xl border border-line bg-card">{footer}</div>}
                </div>
            )}

            {rows.length > 0 && showPagination && pagination && (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-mono text-sm text-mute">
                        Showing <span>{(pagination.page - 1) * pagination.limit + 1}</span> -{" "}
                        <span>{pagination?.page === pagination?.totalPages ? pagination.total : pagination?.page * pagination?.limit}</span> of{" "}
                        <span>{pagination?.total}</span> results
                    </span>
                    <Suspense fallback={<div className="h-10" />}>
                        <Pagination pagination={pagination} />
                    </Suspense>
                </div>
            )}
            {children}
        </div>
    );
}
