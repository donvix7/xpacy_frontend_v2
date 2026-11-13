import AdminPropertyOwnersList from "@/app/_components/AdminPropertyOwnersList";
import AdminUsersList from "@/app/_components/AdminUsersList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { getPropertyOwner, getAllAdmin, getAllUsers } from "@/app/_lib/data-services";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { FaPlus } from "react-icons/fa6";

export default async function Page() {
  const [owners, admins, regularUsers] = await Promise.all([
    getPropertyOwner(),
    getAllAdmin(),
    getAllUsers(),
  ]);

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
    propertyOwners: ownersList.length,
    admins: adminsList.length,
    regularUsers: usersList.length,
    processedKyc: allUsers.filter((u) => u.kyc_status === "processing").length,
    activeUsers: allUsers.filter((u) => u.status === "active").length,
    inactiveUsers: allUsers.filter((u) => u.status === "inactive").length,
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
      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                Admin console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                User Management
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Every account in one place — admins, property owners and regular users, plus their verification and activity status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
      <DashboardGridItem title="All Users List">
        <AdminUsersList users={usersList} title="All Users List" variant="tenant" />
      </DashboardGridItem>

      <DashboardGridItem title="All Registered Users List">
        <AdminUsersList users={allUsers} title="All Registered Users List" variant="registered" />
      </DashboardGridItem>

      <DashboardGridItem title="Admins List">
        <AdminUsersList users={adminsList} title="Admins List" />
      </DashboardGridItem>

      <DashboardGridItem title="Property Owners List">
        <Link
          href="/admin/add-new-owner"
          className="flex items-center self-end gap-2 text-sm text-primary hover:underline"
        >
          <FaPlus /> Add New Owner
        </Link>
        <AdminPropertyOwnersList owners={ownersList} />
      </DashboardGridItem>
    </div>
  );
}