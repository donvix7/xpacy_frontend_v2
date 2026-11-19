import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllAdminOrganization } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import AdminOrganizationsList from "@/app/_components/AdminOrganizationsList";
import HeroBand from "@/app/_components/HeroBand";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

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
  const results = await Promise.allSettled([getAllAdminOrganization()]);
  const dataErrorMessages = getSettledErrorMessages(results);
  const organizations = getOrganizationList(
    results[0].status === "fulfilled" ? results[0].value : null,
  );

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
      {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
      {/* ---------- Hero summary ---------- */}
      <HeroBand
        tagline={`Admin console · ${today}`}
        title="Organizations"
        description="Manage organizations and their members — contacts, locations and membership in one place."
        actions={
          <Link
            href="/admin/add-new-organization"
            className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create organization
          </Link>
        }
        stats={heroStats}
      />

      {/* ---------- Existing content ---------- */}
      <DashboardGridItem title={`Organizations (${organizations.length})`}>
        <AdminOrganizationsList organizations={organizations} />
      </DashboardGridItem>
    </div>
  );
}