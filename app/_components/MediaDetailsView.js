import Link from "next/link";
import {
    Calendar,
    CalendarCheck,
    ChevronLeft,
    ExternalLink,
    FileCode2,
    HardDrive,
    Home,
    Image as ImageIcon,
    Link2,
    Pencil,
    Tag,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DeleteMediaButton from "@/app/_components/DeleteMediaButton";
import MediaPreviewModalButton from "@/app/_components/MediaPreviewModalButton";
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
        ? "Media"
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

export default function MediaDetailsView({
    media,
    basePath = "/dashboard/property-owner",
    propertyId: propertyIdProp = null,
    dataErrorMessages = [],
}) {
    const mediaHref = propertyIdProp
        ? `${basePath}/properties/${encodeURIComponent(propertyIdProp)}/media`
        : `${basePath}/properties`;

    if (!media || typeof media !== "object") {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href={mediaHref}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-mute transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to media
                </Link>
                <EmptyState
                    icon={<ImageIcon className="h-10 w-10 text-primary" aria-hidden="true" />}
                    title="Media not found"
                    message="This media asset may have been deleted or the link is incorrect."
                />
            </div>
        );
    }

    const mediaId = media.id || media._id || "";
    const title =
        media.fileName || media.caption || media.title || media.name || "Untitled Media";
    const kindValue = media.kind || media.type || "IMAGE";
    const typeLabel = titleCase(kindValue);
    const sizeText = formatFileSize(media.fileSize);
    const mimeType = media.mimeType || "—";
    const sortOrder = media.sortOrder ?? 0;
    const propertyName = media.property?.name || media.propertyName || null;
    const propertyId = media.property?.id || media.propertyId || null;

    const isImage =
        String(mimeType).startsWith("image/") ||
        String(kindValue).toUpperCase() === "IMAGE" ||
        String(kindValue).toUpperCase() === "FLOOR_PLAN" ||
        /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(String(media.url || ""));
    const isVideo =
        String(mimeType).startsWith("video/") ||
        String(kindValue).toUpperCase() === "VIDEO" ||
        /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(String(media.url || ""));

    const detailRows = [
        { label: "File Name", value: media.fileName || title, icon: ImageIcon },
        { label: "Kind", value: typeLabel, icon: Tag },
        ...(media.caption
            ? [{ label: "Caption", value: media.caption, icon: Tag }]
            : []),
        {
            label: "Property",
            value: propertyName || (propertyId ? "Linked Property" : "—"),
            icon: Home,
            href: propertyId
                ? `${basePath}/properties/${encodeURIComponent(propertyId)}`
                : null,
        },
        { label: "MIME Type", value: mimeType, icon: FileCode2, mono: true },
        { label: "File Size", value: sizeText, icon: HardDrive, mono: true },
        { label: "Sort Order", value: String(sortOrder), icon: Tag, mono: true },
        {
            label: "Media URL",
            value: media.url ? (
                <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 break-all text-primary hover:underline"
                >
                    <span>{media.url}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
            ) : (
                "—"
            ),
            icon: Link2,
            mono: true,
        },
        {
            label: "Uploaded",
            value: formatDateTime(media.createdAt || media.created_at),
            icon: Calendar,
        },
        {
            label: "Last Updated",
            value: formatDateTime(media.updatedAt || media.updated_at),
            icon: CalendarCheck,
        },
    ];

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href={mediaHref}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-mute transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to media
            </Link>

            <HeroBand
                tagline={`Media asset · ${typeLabel}`}
                title={title}
                description={
                    media.caption ||
                    `Uploaded ${formatDate(media.createdAt || media.created_at)}${propertyName ? ` · ${propertyName}` : ""}`
                }
                stats={[
                    { label: "Type", value: typeLabel, hint: "Media category" },
                    { label: "Format", value: mimeType, hint: "MIME type" },
                    { label: "Size", value: sizeText, hint: "Asset size" },
                    {
                        label: "Uploaded",
                        value: formatDate(media.createdAt || media.created_at),
                        hint: "Date added",
                    },
                ]}
                actions={
                    <>
                        {mediaId && (
                            <Link
                                href={`/admin/add-new-media?mediaId=${encodeURIComponent(mediaId)}${propertyId ? `&propertyId=${encodeURIComponent(propertyId)}` : ""}&returnTo=${encodeURIComponent(`${mediaHref}/${encodeURIComponent(mediaId)}`)}`}
                                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                            >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                                Edit media
                            </Link>
                        )}
                        {media.url && (
                            <MediaPreviewModalButton
                                url={media.url}
                                title={title}
                                caption={media.caption || ""}
                                kind={kindValue}
                                mimeType={mimeType}
                                variant="hero"
                                label="Open asset"
                            />
                        )}
                        {mediaId && (
                            <DeleteMediaButton
                                mediaId={mediaId}
                                mediaTitle={title}
                                propertyId={propertyId || propertyIdProp || null}
                                redirectTo={mediaHref}
                                variant="hero"
                            />
                        )}
                    </>
                }
            />

            {media.url && (isImage || isVideo) && (
                <DashboardGridItem title="Preview">
                    <div className="flex items-center justify-center overflow-hidden rounded-xl border border-line bg-soft/40 p-4">
                        {isImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={media.url}
                                alt={title}
                                className="max-h-[460px] w-auto rounded-lg object-contain"
                            />
                        ) : (
                            <video
                                src={media.url}
                                controls
                                className="max-h-[460px] w-full rounded-lg"
                            />
                        )}
                    </div>
                </DashboardGridItem>
            )}

            <DashboardGridItem title="Media Information">
                <KeyValueDataTable
                    rows={detailRows}
                    fieldHeading="Field"
                    valueHeading="Details"
                />
            </DashboardGridItem>
        </div>
    );
}

