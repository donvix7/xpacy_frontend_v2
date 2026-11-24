"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Eye, Film, Image as ImageIcon, X } from "lucide-react";

function detectVideo(url, kind, mimeType) {
    const mime = String(mimeType || "").toLowerCase();
    const k = String(kind || "").toUpperCase();
    return (
        mime.startsWith("video/") ||
        k === "VIDEO" ||
        /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(String(url || ""))
    );
}

function detectImage(url, kind, mimeType) {
    if (detectVideo(url, kind, mimeType)) return false;
    const mime = String(mimeType || "").toLowerCase();
    const k = String(kind || "").toUpperCase();
    return (
        mime.startsWith("image/") ||
        k === "IMAGE" ||
        k === "FLOOR_PLAN" ||
        /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(String(url || ""))
    );
}

export default function MediaPreviewModalButton({
    url,
    title = "Media Preview",
    caption = "",
    kind = "IMAGE",
    mimeType = "",
    variant = "compact", // "compact" | "hero"
    label = "Open",
}) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    if (!url) return null;

    const isVideo = detectVideo(url, kind, mimeType);
    const isImage = detectImage(url, kind, mimeType);

    const buttonClass =
        variant === "hero"
            ? "inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 cursor-pointer"
            : "inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary cursor-pointer";

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={buttonClass}
            >
                <Eye
                    className={variant === "hero" ? "h-4 w-4" : "h-3 w-3"}
                    aria-hidden="true"
                />
                <span>{label}</span>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    aria-label={title}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-card text-left text-ink shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    {isVideo ? (
                                        <Film className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <ImageIcon className="h-4 w-4" aria-hidden="true" />
                                    )}
                                </span>
                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-semibold text-ink">
                                        {title}
                                    </h3>
                                    {caption && caption !== title ? (
                                        <p className="truncate text-xs text-mute">
                                            {caption}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span className="hidden sm:inline">Open in new tab</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    aria-label="Close preview"
                                    className="rounded-lg p-1.5 text-mute transition-colors hover:bg-soft hover:text-ink cursor-pointer"
                                >
                                    <X className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex flex-1 items-center justify-center overflow-auto bg-black/90 p-4">
                            {isVideo ? (
                                <video
                                    src={url}
                                    controls
                                    className="max-h-[75vh] w-full rounded-lg"
                                />
                            ) : isImage ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={url}
                                    alt={title}
                                    className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-10 text-center text-white">
                                    <p className="text-sm font-medium">
                                        Preview is not available for this file type.
                                    </p>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-side hover:bg-white/90"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                        Open file in new tab
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

