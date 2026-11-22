import { cookies } from "next/headers";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  getAllTenants,
  getPropertyOwnerProfile,
  getPropertyOwnerProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import HeroBand from "@/app/_components/HeroBand";
import TenantsManager from "@/app/_components/TenantsManager";
import { getSettledErrorMessages } from "@/app/_lib/api-error";
import { SAMPLE_TENANTS } from "@/app/_lib/sample-tenants";

export const metadata = {
  title: "Tenants | Property Manager Dashboard",
  description: "Manage registered tenants, identity verifications, leases, and occupations across managed properties.",
};

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const results = await Promise.allSettled([
    token ? getPropertyOwnerProfile(token) : Promise.resolve(null),
    token ? getPropertyOwnerProperties(token, { limit: 10000 }) : Promise.resolve([]),
    getAllTenants(),
  ]);
  const dataErrorMessages = getSettledErrorMessages(results);

  const rawTenants = results[2].status === "fulfilled" ? results[2].value : null;

  const tenantsList = Array.isArray(rawTenants?.data)
    ? rawTenants.data
    : Array.isArray(rawTenants) && rawTenants.length > 0
      ? rawTenants
      : SAMPLE_TENANTS;

  const totalTenants = tenantsList.length;
  const activeTenants = tenantsList.filter(
    (t) => (t.status || "").toUpperCase() === "ACTIVE"
  ).length;
  const verifiedIdTenants = tenantsList.filter(
    (t) => Boolean(t.identification?.number || t.idNumber)
  ).length;
  const employedTenants = tenantsList.filter((t) => {
    const emp = t.employmentInformation || t.employmentInfo || {};
    return Boolean(emp.employer || emp.jobTitle || t.occupation);
  }).length;

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const heroStats = [
    {
      label: "Total Tenants",
      value: totalTenants,
      hint: "Registered tenants",
    },
    {
      label: "Active Tenancies",
      value: activeTenants,
      hint: "Current active records",
    },
    {
      label: "Verified ID",
      value: verifiedIdTenants,
      hint: "Valid document on file",
    },
    {
      label: "Employed",
      value: employedTenants,
      hint: "With verified occupation",
    },
  ];

  return (
    <div className="space-y-8 p-2">
      {dataErrorMessages.length > 0 ? (
        <DataErrorNotice messages={dataErrorMessages} />
      ) : null}

      <HeroBand
        tagline={`Manager Console · ${today}`}
        title="Tenants"
        description="Comprehensive tenant directory — monitor identity verifications, occupations, emergency contacts, and active tenancy agreements."
        stats={heroStats}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/add-new-tenant?returnTo=/dashboard/property-manager/tenants"
              className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side shadow-sm transition-all hover:bg-white active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add tenant
            </Link>
          </div>
        }
      />

      <DashboardGridItem title={`Tenant Directory (${totalTenants})`}>
        <TenantsManager
          tenants={tenantsList}
          basePath="/dashboard/property-manager/tenants"
        />
      </DashboardGridItem>
    </div>
  );
}