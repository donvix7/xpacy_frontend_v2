"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Building2,
    Film,
    Image as ImageIcon,
    UploadCloud,
    X,
} from "lucide-react";
import AdminHeader from "@/app/_components/AdminHeader";
import FormInput from "@/app/_components/FormInput";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { createMedia, updateMedia } from "@/app/_lib/action";

const MEDIA_KINDS = [
    { value: "IMAGE", label: "Image" },
    { value: "VIDEO", label: "Video" },
    { value: "FLOOR_PLAN", label: "Floor Plan" },
    { value: "DOCUMENT", label: "Document" },
];

const inputClass = (hasError) =>
    `rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink ${
        hasError ? "border-error" : "border-line"
    }`;

const readOnlyClass =
    "rounded-lg border border-line bg-soft/70 px-4 py-3 text-ink/80 cursor-not-allowed select-none";

function formatFileSize(bytes) {
    const num = Number(bytes);
    if (!Number.isFinite(num) || num <= 0) return "—";
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MediaForm({
    initialData = null,
    isEditMode = false,
    defaultPropertyId = "",
    propertyName = "",
    defaultReturnTo = "",
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fileInputRef = useRef(null);

    const effectiveData = initialData || {};
    const mediaId = effectiveData?.id || effectiveData?._id || null;
    const resolvedPropertyId =
        defaultPropertyId ||
        searchParams?.get("propertyId") ||
        effectiveData?.propertyId ||
        "";

    const rawReturnTo = defaultReturnTo || searchParams?.get("returnTo") || "";
    const backHref =
        rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
            ? rawReturnTo
            : isEditMode && resolvedPropertyId && mediaId
              ? `/dashboard/property-owner/properties/${encodeURIComponent(resolvedPropertyId)}/media/${encodeURIComponent(mediaId)}`
              : resolvedPropertyId
                ? `/dashboard/property-owner/properties/${encodeURIComponent(resolvedPropertyId)}/media`
                : "/dashboard/property-owner/properties";

    const [isPending, setIsPending] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [objectPreviewUrl, setObjectPreviewUrl] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            propertyId: resolvedPropertyId || "",
            kind: effectiveData?.kind || effectiveData?.type || "IMAGE",
            url: effectiveData?.url || "",
            caption: effectiveData?.caption || "",
            fileName: effectiveData?.fileName || effectiveData?.name || "",
            fileSize: effectiveData?.fileSize ?? "",
            mimeType: effectiveData?.mimeType || "",
            sortOrder: effectiveData?.sortOrder ?? 0,
        },
    });

    const watchedUrl = watch("url");
    const watchedKind = watch("kind");
    const watchedFileName = watch("fileName");
    const watchedFileSize = watch("fileSize");
    const watchedMimeType = watch("mimeType");

    // Clean up blob object URL when replaced or unmounted
    useEffect(() => {
        return () => {
            if (objectPreviewUrl) {
                URL.revokeObjectURL(objectPreviewUrl);
            }
        };
    }, [objectPreviewUrl]);

    const applySelectedFile = (file) => {
        if (!file) return;
        const mime = String(file.type || "").toLowerCase();
        const isImage = mime.startsWith("image/");
        const isVideo = mime.startsWith("video/");

        if (!isImage && !isVideo) {
            toast.error("Please select a picture or video file.");
            return;
        }

        if (objectPreviewUrl) {
            URL.revokeObjectURL(objectPreviewUrl);
        }

        const nextPreviewUrl = URL.createObjectURL(file);
        setSelectedFile(file);
        setObjectPreviewUrl(nextPreviewUrl);

        // Extract and populate file metadata automatically
        setValue("fileName", file.name, { shouldDirty: true });
        setValue("fileSize", file.size, { shouldDirty: true });
        setValue("mimeType", file.type || (isVideo ? "video/mp4" : "image/jpeg"), {
            shouldDirty: true,
        });
        setValue("kind", isVideo ? "VIDEO" : "IMAGE", { shouldDirty: true });
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) applySelectedFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        const file = event.dataTransfer?.files?.[0];
        if (file) applySelectedFile(file);
    };

    const clearSelectedFile = () => {
        if (objectPreviewUrl) {
            URL.revokeObjectURL(objectPreviewUrl);
        }
        setSelectedFile(null);
        setObjectPreviewUrl("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (!isEditMode) {
            setValue("fileName", "");
            setValue("fileSize", "");
            setValue("mimeType", "");
        }
    };

    const onSubmit = (data) => {
        if (isPending) return;

        const targetPropertyId = String(
            resolvedPropertyId || data.propertyId || ""
        ).trim();

        if (!targetPropertyId) {
            toast.error("No property is linked to this media upload.");
            return;
        }

        // CreatePropertyMediaDto
        const payload = {
            propertyId: targetPropertyId,
            kind: data.kind || "IMAGE",
            url: (data.url || "").trim(),
            ...(data.caption?.trim() ? { caption: data.caption.trim() } : {}),
            ...(data.fileName?.trim() ? { fileName: data.fileName.trim() } : {}),
            ...(data.fileSize !== "" && data.fileSize != null
                ? { fileSize: Number(data.fileSize) }
                : {}),
            ...(data.mimeType?.trim() ? { mimeType: data.mimeType.trim() } : {}),
            sortOrder:
                data.sortOrder !== "" && data.sortOrder != null
                    ? Number(data.sortOrder)
                    : 0,
        };

        const actionPromise =
            isEditMode && mediaId
                ? updateMedia(mediaId, payload, targetPropertyId)
                : createMedia(payload);

        setIsPending(true);
        toast.promise(actionPromise, {
            loading: isEditMode ? "Updating media..." : "Saving media...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(res?.message || "Failed to save media.");
                }
                if (!isEditMode) {
                    clearSelectedFile();
                    reset();
                }
                router.refresh();
                setTimeout(() => {
                    router.push(backHref);
                }, 600);
                return (
                    res?.message ||
                    (isEditMode
                        ? "Media updated successfully!"
                        : "Media saved successfully!")
                );
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to save media.";
            },
        });
    };

    const activePreviewUrl = objectPreviewUrl || watchedUrl || "";
    const isPreviewVideo =
        String(watchedMimeType || "").startsWith("video/") ||
        watchedKind === "VIDEO" ||
        /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(String(activePreviewUrl));
    const isPreviewImage =
        !isPreviewVideo &&
        Boolean(activePreviewUrl) &&
        (Boolean(objectPreviewUrl) ||
            String(watchedMimeType || "").startsWith("image/") ||
            watchedKind === "IMAGE" ||
            watchedKind === "FLOOR_PLAN" ||
            /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(String(activePreviewUrl)));

    const propertyDisplayLabel =
        propertyName || (resolvedPropertyId ? "Selected Property" : "No property selected");

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader
                title={isEditMode ? "Edit Media" : "Add Media"}
                backHref={backHref}
            />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        {isEditMode ? "Edit Property Media" : "Add Property Media"}
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        {isEditMode
                            ? "Update media kind, URL, caption, or display order for this asset."
                            : "Drop or select a picture or video to auto-extract its file details and attach it to this property."}
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                >
                    {/* Hidden locked propertyId */}
                    <input
                        type="hidden"
                        {...register("propertyId")}
                        value={resolvedPropertyId}
                    />

                    {/* Media Upload & Preview */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Media File &amp; Preview
                        </p>

                        {/* Locked Property Display */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Property (Locked)" id="propertyDisplay">
                                <div
                                    id="propertyDisplay"
                                    aria-readonly="true"
                                    className={`${readOnlyClass} flex items-center gap-2.5 text-sm font-medium`}
                                >
                                    <Building2
                                        className="h-4 w-4 shrink-0 text-primary"
                                        aria-hidden="true"
                                    />
                                    <span className="truncate">{propertyDisplayLabel}</span>
                                </div>
                            </FormInput>

                            <FormInput label="Media Kind" id="kind">
                                <select
                                    {...register("kind")}
                                    id="kind"
                                    className={inputClass(false)}
                                >
                                    {MEDIA_KINDS.map((k) => (
                                        <option key={k.value} value={k.value}>
                                            {k.label}
                                        </option>
                                    ))}
                                </select>
                            </FormInput>
                        </div>

                        {/* Drag and Drop File Input (Images & Videos Only) */}
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-ink">
                                Select Picture or Video
                            </span>
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        fileInputRef.current?.click();
                                    }
                                }}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
                                    isDragging
                                        ? "border-primary bg-primary/10"
                                        : "border-line bg-soft/40 hover:border-primary/60 hover:bg-soft/70"
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <UploadCloud className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-ink">
                                        {selectedFile
                                            ? selectedFile.name
                                            : "Drag & drop a picture or video here, or click to browse"}
                                    </p>
                                    <p className="mt-1 text-xs text-mute">
                                        Supports images (JPG, PNG, WebP) and videos (MP4, WebM, MOV). File name, size, MIME type, and kind are extracted automatically.
                                    </p>
                                </div>
                                {selectedFile && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearSelectedFile();
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-medium text-mute hover:text-error transition-colors cursor-pointer"
                                    >
                                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                                        Remove file
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Preview Section + Extracted Metadata */}
                        {(activePreviewUrl || watchedFileName || watchedMimeType || watchedFileSize) && (
                            <div className="overflow-hidden rounded-xl border border-line bg-soft/40">
                                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mute">
                                        {isPreviewVideo ? (
                                            <Film className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                                        ) : (
                                            <ImageIcon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                                        )}
                                        Media Preview &amp; Extracted Details
                                    </span>
                                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                                        {watchedKind || "IMAGE"}
                                    </span>
                                </div>

                                {activePreviewUrl && (isPreviewImage || isPreviewVideo) && (
                                    <div className="flex items-center justify-center bg-black/5 p-4 dark:bg-black/25">
                                        {isPreviewVideo ? (
                                            <video
                                                key={activePreviewUrl}
                                                src={activePreviewUrl}
                                                controls
                                                className="max-h-72 w-full rounded-lg"
                                            />
                                        ) : (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={activePreviewUrl}
                                                alt={watchedFileName || "Media preview"}
                                                className="max-h-72 w-auto rounded-lg object-contain"
                                            />
                                        )}
                                    </div>
                                )}

                                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-line p-4 text-xs">
                                    <div className="min-w-0">
                                        <dt className="font-semibold uppercase tracking-wider text-mute text-[10.5px]">
                                            File Name
                                        </dt>
                                        <dd className="mt-1 truncate font-mono font-medium text-ink">
                                            {watchedFileName || "—"}
                                        </dd>
                                    </div>
                                    <div className="min-w-0">
                                        <dt className="font-semibold uppercase tracking-wider text-mute text-[10.5px]">
                                            MIME Type
                                        </dt>
                                        <dd className="mt-1 truncate font-mono font-medium text-ink">
                                            {watchedMimeType || "—"}
                                        </dd>
                                    </div>
                                    <div className="min-w-0">
                                        <dt className="font-semibold uppercase tracking-wider text-mute text-[10.5px]">
                                            File Size
                                        </dt>
                                        <dd className="mt-1 truncate font-mono font-medium text-ink">
                                            {watchedFileSize
                                                ? `${formatFileSize(watchedFileSize)} (${Number(watchedFileSize).toLocaleString()} B)`
                                                : "—"}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        )}
                    </div>

                    {/* Media Details */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Media Details
                        </p>

                        <FormInput label="Media URL *" id="url">
                            <input
                                {...register("url", {
                                    required: "Media URL is required",
                                })}
                                type="url"
                                id="url"
                                placeholder="https://storage.example.com/media/living-room.jpg"
                                className={`font-mono ${inputClass(errors.url)}`}
                            />
                            {errors.url && (
                                <span className="-mt-2 text-xs text-error">
                                    {errors.url.message}
                                </span>
                            )}
                        </FormInput>

                        <FormInput label="Caption" id="caption">
                            <textarea
                                {...register("caption")}
                                id="caption"
                                rows={3}
                                placeholder="Optional caption describing this picture or video"
                                className={`${inputClass(false)} resize-y`}
                            />
                        </FormInput>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Sort Order" id="sortOrder">
                                <input
                                    {...register("sortOrder", {
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    step="1"
                                    id="sortOrder"
                                    placeholder="0"
                                    className={inputClass(errors.sortOrder)}
                                />
                            </FormInput>

                            <FormInput label="Extracted File Name" id="fileName">
                                <input
                                    {...register("fileName")}
                                    type="text"
                                    id="fileName"
                                    readOnly
                                    placeholder="Auto-filled from selected file"
                                    className={`font-mono ${readOnlyClass}`}
                                />
                            </FormInput>
                        </div>

                        {/* Hidden extracted metadata fields registered with react-hook-form */}
                        <input type="hidden" {...register("fileSize")} />
                        <input type="hidden" {...register("mimeType")} />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-line pt-6">
                        <Link
                            href={backHref}
                            className="w-full sm:w-auto text-center rounded-lg border border-line px-6 py-3 font-mono text-sm font-medium text-ink hover:bg-canvas transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-mono text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer"
                        >
                            {isPending ? (
                                <SpinnerMini />
                            ) : (
                                <ImageIcon className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span>
                                {isPending
                                    ? isEditMode
                                        ? "Updating..."
                                        : "Saving..."
                                    : isEditMode
                                      ? "Save Changes"
                                      : "Save Media"}
                            </span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
