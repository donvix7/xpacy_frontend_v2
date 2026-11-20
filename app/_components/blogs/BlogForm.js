"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    Save,
    AlertCircle,
    Eye,
    EyeOff,
    Hash,
    Type,
    Image as ImageIcon,
    FileText,
    ArrowLeft,
    Quote,
    Link2,
    Upload,
    X,
} from "lucide-react";
import SpinnerMini from "../SpinnerMini";
import { createBlog, updateBlog } from "../../_lib/action";
import { compressImages } from "../../_lib/image-compression";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function slugify(v = "") {
    return v
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function Field({ label, required, hint, error, children, htmlFor }) {
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <label
                    htmlFor={htmlFor}
                    className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500"
                >
                    {label}
                    {required && <span className="ml-0.5 text-red-500">*</span>}
                </label>
                {hint && (
                    <span className="text-[10.5px] text-gray-400">{hint}</span>
                )}
            </div>
            {children}
            {error && (
                <p className="mt-1 flex items-center gap-1 text-[11.5px] text-red-600">
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                    {error}
                </p>
            )}
        </div>
    );
}

const inputBase =
    "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-[13px] text-ink outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20";

/* -------------------------------------------------------------------------- */
/* Form                                                                       */
/* -------------------------------------------------------------------------- */
export default function BlogForm({ initialData = null, isEditMode = false }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [title, setTitle] = useState(initialData?.title ?? "");
    const [slug, setSlug] = useState(initialData?.slug ?? "");
    const [slugTouched, setSlugTouched] = useState(!!initialData?.slug);
    const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
    const [content, setContent] = useState(initialData?.content ?? "");
    const [coverImage, setCoverImage] = useState(
        initialData?.coverImage ?? ""
    );
    const [status, setStatus] = useState(
        initialData?.status ?? "DRAFT"
    );
    const [isCompressing, setIsCompressing] = useState(false);

    const [errors, setErrors] = useState({});

    /* ---- Auto-slug from title (only if not manually edited) ---- */
    useEffect(() => {
        if (!slugTouched && title) setSlug(slugify(title));
    }, [title, slugTouched]);

    /* ---- Cover image upload ---- */
    const handleCoverChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsCompressing(true);
        try {
            const compressed = await compressImages(file);
            // If createBlog/updateBlog accept a File via FormData, we keep it.
            // If they expect a URL, you'd upload first and set the returned URL.
            const previewUrl = URL.createObjectURL(compressed);
            setCoverImage(previewUrl);
            // Stash the File on a ref-like state so we can send it:
            setCoverFile(compressed);
            toast.success("Cover image ready");
        } catch (err) {
            console.error("Compression error:", err);
            toast.error("Failed to process image");
        } finally {
            setIsCompressing(false);
        }
    };

    const [coverFile, setCoverFile] = useState(null);

    const removeCover = () => {
        setCoverImage("");
        setCoverFile(null);
        toast.success("Cover removed");
    };

    /* ---- Submit ---- */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        /* Build JSON payload exactly as specified */
        const payload = {
            title,
            slug,
            excerpt,
            content,
            coverImage: coverFile ? undefined : coverImage || undefined,
            status,
        };

        /* If coverFile exists, we need multipart. Otherwise JSON. */
        const submit = async () => {
            try {
                let result;
                if (coverFile) {
                    const fd = new FormData();
                    fd.append("title", title);
                    fd.append("slug", slug);
                    fd.append("excerpt", excerpt);
                    fd.append("content", content);
                    fd.append("status", status);
                    fd.append("coverImage", coverFile);

                    result =
                        isEditMode && initialData?.id
                            ? await updateBlog(initialData.id, fd)
                            : await createBlog(fd);
                } else {
                    result =
                        isEditMode && initialData?.id
                            ? await updateBlog(initialData.id, payload)
                            : await createBlog(payload);
                }

                if (result?.error) {
                    if (typeof result.error === "string") {
                        toast.error(result.error);
                    } else {
                        toast.error("Please check the fields.");
                        setErrors(result.error);
                    }
                    return;
                }

                toast.success(
                    isEditMode
                        ? "Post updated successfully"
                        : status === "PUBLISHED"
                        ? "Post published"
                        : "Draft saved"
                );
                router.push("/dashboard/admin/blogs");
            } catch (err) {
                console.error("Submit error:", err);
                toast.error(err?.message ?? "Something went wrong.");
            }
        };

        startTransition(submit);
    };

    /* ---- Derived ---- */
    const isPublished = status === "PUBLISHED";
    const coverPreview = coverImage || "";

    /* ---- Render ---- */
    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-6xl pb-24">
            {/* ---------- Top bar ---------- */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back
                </button>
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                        isPublished
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                    }`}
                >
                    <span className="h-1 w-1 rounded-full bg-current" />
                    {isPublished ? "Published" : "Draft"}
                </span>
            </div>

            {/* ---------- Main grid ---------- */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                {/* =============================================== */}
                {/* LEFT — Writing area                              */}
                {/* =============================================== */}
                <div className="space-y-6">
                    {/* Title */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <Field
                            label="Title"
                            required
                            hint={`${title.length}/70`}
                            error={errors.title?.message}
                            htmlFor="title"
                        >
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Give your story a compelling title…"
                                className={`${inputBase} !border-0 !bg-transparent !px-0 !py-1 !text-[22px] !font-semibold !ring-0 focus:!ring-0`}
                            />
                        </Field>
                    </div>

                    {/* Excerpt */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <Field
                            label="Excerpt"
                            hint={`${excerpt.length} chars`}
                            error={errors.excerpt?.message}
                            htmlFor="excerpt"
                        >
                            <textarea
                                id="excerpt"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={2}
                                placeholder="A short summary shown in listings and social previews…"
                                className={`${inputBase} resize-none`}
                            />
                        </Field>
                    </div>

                    {/* Content */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <header className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-3 sm:px-6">
                            <FileText
                                className="h-4 w-4 text-primary"
                                aria-hidden="true"
                            />
                            <h2 className="text-[13.5px] font-semibold text-ink">
                                Content
                            </h2>
                            <span className="ml-auto text-[10.5px] text-gray-400">
                                HTML or Markdown
                            </span>
                        </header>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows={20}
                            placeholder="Write your story…"
                            className="block w-full resize-y border-0 bg-white px-5 py-4 font-mono text-[13px] leading-relaxed text-ink outline-none placeholder:text-gray-400 focus:ring-0 sm:px-6"
                        />
                        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-5 py-2.5 sm:px-6">
                            {errors.content?.message ? (
                                <p className="flex items-center gap-1 text-[11.5px] text-red-600">
                                    <AlertCircle
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                    />
                                    {errors.content.message}
                                </p>
                            ) : (
                                <span className="text-[11px] text-gray-400">
                                    Content supports inline HTML.
                                </span>
                            )}
                            <span className="font-mono text-[10.5px] text-gray-400">
                                {content.length.toLocaleString()} chars
                            </span>
                        </div>
                    </div>
                </div>

                {/* =============================================== */}
                {/* RIGHT — Sidebar                                  */}
                {/* =============================================== */}
                <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start">
                    {/* Cover image */}
                    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <header className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <ImageIcon
                                className="h-4 w-4 text-primary"
                                aria-hidden="true"
                            />
                            <h3 className="text-[12.5px] font-semibold text-ink">
                                Cover image
                            </h3>
                        </header>

                        <div className="space-y-3 p-4">
                            {coverPreview ? (
                                <div className="group relative aspect-[1200/630] overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                    <img
                                        src={coverPreview}
                                        alt="Cover"
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeCover}
                                        aria-label="Remove cover"
                                        className="absolute right-2 top-2 rounded-full bg-red-500/90 p-1.5 text-white opacity-0 shadow-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95 group-hover:opacity-100"
                                    >
                                        <X className="h-3 w-3" strokeWidth={3} />
                                    </button>
                                    {coverFile ? (
                                        <span className="absolute left-2 top-2 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white shadow-sm">
                                            New
                                        </span>
                                    ) : (
                                        <span className="absolute left-2 top-2 rounded-md bg-primary px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white shadow-sm">
                                            Current
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <label className="group flex aspect-[1200/630] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/40 transition-all hover:border-primary/40 hover:bg-primary/5">
                                    {isCompressing ? (
                                        <SpinnerMini />
                                    ) : (
                                        <>
                                            <Upload className="h-7 w-7 text-gray-300 transition-colors group-hover:text-primary" />
                                            <span className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-colors group-hover:text-primary/70">
                                                Upload cover
                                            </span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleCoverChange}
                                        className="hidden"
                                        disabled={isCompressing}
                                    />
                                </label>
                            )}

                            {coverPreview && (
                                <label className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11.5px] font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                                    <ImageIcon
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    Replace image
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleCoverChange}
                                        className="hidden"
                                        disabled={isCompressing}
                                    />
                                </label>
                            )}

                            <p className="text-[11px] text-gray-500">
                                Recommended 1200×630 · max 5 MB
                            </p>
                        </div>
                    </section>

                    {/* Details */}
                    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <header className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <Hash
                                className="h-4 w-4 text-primary"
                                aria-hidden="true"
                            />
                            <h3 className="text-[12.5px] font-semibold text-ink">
                                Details
                            </h3>
                        </header>

                        <div className="space-y-4 p-4">
                            {/* Slug */}
                            <Field
                                label="Slug"
                                required
                                error={errors.slug?.message}
                                htmlFor="slug"
                            >
                                <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                    <span className="flex items-center border-r border-gray-200 bg-gray-50 px-2.5 font-mono text-[11px] text-gray-500">
                                        /blog/
                                    </span>
                                    <input
                                        id="slug"
                                        type="text"
                                        value={slug}
                                        onChange={(e) => {
                                            setSlug(e.target.value);
                                            setSlugTouched(true);
                                        }}
                                        required
                                        placeholder="url-friendly-slug"
                                        className="min-w-0 flex-1 border-0 bg-white px-3 py-2.5 font-mono text-[12px] text-ink outline-none placeholder:text-gray-400"
                                    />
                                </div>
                            </Field>

                            {/* Status */}
                            <Field
                                label="Status"
                                required
                                error={errors.status?.message}
                                htmlFor="status"
                            >
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStatus("DRAFT")}
                                        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border-[1.5px] px-3 py-2 text-[12px] font-semibold transition-colors ${
                                            status === "DRAFT"
                                                ? "border-amber-300 bg-amber-50 text-amber-700"
                                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                        }`}
                                    >
                                        <EyeOff
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        Draft
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus("PUBLISHED")}
                                        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border-[1.5px] px-3 py-2 text-[12px] font-semibold transition-colors ${
                                            status === "PUBLISHED"
                                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                        }`}
                                    >
                                        <Eye
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                        Publish
                                    </button>
                                </div>
                            </Field>
                        </div>
                    </section>

                    {/* Payload preview */}
                    <section className="overflow-hidden rounded-2xl border border-primary-100 bg-primary-50/40">
                        <header className="flex items-center gap-2 border-b border-primary-100 bg-primary-50 px-4 py-2.5">
                            <Quote
                                className="h-3.5 w-3.5 text-primary"
                                aria-hidden="true"
                            />
                            <h3 className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-primary">
                                Payload preview
                            </h3>
                        </header>
                        <pre className="overflow-x-auto px-4 py-3 font-mono text-[10.5px] leading-relaxed text-primary-900/80">
{JSON.stringify(
    {
        title: title || "…",
        slug: slug || "…",
        excerpt: excerpt || "…",
        content: content ? `${content.slice(0, 24)}…` : "…",
        coverImage: coverFile ? "(file)" : coverImage || "…",
        status,
    },
    null,
    2
)}
                        </pre>
                    </section>
                </aside>
            </div>

            {/* ---------- Sticky action bar ---------- */}
            <div className="sticky bottom-4 z-20 mt-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur-sm sm:px-5">
                    <p className="hidden text-[11.5px] text-gray-500 sm:block">
                        {isEditMode
                            ? "Changes are applied on save."
                            : isPublished
                            ? "The post will be visible to readers immediately."
                            : "The post will be saved as a draft."}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || isCompressing}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm shadow-primary/20 transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <SpinnerMini />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <Save
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    {isEditMode
                                        ? "Save changes"
                                        : isPublished
                                        ? "Publish post"
                                        : "Save draft"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}