import AdminPropertyOwnersList from "@/app/_components/AdminPropertyOwnersList";
import AdminUsersList from "@/app/_components/AdminUsersList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import HeroBand from "@/app/_components/HeroBand";
import {
  getAllAdminOrganization,
  getAdminOrganizationMembers,
  getAllUsers,
} from "@/app/_lib/data-services";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
}

function unwrapOrgs(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.organizations)) return payload.organizations;
  if (Array.isArray(payload?.data?.organizations)) return payload.data.organizations;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function unwrapMembers(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.members)) return payload.members;
  if (Array.isArray(payload?.data?.members)) return payload.data.members;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function memberToUserRecord(member, roleLabel) {
  const u = member?.user || member?.profile || {};
  const id = String(
    u?.id || u?._id || member?.userId || member?.user_id || member?.id || ""
  ).trim();
  const firstName =
    u?.firstName ||
    u?.firstname ||
    u?.first_name ||
    member?.firstName ||
    member?.firstname ||
    member?.first_name ||
    "";
  const lastName =
    u?.lastName ||
    u?.lastname ||
    u?.last_name ||
    member?.lastName ||
    member?.lastname ||
    member?.last_name ||
    "";
  const email = u?.email || member?.email || "";
  const phone = u?.phone || u?.phone_number || member?.phone || "";
  const displayPicture = u?.display_picture || member?.display_picture || null;
  const isActive =
    typeof u?.isActive === "boolean"
      ? u.isActive
      : typeof member?.isActive === "boolean"
        ? member.isActive
        : true;

  return {
    ...u,
    id: id || email,
    _id: id || email,
    firstName,
    lastName,
    first_name: firstName || u?.name || email || "Member",
    last_name: lastName,
    email,
    phone,
    display_picture: displayPicture,
    isActive,
    email_verified_at: u?.email_verified_at ?? u?.emailVerifiedAt ?? null,
    kyc_status: u?.kyc_status ?? u?.kycStatus ?? null,
    role: roleLabel,
  };
}

export default async function Page() {
  const results = await Promise.allSettled([
    getAllUsers(),
    getAllAdminOrganization(),
  ]);
  const dataErrorMessages = getSettledErrorMessages(results);

  const regularUsers =
    results[0].status === "fulfilled" && Array.isArray(results[0].value)
      ? results[0].value
      : [];
  const organizations =
    results[1].status === "fulfilled" ? unwrapOrgs(results[1].value) : [];

  // Fetch members for every organization to collect Organization Owners & Facility Managers
  const orgMembersResults = await Promise.allSettled(
    organizations.map((org) => {
      const orgId = org?.id || org?._id || org?.organizationId;
      return orgId
        ? getAdminOrganizationMembers(orgId, 100).catch(() => [])
        : Promise.resolve([]);
    })
  );

  const orgOwnersMap = new Map();
  const facilityManagersMap = new Map();

  organizations.forEach((org, index) => {
    // Check embedded owner if present on the org
    if (org?.owner && typeof org.owner === "object") {
      const rec = memberToUserRecord({ user: org.owner }, "organization-owner");
      const key = rec.id || rec.email;
      if (key && !orgOwnersMap.has(key)) orgOwnersMap.set(key, rec);
    }

    const res = orgMembersResults[index];
    const members = res?.status === "fulfilled" ? unwrapMembers(res.value) : [];

    members.forEach((member) => {
      const rawRole =
        member?.role?.name ||
        member?.role?.value ||
        member?.role ||
        member?.organizationRole ||
        member?.memberRole ||
        "";
      const norm = normalizeRole(rawRole);

      if (["owner", "organizationowner", "orgowner"].includes(norm)) {
        const rec = memberToUserRecord(member, "organization-owner");
        const key = rec.id || rec.email;
        if (key && !orgOwnersMap.has(key)) orgOwnersMap.set(key, rec);
      } else if (norm === "facilitymanager") {
        const rec = memberToUserRecord(member, "facility-manager");
        const key = rec.id || rec.email;
        if (key && !facilityManagersMap.has(key)) {
          facilityManagersMap.set(key, rec);
        }
      }
    });
  });

  // Also include any users with role facility-manager from the users list
  regularUsers.forEach((u) => {
    const norm = normalizeRole(u?.role || u?.user_role || u?.user_type);
    if (norm === "facilitymanager") {
      const key = String(u?.id || u?._id || u?.email || "").trim();
      if (key && !facilityManagersMap.has(key)) {
        facilityManagersMap.set(key, { ...u, role: "facility-manager" });
      }
    }
  });

  const organizationOwnersList = Array.from(orgOwnersMap.values());
  const facilityManagersList = Array.from(facilityManagersMap.values());

  const usersList = (regularUsers || [])
    .filter(
      (user) =>
        normalizeRole(user?.role || user?.user_role || user?.user_type) === "user"
    )
    .map((u) => ({ ...u, role: "user" }));

  // Deduplicate all users
  const allUsersMap = new Map();
  usersList.forEach((u) => allUsersMap.set(String(u.id || u.email), u));
  organizationOwnersList.forEach((u) =>
    allUsersMap.set(String(u.id || u.email), u)
  );
  facilityManagersList.forEach((u) =>
    allUsersMap.set(String(u.id || u.email), u)
  );
  const allUsers = Array.from(allUsersMap.values());

  const stats = {
    totalUsers: allUsers.length,
    organizationOwners: organizationOwnersList.length,
    facilityManagers: facilityManagersList.length,
    regularUsers: usersList.filter(
      (u) => normalizeRole(u.role) === "user"
    ).length,
    processedKyc: allUsers.filter((u) => u.kyc_status === "processing").length,
    activeUsers: allUsers.filter((u) => u.isActive === true).length,
    inactiveUsers: allUsers.filter((u) => u.isActive === false).length,
    unverifiedUsers: allUsers.filter((u) => !u.email_verified_at).length,
  };

  // ---- Hero stats (top 4 headline numbers) --------------------------------
  const heroStats = [
    { label: "Total Users", value: stats.totalUsers, hint: "All accounts" },
    {
      label: "Organization Owners",
      value: stats.organizationOwners,
      hint: "Organization owners",
    },
    {
      label: "Facility Managers",
      value: stats.facilityManagers,
      hint: "Facility operations",
    },
    {
      label: "Regular Users",
      value: stats.regularUsers,
      hint: "User role accounts",
    },
  ];

  // ---- Secondary status strip (health metrics) ----------------------------
  const statusStats = [
    { label: "Active", value: stats.activeUsers, tone: "emerald" },
    { label: "Inactive", value: stats.inactiveUsers, tone: "red" },
    { label: "KYC Processing", value: stats.processedKyc, tone: "amber" },
    { label: "Unverified", value: stats.unverifiedUsers, tone: "slate" },
  ];

  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  };

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6 p-2">
      {dataErrorMessages.length > 0 ? (
        <DataErrorNotice messages={dataErrorMessages} />
      ) : null}

      {/* ---------- Hero summary ---------- */}
      <HeroBand
        tagline={`Admin console · ${today}`}
        title="User Management"
        description="Every account in one place — organization owners, facility managers, and regular users, plus their verification and activity status."
        actions={
         null
        }
        stats={heroStats}
      />

      {/* ---------- Status strip ---------- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statusStats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-4 ${toneClasses[s.tone]}`}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] opacity-80">
              {s.label}
            </p>
            <p className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.5px] tabular-nums sm:text-[26px]">
              {s.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* ---------- Lists ---------- */}
      <DashboardGridItem>
        <AdminUsersList
          users={usersList}
          title="All Users List"
          variant="tenant"
        />
      </DashboardGridItem>

      <DashboardGridItem>
        <AdminPropertyOwnersList
          owners={organizationOwnersList}
          title="Organization Owners List"
        />
      </DashboardGridItem>

      <DashboardGridItem>
        <AdminUsersList
          users={facilityManagersList}
          title="Facility Managers List"
          variant="tenant"
        />
      </DashboardGridItem>
    </div>
  );
}
