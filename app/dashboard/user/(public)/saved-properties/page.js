import Pagination from "@/app/_components/Pagination";
import { getSavedProperties } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SavedPropCardList from "@/app/_components/SavedProCardList";
import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const { pagination } = await getSavedProperties(token);

  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 0;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to =
    page === totalPages ? total : Math.min(page * limit, total);

  const heroStats = [
    {
      label: "Saved",
      value: total,
      hint: "Properties on your list",
    },
    {
      label: "Showing",
      value: `${from}–${to}`,
      hint: `of ${total} results`,
    },
    {
      label: "Page",
      value: `${page} / ${totalPages}`,
      hint: "Current page",
    },
    {
      label: "Per page",
      value: limit || "—",
      hint: "Results per page",
    },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <main className="flex flex-col gap-6 p-2 lg:gap-8">
      <MobileDashboardHeader />

      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                Your shortlist · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Saved Properties
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Every property you've shortlisted — revisit them any time to compare, book or share.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Browse properties
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

      {/* ---------- Count + sort row ---------- */}
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
        <span className="font-mono text-base text-base-500">
          Showing <span>{from}</span> - <span>{to}</span> of{" "}
          <span>{total}</span> results
        </span>
        <div className="flex items-center space-x-2.5 font-mono text-base-500">
          <span>Sort by:</span>
          <select className="rounded-lg border border-neutral-200 p-2.5">
            <option>Default</option>
          </select>
        </div>
      </header>

      {/* ---------- Existing content ---------- */}
      <DashboardGridItem title="Saved Properties">
        <SavedPropCardList />
      </DashboardGridItem>

      <Suspense fallback={<div className="h-10" />}>
        <Pagination pagination={pagination} />
      </Suspense>
    </main>
  );
}