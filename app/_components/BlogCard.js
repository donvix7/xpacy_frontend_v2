import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, Clock } from "lucide-react";
import insightImg1 from "../../public/insight-image1.png";
import BlogOptionsMenu from "./blogs/BlogOptionsMenu";

function isValidImageString(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (
    !trimmed ||
    trimmed.startsWith("[object ") ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return false;
  }
  return true;
}

function resolveImage(blog) {
  const rawImage =
    blog?.coverImage ||
    blog?.cover_image ||
    blog?.image ||
    (Array.isArray(blog?.images) ? blog.images[0] : null);

  if (!isValidImageString(rawImage)) return null;
  const trimmed = rawImage.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return `https://app.xpacy.com/src/upload/blog/${trimmed}`;
}

function getAuthorName(author) {
  if (!author) return "Xpacy Editorial";
  const full = [author.firstName, author.lastName].filter(Boolean).join(" ").trim();
  return full || author.name || "Xpacy Editorial";
}

function getAuthorInitials(name) {
  const parts = String(name || "X")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.[0] || "X").toUpperCase();
}

function estimateReadTime(blog) {
  if (blog?.readTime) return blog.readTime;
  const text = String(blog?.content || "")
    .replace(/<[^>]+>/g, " ")
    .trim();
  if (!text) return "2 min read";
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

function getExcerpt(blog) {
  if (blog?.excerpt && String(blog.excerpt).trim()) {
    return String(blog.excerpt).trim();
  }
  const plain = String(blog?.content || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain || "";
}

function getStatusMeta(status) {
  const normalized = String(status || "").trim().toUpperCase();
  if (normalized === "PUBLISHED") {
    return {
      label: "Published",
      pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
      dot: "bg-emerald-500",
    };
  }
  if (normalized === "ARCHIVED") {
    return {
      label: "Archived",
      pill: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80",
      dot: "bg-slate-400",
    };
  }
  if (normalized === "DRAFT") {
    return {
      label: "Draft",
      pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",
      dot: "bg-amber-500",
    };
  }
  return null;
}

export default function BlogCard({ blog, isAdmin = false }) {
  const externalImage = resolveImage(blog);
  const rawDate = blog?.publishedAt || blog?.created_at || blog?.createdAt;
  const parsedDate = rawDate ? new Date(rawDate) : null;
  const formattedDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? format(parsedDate, "MMM dd, yyyy")
      : "Unscheduled";

  const blogHref = `/blogs/${blog?.slug || blog?.id || blog?._id}`;
  const categoryLabel = blog?.category?.name || blog?.category || "Insights";
  const excerpt = getExcerpt(blog);
  const readTime = estimateReadTime(blog);
  const statusMeta = isAdmin ? getStatusMeta(blog?.status) : null;
  const authorName = getAuthorName(blog?.author);
  const authorInitials = getAuthorInitials(authorName);
  const authorAvatar = isValidImageString(blog?.author?.avatar)
    ? blog.author.avatar.trim()
    : null;

  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-line/90 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)]">
      {/* Inset cover image frame */}
      <div className="p-2.5 pb-0">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-soft">
          <Link href={blogHref} className="block h-full w-full">
            {externalImage ? (
              <img
                src={externalImage}
                alt={blog?.title || "Blog cover"}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
            ) : (
              <Image
                src={insightImg1}
                alt={blog?.title || "Blog cover"}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-60" />
          </Link>

          {/* Category pill */}
          <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-1.5">
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-primary shadow-sm backdrop-blur-md">
              {categoryLabel}
            </span>
            {blog?.is_featured && (
              <span className="rounded-full bg-slate-900/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
                Featured
              </span>
            )}
          </div>

          {/* Admin options menu */}
          {isAdmin && (
            <div className="absolute right-2.5 top-2.5 z-30">
              <div className="rounded-full border border-white/50 bg-white/95 p-0.5 shadow-md backdrop-blur-md transition-transform duration-200 hover:scale-105">
                <BlogOptionsMenu id={blog?.id || blog?._id} slug={blog?.slug} />
              </div>
            </div>
          )}

          {/* Read time pill */}
          <div className="pointer-events-none absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-full bg-slate-950/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <Clock className="h-3 w-3 opacity-85" aria-hidden="true" />
            {readTime}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <div className="flex-1">
          {/* Status & date row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <time className="font-medium text-mute">{formattedDate}</time>
            {statusMeta && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusMeta.pill}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={blogHref} className="mt-2.5 block">
            <h3 className="line-clamp-2 text-[18px] font-bold leading-[1.35] tracking-[-0.015em] text-ink transition-colors duration-200 group-hover:text-primary">
              {blog?.title || "Untitled article"}
            </h3>
          </Link>

          {/* Excerpt */}
          {excerpt && (
            <p className="mt-2 line-clamp-2 text-[13.5px] leading-[1.6] text-mute">
              {excerpt}
            </p>
          )}

          {/* Admin slug preview */}
          {isAdmin && blog?.slug && (
            <p className="mt-3 truncate font-mono text-[11px] text-mute/75">
              /blogs/{blog.slug}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line/75 pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-line"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-[11px] font-bold tracking-tight text-primary ring-1 ring-primary/15">
                {authorInitials}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold leading-tight text-ink">
                {authorName}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-mute">
                Author
              </p>
            </div>
          </div>

          <Link
            href={blogHref}
            aria-label={`Read ${blog?.title || "article"}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-soft px-3 py-1.5 text-xs font-semibold text-ink transition-all duration-200 group-hover:bg-primary group-hover:text-white"
          >
            Read
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
