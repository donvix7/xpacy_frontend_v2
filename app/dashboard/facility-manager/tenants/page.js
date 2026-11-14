import Link from "next/link";
import { Plus, ChevronLeft } from "lucide-react";
import AdminUsersList from "@/app/_components/AdminUsersList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { getAllTenants, getPropertyById } from "@/app/_lib/data-services";

export default async function Page({ params }) {
  // propertyId comes straight from the URL
  const { id: propertyId } = await params;

  // Fetch the property and its tenants in parallel
  const [property, rawUsers] = await Promise.all([
    getPropertyById(propertyId).catch(() => null),
    getAllTenants().catch(() => []),
  ]);

  const propertyName =
    property?.name ||
    property?.property_name ||
    property?.title ||
    "Property";

  const allUsers = Array.isArray(rawUsers) ? rawUsers : [];

  // Keep only tenants (exclude owners/admins even if the API returns them)
  const tenantsList = allUsers
    .filter((u) => {
      const role = (u.role || "").toLowerCase();
      return (
        role === "tenant" ||
        role === "user" ||
        role === "" ||
        role === undefined
      );
    })
    .map((u) => ({ ...u, role: "tenant" }));

  const stats = {
    totalTenants: tenantsList.length,
    processedKyc: tenantsList.filter(
      (u) => u.kyc_status === "processing",
    ).length,
    activeTenants: tenantsList.filter((u) => u.status === "active").length,
    inactiveTenants: tenantsList.filter((u) => u.status === "inactive").length,
    unverifiedTenants: tenantsList.filter((u) => !u.email_verified_at).length,
  };

  // ---- Hero stats (top 4) -------------------------------------------------
  const heroStats = [
    {
      label: "Total Tenants",
      value: stats.totalTenants,
      hint: "For this property",
    },
    {
      label: "Active Tenants",
      value: stats.activeTenants,
      hint: "Currently active",
    },
    {
      label: "Inactive Tenants",
      value: stats.inactiveTenants,
      hint: "Deactivated accounts",
    },
    {
      label: "KYC Processing",
      value: stats.processedKyc,
      hint: "Under review",
    },
  ];

  // ---- Secondary strip (remaining) ----------------------------------------
  const secondaryStats = [
    {
      label: "Unverified",
      value: stats.unverifiedTenants,
      hint: "Email not verified",
    },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <Link
                href={`/dashboard/user/my-properties/${propertyId}`}
                className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute transition-colors hover:text-white"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back to property
              </Link>
              <h1 className="mt-1 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Tenants
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Tenants for {propertyName}. · {today}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/add-new-tenant"
                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add tenant
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
      <DashboardGridItem title="All Tenants">
        <AdminUsersList
          users={tenantsList}
          title="All Tenants"
          variant="tenant"
        />
      </DashboardGridItem>
    </div>
  );
}