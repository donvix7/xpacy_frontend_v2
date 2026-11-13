import AdminBlogsList from "@/app/_components/blogs/AdminBlogsList";
import AdminBlogSlugSearch from "@/app/_components/blogs/AdminBlogSlugSearch";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getAdminBlogs } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";

export default async function Page({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const blogs = (await getAdminBlogs()) || [];

  const stats = {
    totalBlogs: blogs.length,
    publishedBlogs: blogs.filter((b) => b.is_published === true).length,
    featuredBlogs: blogs.filter((b) => b.is_featured === true).length,
  };

  const heroStats = [
    { label: "Total Blogs", value: stats.totalBlogs, hint: "All drafts & posts" },
    { label: "Published", value: stats.publishedBlogs, hint: "Live on site" },
    { label: "Featured", value: stats.featuredBlogs, hint: "Highlighted posts" },
    {
      label: "Drafts",
      value: stats.totalBlogs - stats.publishedBlogs,
      hint: "Not yet published",
    },
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
      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                Admin console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Blogs Management
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Draft, publish and feature articles — manage everything your readers see in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard/admin/blogs/create"
                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create New Blog
              </Link>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4"
              >
                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.5px] text-white tabular-nums sm:text-[26px]">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </dd>
                <p className="mt-1.5 truncate text-[11.5px] text-side-mute">
                  {stat.hint}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Existing content ---------- */}
      <AdminBlogSlugSearch />

      <DashboardGridItem title="Blogs List">
        <AdminBlogsList blogs={blogs} filter={category} search={search} />
      </DashboardGridItem>
    </div>
  );
}