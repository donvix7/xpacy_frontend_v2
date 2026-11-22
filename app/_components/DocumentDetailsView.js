import Link from "next/link";
import {
    Calendar,
    CalendarCheck,
    ChevronLeft,
    ExternalLink,
    FileCode2,
    FileText,
    HardDrive,
    Home,
    Link2,
    Tag,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DeleteDocumentButton from "@/app/_components/DeleteDocumentButton";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import KeyValueDataTable from "@/app/_components/KeyValueDataTable";
import DataErrorNotice from "@/app/_components/DataErrorNotice";

const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          });
};

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
    if (!Number.isFinite(num) || num <= 0) return "—";
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DocumentDetailsView({
    document,
    basePath = "/dashboard/property-owner",
    dataErrorMessages = [],
}) {
    const documentsHref = `${basePath}/documents`;

    if (!document || typeof document !== "object") {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href={documentsHref}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to documents
                </Link>
                <EmptyState
                    icon={<FileText className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Document not found"
                    message="This document may have been deleted or the link is incorrect."
                />
            </div>
        );
    }

    const docId = document.id || document._id || "";
    const name = document.name || "Untitled Document";
    const typeLabel = titleCase(document.type);
    const sizeText = formatFileSize(document.fileSize);
    const mimeType = document.mimeType || "—";
    const propertyName = document.property?.name || document.propertyName || null;
    const propertyId = document.property?.id || document.propertyId || null;
    const isImage =
        String(mimeType).startsWith("image/") ||
        /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(String(document.url || ""));

    const detailRows = [
        { label: "Document Name", value: name, icon: FileText },
        { label: "Type", value: typeLabel, icon: Tag },
        {
            label: "Property",
            value: propertyName || (propertyId ? "Linked Property" : "Organization-wide"),
            icon: Home,
            href: propertyId
                ? `${basePath}/properties/${encodeURIComponent(propertyId)}`
                : null,
        },
        { label: "MIME Type", value: mimeType, icon: FileCode2, mono: true },
        { label: "File Size", value: sizeText, icon: HardDrive, mono: true },
        {
            label: "Document URL",
            value: document.url ? (
                <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                >
                    <span>{document.url}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
            ) : null,
            icon: Link2,
            mono: true,
        },
        { label: "Created", value: formatDateTime(document.createdAt), icon: Calendar },
        { label: "Last Updated", value: formatDateTime(document.updatedAt), icon: CalendarCheck },
    ];

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href={documentsHref}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to documents
            </Link>

            <HeroBand
                tagline="Document Record"
                title={name}
                description={[typeLabel, propertyName || "Organization-wide"]
                    .filter(Boolean)
                    .join(" · ")}
                badge={
                    <span className="inline-flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                        {typeLabel}
                    </span>
                }
                stats={[
                    { label: "Type", value: typeLabel, hint: "Category" },
                    { label: "Format", value: mimeType, hint: "MIME type" },
                    { label: "File Size", value: sizeText, hint: "Stored size" },
                    { label: "Added", value: formatDate(document.createdAt), hint: "Upload date" },
                ]}
                actions={
                    <>
                        {document.url && (
                            <a
                                href={document.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3.5 py-2 text-xs font-semibold text-side transition-colors hover:bg-white"
                            >
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                Open Document
                            </a>
                        )}
                        {docId && (
                            <DeleteDocumentButton
                                documentId={docId}
                                documentName={name}
                                redirectTo={documentsHref}
                                variant="hero"
                            />
                        )}
                    </>
                }
            />

            <DashboardGridItem title="Document Information">
                <KeyValueDataTable rows={detailRows} />
            </DashboardGridItem>

            {isImage && document.url && (
                <DashboardGridItem title="Preview">
                    <div className="overflow-hidden rounded-xl border border-line bg-canvas p-2">
                        <img
                            src={document.url}
                            alt={name}
                            className="mx-auto max-h-[520px] rounded-lg object-contain"
                        />
                    </div>
                </DashboardGridItem>
            )}
        </div>
    );
}

