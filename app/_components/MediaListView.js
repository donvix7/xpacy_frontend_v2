import Link from "next/link";
import {
    ArrowUpRight,
    ChevronLeft,
    ExternalLink,
    Film,
    Image as ImageIcon,
    Layers,
    Pencil,
    Plus,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import DeleteMediaButton from "@/app/_components/DeleteMediaButton";
import MediaPreviewModalButton from "@/app/_components/MediaPreviewModalButton";
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
        ? "Media"
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

function isImageMedia(item) {
    const mime = String(item?.mimeType || "").toLowerCase();
    const kind = String(item?.kind || item?.type || "").toUpperCase();
    const url = String(item?.url || "");
    return (
        mime.startsWith("image/") ||
        kind === "IMAGE" ||
        /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url)
    );
}

function isVideoMedia(item) {
    const mime = String(item?.mimeType || "").toLowerCase();
    const kind = String(item?.kind || item?.type || "").toUpperCase();
    const url = String(item?.url || "");
    return (
        mime.startsWith("video/") ||
        kind === "VIDEO" ||
        /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)
    );
}

export default function MediaListView({
    media = [],
    basePath = "/dashboard/property-owner",
    propertyId = null,
    propertyName = null,
    dataErrorMessages = [],
}) {
    const list = Array.isArray(media) ? media : [];
    const mediaHref = propertyId
        ? `${basePath}/properties/${encodeURIComponent(propertyId)}/media`
        : `${basePath}/properties`;
    const propertyHref = propertyId
        ? `${basePath}/properties/${encodeURIComponent(propertyId)}`
        : null;
    const addHref = propertyId
        ? `/admin/add-new-media?propertyId=${encodeURIComponent(propertyId)}&returnTo=${encodeURIComponent(mediaHref)}`
        : `/admin/add-new-media?returnTo=${encodeURIComponent(mediaHref)}`;

    const imageCount = list.filter(isImageMedia).length;
    const videoCount = list.filter(isVideoMedia).length;
    const planAndDocCount = list.filter((m) =>
        ["FLOOR_PLAN", "DOCUMENT"].includes(
            String(m?.kind || m?.type || "").toUpperCase()
        )
    ).length;

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const columns = [
        {
            heading: "Media",
            render: (item) => {
                const id = item?.id || item?._id;
                const title =
                    item?.fileName ||
                    item?.caption ||
                    item?.title ||
                    item?.name ||
                    "Untitled Media";
                const detailHref = id ? `${mediaHref}/${encodeURIComponent(id)}` : null;
                const isImg = isImageMedia(item);
                const isVid = isVideoMedia(item);

                return (
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-soft">
                            {isImg && item?.url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={item.url}
                                    alt={title}
                                    className="h-full w-full object-cover"
                                />
                            ) : isVid ? (
                                <Film className="h-4 w-4 text-primary" aria-hidden="true" />
                            ) : (
                                <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
                            )}
                        </div>
                        <div className="min-w-0">
                            {detailHref ? (
                                <Link
                                    href={detailHref}
                                    className="block truncate text-sm font-semibold text-ink transition-colors hover:text-primary hover:underline"
                                >
                                    {title}
                                </Link>
                            ) : (
                                <span className="block truncate text-sm font-semibold text-ink">
                                    {title}
                                </span>
                            )}
                            {item?.caption && item?.caption !== title ? (
                                <p className="mt-0.5 max-w-[260px] truncate text-xs text-mute">
                                    {item.caption}
                                </p>
                            ) : null}
                        </div>
                    </div>
                );
            },
        },
        {
            heading: "Kind",
            render: (item) => (
                <span className="inline-flex items-center rounded-full border border-line bg-soft px-2.5 py-0.5 text-[11px] font-semibold text-ink">
                    {titleCase(item?.kind || item?.type)}
                </span>
            ),
        },
        {
            heading: "Property",
            render: (item) => {
                const propName = item?.property?.name || item?.propertyName;
                const propId = item?.property?.id || item?.propertyId;
                if (propId) {
                    return (
                        <Link
                            href={`${basePath}/properties/${encodeURIComponent(propId)}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-ink transition-colors hover:text-primary hover:underline"
                        >
                            <span>{propName || "View property"}</span>
                            <ArrowUpRight className="h-3 w-3 text-mute" />
                        </Link>
                    );
                }
                return <span className="text-xs text-mute">Organization-wide</span>;
            },
        },
        {
            heading: "Added",
            render: (item) => {
                const sizeText = formatFileSize(item?.fileSize);
                return (
                    <div className="text-xs text-mute">
                        <p className="font-medium text-ink">
                            {formatDate(item?.createdAt || item?.created_at)}
                        </p>
                        {sizeText ? <p className="font-mono text-[11px]">{sizeText}</p> : null}
                    </div>
                );
            },
        },
        {
            heading: "Actions",
            align: "right",
            render: (item) => {
                const id = item?.id || item?._id;
                const itemPropertyId =
                    propertyId || item?.property?.id || item?.propertyId || "";
                const title =
                    item?.fileName ||
                    item?.caption ||
                    item?.title ||
                    item?.name ||
                    "Untitled Media";
                const editHref = id
                    ? `/admin/add-new-media?mediaId=${encodeURIComponent(id)}${itemPropertyId ? `&propertyId=${encodeURIComponent(itemPropertyId)}` : ""}&returnTo=${encodeURIComponent(mediaHref)}`
                    : null;
                return (
                    <div className="inline-flex items-center justify-end gap-2">
                        {item?.url && (
                            <MediaPreviewModalButton
                                url={item.url}
                                title={title}
                                caption={item?.caption || ""}
                                kind={item?.kind || item?.type || "IMAGE"}
                                mimeType={item?.mimeType || ""}
                                variant="compact"
                                label="Open"
                            />
                        )}
                        {editHref && (
                            <Link
                                href={editHref}
                                className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
                            >
                                <Pencil className="h-3 w-3" aria-hidden="true" />
                                Edit
                            </Link>
                        )}
                        {id && (
                            <DeleteMediaButton
                                mediaId={id}
                                mediaTitle={title}
                                propertyId={itemPropertyId || null}
                                variant="compact"
                            />
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {propertyHref && (
                <Link
                    href={propertyHref}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-mute transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to {propertyName || "property"}
                </Link>
            )}

            <HeroBand
                tagline={`Media library · ${today}`}
                title={propertyName ? `${propertyName} — Media` : "Media"}
                description={
                    propertyName
                        ? `Manage photos, video walkthroughs, floor plans, and virtual tours for ${propertyName}.`
                        : "Organize property photos, video walkthroughs, floor plans, and virtual tours across your portfolio."
                }
                stats={[
                    { label: "Total Media", value: list.length, hint: "All assets" },
                    { label: "Images", value: imageCount, hint: "Photos & gallery" },
                    { label: "Videos", value: videoCount, hint: "Walkthroughs" },
                    { label: "Plans & Docs", value: planAndDocCount, hint: "Floor plans & docs" },
                ]}
                actions={
                    <Link
                        href={addHref}
                        className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add media
                    </Link>
                }
            />

            <DashboardGridItem title={`Media Library (${list.length})`}>
                {list.length === 0 ? (
                    <EmptyState
                        icon={<ImageIcon className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No media uploaded yet"
                        message="Add photos, video walkthroughs, or floor plans to showcase your properties."
                        cta="Add media"
                        link={addHref}
                    />
                ) : (
                    <DataTable
                        data={list}
                        columns={columns}
                        rowKey={(item, idx) => item?.id || item?._id || `media-${idx}`}
                        showPagination={list.length > 10}
                        className="p-0! border-none shadow-none"
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}

