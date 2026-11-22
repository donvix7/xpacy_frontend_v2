import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import DataTable from "./DataTable";

const buildColumns = (fieldHeading, valueHeading) => [
    {
        heading: fieldHeading,
        render: (row) => {
            const Icon = row.icon;
            return (
                <div className="flex items-center gap-2.5">
                    {Icon ? (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50 dark:bg-primary-950/40">
                            <Icon
                                className="h-3.5 w-3.5 text-primary"
                                aria-hidden="true"
                            />
                        </div>
                    ) : null}
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-mute">
                        {row.label}
                    </span>
                </div>
            );
        },
    },
    {
        heading: valueHeading,
        render: (row) => (
            <div
                className={`flex items-center justify-between gap-2 text-[13.5px] font-medium text-ink ${
                    row.mono ? "font-mono" : ""
                }`}
            >
                {row.href ? (
                    <Link
                        href={row.href}
                        className="inline-flex items-center gap-1 transition-colors hover:text-primary hover:underline"
                    >
                        <span>{row.value}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-mute" />
                    </Link>
                ) : (
                    <span className="break-words">{row.value}</span>
                )}
                {row.action || null}
            </div>
        ),
    },
];

export default function KeyValueDataTable({
    rows = [],
    fieldHeading = "Field",
    valueHeading = "Details",
    emptyMessage = "No details available.",
    keepEmpty = false,
}) {
    const filteredRows = keepEmpty
        ? rows.filter(Boolean)
        : rows
              .filter(Boolean)
              .filter(
                  (row) =>
                      row.value !== undefined &&
                      row.value !== null &&
                      row.value !== "" &&
                      row.value !== "—"
              );

    return (
        <DataTable
            data={filteredRows}
            columns={buildColumns(fieldHeading, valueHeading)}
            showPagination={false}
            className="p-0! border-none shadow-none"
            rowKey={(row, idx) => `${row.label}-${idx}`}
            emptyMessage={emptyMessage}
        />
    );
}

