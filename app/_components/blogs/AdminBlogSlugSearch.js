"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { searchAdminBlogsBySlug } from "@/app/_lib/action";

function normalizeBlogs(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.blogs)) return result.blogs;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.results)) return result.results;
  return [];
}

export default function AdminBlogSlugSearch() {
  const [slug, setSlug] = useState("");
  const [blogs, setBlogs] = useState(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    startTransition(async () => {
      const result = await searchAdminBlogsBySlug(slug);
      if (!result?.success) {
        setBlogs(null);
        setMessage(result?.message || "Could not search blogs.");
        return;
      }
      setBlogs(normalizeBlogs(result.blogs));
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-primary">Find a blog by slug</h2>
        <p className="mt-1 text-sm text-gray-500">Search the blog service for an exact slug.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Blog slug</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="Enter blog slug"
            className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </label>
        <button disabled={isPending || !slug.trim()} className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "Searching…" : "Search by slug"}
        </button>
      </form>

      {message && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}
      {blogs && blogs.length === 0 && <p className="rounded-lg bg-gray-50 px-4 py-5 text-sm text-gray-600">No blog found with that slug.</p>}
      {blogs?.length > 0 && (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          {blogs.map((blog, index) => {
            const blogSlug = blog.slug || slug.trim();
            const blogId = blog.id || blog._id || index;
            return (
              <div key={blogId} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{blog.title || "Untitled blog"}</p>
                  <p className="mt-1 truncate text-xs text-gray-500">{blogSlug}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/blogs/${blogSlug}`} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">View</Link>
                  <Link href={`/dashboard/admin/blogs/${blogSlug}`} className="rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary hover:bg-primary-100">Edit</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
