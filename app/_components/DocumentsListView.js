import Link from "next/link";
import {
    ArrowUpRight,
    ChevronLeft,
    ExternalLink,
    FileText,
    Plus,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import DeleteDocumentButton from "@/app/_components/DeleteDocumentButton";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import DataErrorNotice from "@/app/_components/DataErrorNotice";

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
          });
};

const titleCase = (value) =>
    !value
        ? "Other"
        : String(value)
              .replace(/[_-]+/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase());

function formatFileSize(bytes) {
    const num = Number(bytes);
    if (!Number.isFinite(num) || num <= 0) return null;
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsListView({
    documents = [],
    basePath = "/dashboard/property-owner",
    propertyId = null,
    propertyName = null,
    dataErrorMessages = [],
}) {
    const list = Array.isArray(documents) ? documents : [];
    const documentsHref = propertyId
        ? `${basePath}/properties/${encodeURIComponent(propertyId)}/documents`
        : `${basePath}/documents`;
    const propertyHref = propertyId
        ? `${basePath}/properties/${encodeURIComponent(propertyId)}`
        : null;
    const addHref = propertyId
        ? `/admin/add-new-document?propertyId=${encodeURIComponent(propertyId)}&returnTo=${encodeURIComponent(documentsHref)}`
        : `/admin/add-new-document?returnTo=${encodeURIComponent(documentsHref)}`;

    const leaseCount = list.filter((d) =>
        ["LEASE", "LEASE_AGREEMENT", "CONTRACT", "DEED"].includes(
            String(d?.type || "").toUpperCase()
        )
    ).length;
    const financialCount = list.filter((d) =>
        ["INVOICE", "RECEIPT", "INSURANCE"].includes(
            String(d?.type || "").toUpperCase()
        )
    ).length;
    const otherCount = Math.max(0, list.length - leaseCount - financialCount);

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {propertyHref && (
                <Link
                    href={propertyHref}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to {propertyName || "property"}
                </Link>
            )}

            <HeroBand
                tagline={`Documents vault · ${today}`}
                title={propertyName ? `${propertyName} — Documents` : "Documents"}
                description={
                    propertyName
                        ? `Manage leases, deeds, inspection reports, and records linked to ${propertyName}.`
                        : "Manage leases, deeds, inspection reports, receipts, and organization records in one place."
                }
                stats={[
                    { label: "Total Documents", value: list.length, hint: "All records" },
                    { label: "Leases & Deeds", value: leaseCount, hint: "Legal & contracts" },
                    { label: "Financial", value: financialCount, hint: "Invoices & receipts" },
                    { label: "Other", value: otherCount, hint: "Reports & IDs" },
                ]}
                actions={
                    <Link
                        href={addHref}
                        className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add document
                    </Link>
                }
            />

            <DashboardGridItem title={`All Documents (${list.length})`}>
                {list.length === 0 ? (
                    <EmptyState
                        icon={<FileText className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No documents yet"
                        message="Upload or link your first property or organization document."
                        cta="Add document"
                        link={addHref}
                    />
                ) : (
                    <DataTable
                        data={list}
                        showPagination={list.length > 10}
                        className="p-0! border-none shadow-none"
                        rowKey={(doc, idx) => doc.id ?? doc._id ?? idx}
                        columns={[
                            {
                                heading: "Document",
                                render: (doc) => {
                                    const docId = doc.id || doc._id;
                                    const sizeText = formatFileSize(doc.fileSize);
                                    const meta = [doc.mimeType, sizeText]
                                        .filter(Boolean)
                                        .join(" · ");
                                    return (
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                {docId ? (
                                                    <Link
                                                        href={`${documentsHref}/${encodeURIComponent(docId)}`}
                                                        className="block truncate font-semibold text-ink hover:text-primary hover:underline"
                                                    >
                                                        {doc.name || "Untitled Document"}
                                                    </Link>
                                                ) : (
                                                    <p className="truncate font-semibold text-ink">
                                                        {doc.name || "Untitled Document"}
                                                    </p>
                                                )}
                                                {meta && (
                                                    <p className="truncate font-mono text-xs text-mute">
                                                        {meta}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                },
                            },
                            {
                                heading: "Type",
                                render: (doc) => (
                                    <span className="inline-flex items-center rounded-full bg-soft px-2.5 py-0.5 text-xs font-semibold text-ink">
                                        {titleCase(doc.type)}
                                    </span>
                                ),
                            },
                            {
                                heading: "Property",
                                className: "text-xs text-ink",
                                render: (doc) =>
                                    doc.property?.name ||
                                    doc.propertyName ||
                                    "Organization-wide",
                            },
                            {
                                heading: "Added",
                                className: "font-mono text-xs text-mute",
                                render: (doc) => formatDate(doc.createdAt),
                            },
                            {
                                heading: "",
                                align: "right",
                                render: (doc) => {
                                    const docId = doc.id || doc._id;
                                    return (
                                        <div className="flex items-center justify-end gap-2">
                                            {doc.url && (
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
                                                >
                                                    Open
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            {docId && (
                                                <Link
                                                    href={`${documentsHref}/${encodeURIComponent(docId)}`}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
                                                >
                                                    View
                                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                                </Link>
                                            )}
                                            {docId && (
                                                <DeleteDocumentButton
                                                    documentId={docId}
                                                    documentName={doc.name || "this document"}
                                                    variant="compact"
                                                />
                                            )}
                                        </div>
                                    );
                                },
                            },
                        ]}
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}

