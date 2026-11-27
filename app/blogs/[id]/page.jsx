import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, FileText } from "lucide-react";
import AppHeader from "../../_components/AppHeader";
import Footer from "../../_components/Footer";
import { getBlog } from "../../_lib/data-services";
import insightImg1 from "../../../public/insight-image1.png";

function resolveCoverImage(blog) {
  const rawImage =
    blog?.coverImage ||
    blog?.cover_image ||
    blog?.image ||
    (Array.isArray(blog?.images) ? blog.images[0] : null);

  if (!rawImage || typeof rawImage !== "string") return null;
  const trimmed = rawImage.trim();
  if (
    !trimmed ||
    trimmed.startsWith("[object ") ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return null;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  const baseImageUrl = "https://app.xpacy.com/src/upload/blog";
  return `${baseImageUrl}/${trimmed}`;
}

function getAuthorName(author) {
  if (!author) return "Xpacy Editorial";
  const full = [author.firstName, author.lastName].filter(Boolean).join(" ").trim();
  return full || author.name || "Xpacy Editorial";
}

function estimateReadTime(blog) {
  if (blog?.readTime) return blog.readTime;
  const text = String(blog?.content || "")
    .replace(/<[^>]+>/g, " ")
    .trim();
  if (!text) return "3 min read";
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

function isHtmlContent(content) {
  return /<[a-z][\s\S]*>/i.test(String(content || ""));
}

export default async function BlogPage({ params }) {
  const { id } = await params;
  const blog = await getBlog(id);

  if (!blog) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas text-ink">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-xl grow flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-card text-mute shadow-sm">
            <FileText className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Article not found
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            This blog post may have been removed or the link might be incorrect.
          </p>
          <Link
            href="/blogs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to all articles
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const externalImage = resolveCoverImage(blog);
  const rawDate = blog.publishedAt || blog.created_at || blog.createdAt;
  const parsedDate = rawDate ? new Date(rawDate) : null;
  const formattedDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? format(parsedDate, "dd MMMM yyyy")
      : "Unknown Date";

  const categoryLabel = blog.category?.name || blog.category || "Insights";
  const authorName = getAuthorName(blog.author);
  const readTime = estimateReadTime(blog);
  const contentStr = String(blog.content || "");
  const hasHtml = isHtmlContent(contentStr);

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <AppHeader />

      <main className="grow">
        {/* Top article header */}
        <section className="border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white">
          <div className="mx-auto max-w-4xl px-5 pb-10 pt-10 sm:px-6 sm:pt-14">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to articles
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                {categoryLabel}
              </span>
              {blog.status && String(blog.status).toUpperCase() !== "PUBLISHED" && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                  {String(blog.status).toLowerCase()}
                </span>
              )}
            </div>

            <h1 className="mt-5 font-sans text-3xl font-bold leading-[1.15] tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              {blog.title || "Untitled article"}
            </h1>

            {blog.excerpt && (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                {blog.excerpt}
              </p>
            )}

            {/* Author & meta bar */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200/80 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary">
                  {authorName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {authorName}
                  </p>
                  <p className="text-xs text-neutral-500">Author</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-500 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  {formattedDate}
                </span>
                <span className="text-neutral-300">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  {readTime}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Hero cover image */}
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-10">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-100 shadow-lg">
            {externalImage ? (
              <img
                src={externalImage}
                alt={blog.title || "Article cover"}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={insightImg1}
                alt={blog.title || "Article cover"}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>

        {/* Article body */}
        <article className="mx-auto max-w-3xl px-5 pb-20 pt-2 sm:px-6 sm:pb-28">
          {hasHtml ? (
            <div
              className="prose prose-base max-w-none leading-8 text-neutral-800 sm:prose-lg
                         prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-neutral-900
                         prose-h2:mt-12 prose-h2:mb-5 prose-h2:text-2xl sm:prose-h2:text-3xl
                         prose-h3:mt-8 prose-h3:mb-4 prose-p:mb-6
                         prose-a:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                         prose-blockquote:border-l-primary prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                         prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: contentStr }}
            />
          ) : (
            <div className="space-y-6 text-base leading-8 text-neutral-800 sm:text-lg">
              {contentStr
                .split(/\r?\n\s*\r?\n/)
                .map((para) => para.trim())
                .filter(Boolean)
                .map((para, idx) => (
                  <p key={idx} className="whitespace-pre-line">
                    {para}
                  </p>
                ))}
            </div>
          )}

          {/* Bottom navigation */}
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-8">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:border-primary/40 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All articles
            </Link>
            <span className="text-xs text-neutral-400">
              Published {formattedDate}
            </span>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
