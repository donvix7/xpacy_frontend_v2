"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  User,
  Phone,
  Mail,
  Briefcase,
  IdCard,
  Building2,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  SlidersHorizontal,
  X,
  UserCheck,
  Pencil,
} from "lucide-react";
import StatusChips from "./StatusChips";
import CopyButton from "./CopyButton";
import EmptyState from "./EmptyState";
import { formatCurrency } from "@/app/_lib/utils";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function formatTenantName(t) {
  if (!t) return "Tenant";
  const name = [t.firstName, t.lastName].filter(Boolean).join(" ");
  return name || t.name || t.email || "Tenant";
}

function formatIdType(type) {
  if (!type) return "—";
  const map = {
    "drivers-license": "Driver's License",
    nin: "National ID (NIN)",
    passport: "International Passport",
    voters: "Voter's Card",
  };
  return map[type.toLowerCase()] || type.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(val) {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function TenantsManager({
  tenants = [],
  basePath = "/dashboard/property-owner/tenants",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, EMPLOYED, VERIFIED_ID, HAS_LEASES
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name

  // Filtered and sorted tenants
  const filteredTenants = useMemo(() => {
    return tenants
      .filter((t) => {
        // Status tab filter
        if (statusFilter === "ACTIVE") {
          if ((t.status || "").toUpperCase() !== "ACTIVE") return false;
        } else if (statusFilter === "EMPLOYED") {
          const emp = t.employmentInformation || t.employmentInfo || {};
          const hasEmp = Boolean(emp.employer || emp.jobTitle || t.occupation);
          if (!hasEmp) return false;
        } else if (statusFilter === "VERIFIED_ID") {
          const idNum = t.identification?.number || t.idNumber;
          if (!idNum) return false;
        } else if (statusFilter === "HAS_LEASES") {
          const leaseCount = t._count?.leases ?? (t.leases?.length || 0);
          if (leaseCount <= 0) return false;
        }

        // Search text filter
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();

        const name = formatTenantName(t).toLowerCase();
        const email = (t.email || "").toLowerCase();
        const phone = (t.phone || t.phoneNumber || "").toLowerCase();
        const idType = (t.identification?.type || "").toLowerCase();
        const idNum = (t.identification?.number || "").toLowerCase();
        const emp = t.employmentInformation || t.employmentInfo || {};
        const employer = (emp.employer || "").toLowerCase();
        const jobTitle = (emp.jobTitle || "").toLowerCase();
        const occupation = (t.occupation || "").toLowerCase();
        const emergencyName = (t.emergencyContact?.name || "").toLowerCase();

        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          idType.includes(q) ||
          idNum.includes(q) ||
          employer.includes(q) ||
          jobTitle.includes(q) ||
          occupation.includes(q) ||
          emergencyName.includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return formatTenantName(a).localeCompare(formatTenantName(b));
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        // default: newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [tenants, searchTerm, statusFilter, sortBy]);

  const activeCount = useMemo(
    () => tenants.filter((t) => (t.status || "").toUpperCase() === "ACTIVE").length,
    [tenants]
  );
  const employedCount = useMemo(
    () =>
      tenants.filter((t) => {
        const emp = t.employmentInformation || t.employmentInfo || {};
        return Boolean(emp.employer || emp.jobTitle || t.occupation);
      }).length,
    [tenants]
  );
  const verifiedIdCount = useMemo(
    () => tenants.filter((t) => Boolean(t.identification?.number || t.idNumber)).length,
    [tenants]
  );
  const withLeasesCount = useMemo(
    () => tenants.filter((t) => (t._count?.leases ?? (t.leases?.length || 0)) > 0).length,
    [tenants]
  );

  return (
    <div className="space-y-4">
      {/* Search and Filters toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, ID, employer or occupation..."
            className="w-full rounded-xl border border-line bg-card py-2.5 pl-10 pr-9 text-xs font-medium text-ink placeholder:text-mute focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-mute hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-mute">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-ink focus:border-primary focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line pb-3">
        {[
          { key: "ALL", label: "All Tenants", count: tenants.length },
          { key: "ACTIVE", label: "Active", count: activeCount },
          { key: "EMPLOYED", label: "Employed", count: employedCount },
          { key: "VERIFIED_ID", label: "Verified ID", count: verifiedIdCount },
          { key: "HAS_LEASES", label: "With Leases", count: withLeasesCount },
        ].map((tab) => {
          const isSelected = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-primary text-white shadow-sm"
                  : "bg-soft text-mute hover:bg-soft/80 hover:text-ink"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-card text-mute"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Directory Content */}
      {filteredTenants.length === 0 ? (
        <EmptyState
          icon={<User className="h-10 w-10 text-primary" aria-hidden="true" />}
          title="No tenants found"
          message={
            searchTerm || statusFilter !== "ALL"
              ? "No tenants matched your search query or active filter. Try resetting filters."
              : "No tenants recorded yet. You can add new tenants using the button above."
          }
          action={
            searchTerm || statusFilter !== "ALL" ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                }}
                className="mt-2 text-xs font-semibold text-primary hover:underline"
              >
                Clear all filters
              </button>
            ) : null
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto rounded-xl border border-line bg-card lg:block">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/50 text-[11px] font-semibold uppercase tracking-wider text-mute">
                <tr className="border-b border-line">
                  <th className="px-4 py-3.5">Tenant</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Identity / Document</th>
                  <th className="px-4 py-3.5">Occupation & Employer</th>
                  <th className="px-4 py-3.5 text-center">Leases</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {filteredTenants.map((tenant) => {
                  const name = formatTenantName(tenant);
                  const detailHref = `${basePath}/${tenant.id}`;
                  const idInfo = tenant.identification || {};
                  const empInfo = tenant.employmentInformation || tenant.employmentInfo || {};
                  const leaseCount = tenant._count?.leases ?? (tenant.leases?.length || 0);
                  const emg = tenant.emergencyContact;

                  return (
                    <tr
                      key={tenant.id}
                      className="group transition-colors hover:bg-soft/40"
                    >
                      {/* Tenant Identity */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={detailHref}
                              className="font-semibold text-ink transition-colors hover:text-primary hover:underline block truncate"
                            >
                              {name}
                            </Link>
                            <div className="flex items-center gap-1.5 text-mute">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[170px]" title={tenant.email}>
                                {tenant.email || "No email"}
                              </span>
                            </div>
                            {tenant.userId && (
                              <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                <UserCheck className="h-2.5 w-2.5" />
                                Linked account
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Details & Emergency */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-ink">
                              {tenant.phone || tenant.phoneNumber || "—"}
                            </span>
                            {tenant.phone && (
                              <CopyButton
                                value={tenant.phone}
                                label="Phone number"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                iconSize={11}
                              />
                            )}
                          </div>
                          {emg?.name && (
                            <p className="text-[11px] text-mute truncate max-w-[160px]" title={`${emg.name} (${emg.relationship || "Contact"})`}>
                              <span className="font-medium text-ink/80">Emerg:</span> {emg.name}
                              {emg.relationship ? ` (${emg.relationship})` : ""}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Identity / Document */}
                      <td className="px-4 py-3.5">
                        {idInfo.type || idInfo.number ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 rounded-md bg-soft px-2 py-0.5 text-[10.5px] font-semibold text-ink">
                              <IdCard className="h-3 w-3 text-primary" />
                              {formatIdType(idInfo.type)}
                            </span>
                            {idInfo.number && (
                              <p className="font-mono text-[11px] text-mute">
                                No: {idInfo.number}
                              </p>
                            )}
                            {idInfo.expiryDate && (
                              <p className="text-[10px] text-mute">
                                Exp: {formatDate(idInfo.expiryDate)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-mute italic">No document on file</span>
                        )}
                      </td>

                      {/* Occupation & Employer */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 max-w-[180px]">
                          <p className="font-medium text-ink truncate">
                            {tenant.occupation || empInfo.jobTitle || "—"}
                          </p>
                          {empInfo.employer && (
                            <p className="text-[11px] text-mute truncate flex items-center gap-1">
                              <Briefcase className="h-3 w-3 shrink-0 text-mute" />
                              {empInfo.employer}
                            </p>
                          )}
                          {empInfo.monthlyIncome != null && empInfo.monthlyIncome > 0 && (
                            <p className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(empInfo.monthlyIncome)}/mo
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Leases Count */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            leaseCount > 0
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                              : "bg-soft text-mute"
                          }`}
                        >
                          <Building2 className="h-3 w-3" />
                          {leaseCount} {leaseCount === 1 ? "lease" : "leases"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <StatusChips status={(tenant.status || "active").toLowerCase()} />
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/add-new-tenant?tenantId=${encodeURIComponent(tenant.id)}&returnTo=${encodeURIComponent(detailHref)}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-mute shadow-sm transition-colors hover:border-primary hover:text-primary"
                            title="Edit tenant"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <Link
                            href={detailHref}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink shadow-sm transition-colors hover:border-primary hover:text-primary"
                          >
                            View
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {filteredTenants.map((tenant) => {
              const name = formatTenantName(tenant);
              const detailHref = `${basePath}/${tenant.id}`;
              const idInfo = tenant.identification || {};
              const empInfo = tenant.employmentInformation || tenant.employmentInfo || {};
              const leaseCount = tenant._count?.leases ?? (tenant.leases?.length || 0);

              return (
                <div
                  key={tenant.id}
                  className="rounded-xl border border-line bg-card p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={detailHref}
                          className="font-semibold text-ink hover:text-primary hover:underline block truncate text-sm"
                        >
                          {name}
                        </Link>
                        <p className="text-xs text-mute truncate">{tenant.email || "No email"}</p>
                      </div>
                    </div>
                    <StatusChips status={(tenant.status || "active").toLowerCase()} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-y border-line py-2.5 text-xs">
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-mute">
                        Phone
                      </span>
                      <p className="font-mono text-ink mt-0.5 truncate">
                        {tenant.phone || tenant.phoneNumber || "—"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-mute">
                        ID Document
                      </span>
                      <p className="text-ink mt-0.5 truncate">
                        {idInfo.type ? formatIdType(idInfo.type) : "—"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-mute">
                        Occupation
                      </span>
                      <p className="text-ink mt-0.5 truncate">
                        {tenant.occupation || empInfo.jobTitle || "—"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-mute">
                        Active Leases
                      </span>
                      <p className="text-ink mt-0.5 font-medium">
                        {leaseCount} {leaseCount === 1 ? "unit" : "units"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-mute">
                      Registered: {formatDate(tenant.createdAt)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/add-new-tenant?tenantId=${encodeURIComponent(tenant.id)}&returnTo=${encodeURIComponent(detailHref)}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-mute hover:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <Link
                        href={detailHref}
                        className="inline-flex items-center gap-1 rounded-lg border border-line bg-soft px-3 py-1.5 text-xs font-semibold text-ink hover:text-primary"
                      >
                        View Profile
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

