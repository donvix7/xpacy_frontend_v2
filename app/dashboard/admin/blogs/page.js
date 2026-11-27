import AdminBlogsList from "@/app/_components/blogs/AdminBlogsList";
import AdminBlogSlugSearch from "@/app/_components/blogs/AdminBlogSlugSearch";
import HeroBand from "@/app/_components/HeroBand";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getAdminBlogs } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

function unwrapBlogs(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.blogs)) return payload.blogs;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.blogs)) return payload.data.blogs;
  return [];
}

function getBlogStatus(blog) {
  const explicit = String(blog?.status || "").trim().toUpperCase();
  if (explicit) return explicit;
  if (blog?.isPublished === true || blog?.is_published === true) {
    return "PUBLISHED";
  }
  return "DRAFT";
}

export default async function Page({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const results = await Promise.allSettled([getAdminBlogs()]);
  const dataErrorMessages = getSettledErrorMessages(results);
  const blogs = unwrapBlogs(
    results[0].status === "fulfilled" ? results[0].value : null
  );

  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter(
    (b) => getBlogStatus(b) === "PUBLISHED"
  ).length;
  const draftBlogs = blogs.filter(
    (b) => getBlogStatus(b) === "DRAFT"
  ).length;
  const archivedBlogs = blogs.filter(
    (b) => getBlogStatus(b) === "ARCHIVED"
  ).length;

  const heroStats = [
    { label: "Total Blogs", value: totalBlogs, hint: "All drafts & posts" },
    { label: "Published", value: publishedBlogs, hint: "Live on site" },
    { label: "Drafts", value: draftBlogs, hint: "Not yet published" },
    { label: "Archived", value: archivedBlogs, hint: "Hidden from site" },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const search = searchParams?.search || "";
  const category = searchParams?.category || "all";

  return (
    <div className="space-y-6 p-2">
      {dataErrorMessages.length > 0 ? (
        <DataErrorNotice messages={dataErrorMessages} />
      ) : null}

      {/* ---------- Hero summary ---------- */}
      <HeroBand
        tagline={`Admin console · ${today}`}
        title="Blogs Management"
        description="Draft, publish and feature articles — manage everything your readers see in one place."
        stats={heroStats}
        actions={
          <Link
            href="/dashboard/admin/blogs/create"
            className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create New Blog
          </Link>
        }
      />

      {/* ---------- Existing content ---------- */}
      <AdminBlogSlugSearch />

      <DashboardGridItem title="Blogs List">
        <AdminBlogsList blogs={blogs} filter={category} search={search} />
      </DashboardGridItem>
    </div>
  );
}
