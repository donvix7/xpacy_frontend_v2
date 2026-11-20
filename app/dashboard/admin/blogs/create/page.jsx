import BlogForm from "@/app/_components/blogs/BlogForm";
import Footer from "@/app/_components/Footer";
import {
    ChevronLeft,
    PenSquare,
    FileText,
    Sparkles,
    CheckCircle2,
    Image as ImageIcon,
    Globe,
    Eye,
    AlertCircle,
    BookOpen,
} from "lucide-react";
import Link from "next/link";

const checklist = [
    {
        title: "Clear, specific title",
        body: "60–70 characters works best for search previews.",
    },
    {
        title: "Slug matches title",
        body: "Lowercase, hyphenated — no stop words.",
    },
    {
        title: "Add a cover image",
        body: "1200×630 for social previews.",
    },
    {
        title: "Draft, then publish",
        body: "Save as DRAFT first, publish when ready.",
    },
];

export default function Page() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-gray-50 px-2">
            <main className="flex-1">
                <div className="mx-auto w-full">
                    {/* ---------- Back link ---------- */}
                    <Link
                        href="/dashboard/admin/blogs"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        Back to blogs
                    </Link>

                    {/* ---------- Hero ---------- */}
                    <section className="relative mt-4 overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

                        <div className="relative z-10 flex flex-col gap-5 p-5 sm:p-7">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/25">
                                            <PenSquare
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                            Admin · Content
                                        </p>
                                    </div>
                                    <h1 className="mt-2 font-sans text-[24px] font-semibold leading-tight text-white sm:text-[28px]">
                                        Write a new post
                                    </h1>
                                    <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-side-mute">
                                        Draft a new blog entry. You can save it
                                        as a draft, preview it, and publish when
                                        it&apos;s ready.
                                    </p>
                                </div>

                                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-white/80 ring-1 ring-white/20">
                                    <span className="h-1 w-1 rounded-full bg-current" />
                                    New draft
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* ---------- Main grid: form + side panel ---------- */}
                    <div className="mt-6 grid grid-cols-1 gap-6 ">
                        {/* ---------- Form card ---------- */}
                        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            {/* Header band */}
                            <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-3 sm:px-6">
                                <FileText
                                    className="h-4 w-4 text-primary"
                                    aria-hidden="true"
                                />
                                <h2 className="text-[13.5px] font-semibold text-ink">
                                    Post details
                                </h2>
                                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-100">
                                    <Sparkles
                                        className="h-2.5 w-2.5"
                                        aria-hidden="true"
                                    />
                                    Draft
                                </span>
                            </div>

                            {/* Form body */}
                            <div className="p-5 sm:p-7">
                                <BlogForm isEditMode={false} />
                            </div>

                            {/* Footer hint strip */}
                            <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3 sm:px-6">
                                <p className="flex items-start gap-2 text-[11.5px] text-gray-600">
                                    <AlertCircle
                                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400"
                                        aria-hidden="true"
                                    />
                                    <span>
                                        Fields marked{" "}
                                        <span className="font-bold text-red-500">
                                            *
                                        </span>{" "}
                                        are required. Your post saves with{" "}
                                        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[10.5px] text-gray-700 ring-1 ring-gray-200">
                                            status: DRAFT
                                        </code>{" "}
                                        by default.
                                    </span>
                                </p>
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}