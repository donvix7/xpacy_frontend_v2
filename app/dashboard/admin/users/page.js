import AdminPropertyOwnersList from "@/app/_components/AdminPropertyOwnersList";
import AdminUsersList from "@/app/_components/AdminUsersList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import HeroBand from "@/app/_components/HeroBand";
import { getPropertyOwner, getAllAdmin, getAllUsers } from "@/app/_lib/data-services";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page() {
  const results = await Promise.allSettled([
    getPropertyOwner(),
    getAllAdmin(),
    getAllUsers(),
  ]);
  const dataErrorMessages = getSettledErrorMessages(results);

  const owners = results[0].status === "fulfilled" ? results[0].value : [];
  const admins = results[1].status === "fulfilled" ? results[1].value : [];
  const regularUsers = results[2].status === "fulfilled" ? results[2].value : [];

  // Normalize data structure if needed
  const ownersList = (owners || []).map((u) => ({ ...u, role: "property-owner" }));
  const adminsList = (admins || []).map((u) => ({ ...u, role: "admin" }));
  const usersList = (regularUsers || [])
    .filter(
      (user) =>
        ![user.role, user.user_role, user.user_type].some(
          (role) => String(role || "").trim().toLowerCase() === "tenant",
        ),
    )
    .map((u) => ({ ...u, role: "user" }));

  // Deduplicate users for the "All Registered Users" list
  // Priority: Admin > Property Owner > User
  const allUsersMap = new Map();
  usersList.forEach((u) => allUsersMap.set(u.id, u));
  ownersList.forEach((u) => allUsersMap.set(u.id, u));
  adminsList.forEach((u) => allUsersMap.set(u.id, u));
  const allUsers = Array.from(allUsersMap.values());

  const stats = {
    totalUsers: allUsers.length,
    admins: allUsers.filter((u) => u.role === "admin" || u.role === "SUPER_ADMIN").length,
    propertyOwners: ownersList.length,
    regularUsers: usersList.filter((u) => u.role === "user" || u.role === "USER").length,
    processedKyc: allUsers.filter((u) => u.kyc_status === "processing").length,
    activeUsers: allUsers.filter((u) => u.isActive === true).length,
    inactiveUsers: allUsers.filter((u) => u.isActive === false).length,
    unverifiedUsers: allUsers.filter((u) => !u.email_verified_at).length,
  };

  // ---- Hero stats (top 4 headline numbers) --------------------------------
  const heroStats = [
    { label: "Total Users", value: stats.totalUsers, hint: "All accounts" },
    { label: "Property Owners", value: stats.propertyOwners, hint: "Listings owners" },
    { label: "Admins", value: stats.admins, hint: "Elevated access" },
    { label: "Regular Users", value: stats.regularUsers, hint: "Non-tenant accounts" },
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
      {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
      {/* ---------- Hero summary ---------- */}
      <HeroBand
        tagline={`Admin console · ${today}`}
        title="User Management"
        description="Every account in one place — admins, property owners and regular users, plus their verification and activity status."
        actions={
          <>
            <Link
              href="/admin/add-new-owner"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <FaPlus className="h-3.5 w-3.5" aria-hidden="true" />
              Add owner
            </Link>
            <Link
              href="/admin/invite-user"
              className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Add user
            </Link>
          </>
        }
        stats={heroStats}
      />

      {/* ---------- Status strip (kept from old SummaryCards) ---------- */}
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

      {/* ---------- Existing content ---------- */}
      <DashboardGridItem >
        <AdminUsersList users={usersList} title="All Users List" variant="tenant" />
      </DashboardGridItem>


      <DashboardGridItem >
        <AdminPropertyOwnersList owners={ownersList} title="Property Owners List" />
      </DashboardGridItem>
    </div>
  );
}