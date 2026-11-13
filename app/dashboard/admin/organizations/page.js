import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { getAllAdminOrganization } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";

const getOrganizationList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.organizations)) return payload.organizations;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

function getMemberCount(org) {
  return org._count?.memberships ?? org.members?.length ?? 0;
}

export default async function Page() {
  const organizations = getOrganizationList(await getAllAdminOrganization());

  // ---- Hero stats ----------------------------------------------------------
  const totalOrgs = organizations.length;
  const totalMembers = organizations.reduce(
    (sum, o) => sum + getMemberCount(o),
    0,
  );
  const withEmail = organizations.filter((o) => !!o.email).length;
  const countries = new Set(
    organizations.map((o) => o.country).filter(Boolean),
  ).size;

  const heroStats = [
    { label: "Organizations", value: totalOrgs, hint: "Registered accounts" },
    { label: "Members", value: totalMembers, hint: "Across all orgs" },
    { label: "Countries", value: countries, hint: "Global footprint" },
    { label: "Contactable", value: withEmail, hint: "Have an email on file" },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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
                Organizations
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Manage organizations and their members — contacts, locations and membership in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/add-new-organization"
                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create organization
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
      <DashboardGridItem title={`Organizations (${organizations.length})`}>
        {organizations.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {organizations.map((organization) => {
                  const id = organization.id || organization._id;
                  return (
                    <tr key={id || organization.name} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        {organization.name || "Unnamed organization"}
                        <div className="mt-1 text-xs font-normal text-gray-500">
                          {organization.slug || id || ""}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {[organization.city, organization.country]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {organization.email || "—"}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {organization._count?.memberships ??
                          organization.members?.length ??
                          "—"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          className="font-semibold text-primary hover:underline"
                          href={`/dashboard/admin/organizations/${id}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <Building2 className="mb-3 h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-800">No organizations yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Create an organization to get started.
            </p>
            <Link
              href="/admin/add-new-organization"
              className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              Create organization
            </Link>
          </div>
        )}
      </DashboardGridItem>
    </div>
  );
}