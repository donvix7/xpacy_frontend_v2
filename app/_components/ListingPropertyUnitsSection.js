"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  DoorOpen,
  Layers,
  LayoutGrid,
  Sofa,
  Table2,
} from "lucide-react";
import { RiHotelBedLine } from "react-icons/ri";
import { LuBath } from "react-icons/lu";
import { FaRegSquare } from "react-icons/fa6";
import { formatCurrency } from "@/app/_lib/utils";

function titleCase(value) {
  if (!value) return "—";
  return String(value)
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ListingPropertyUnitsSection({
  units = [],
  currency = "NGN",
  listingId = "",
  propertyId = "",
  returnTo = "/listings",
  isAuthenticated = false,
}) {
  const [view, setView] = useState("grid");
  const list = Array.isArray(units) ? units : [];

  const normalizeUnit = (u, idx) => {
    const uId = u?.id || u?._id || "";
    const rawNumber = u?.unitNumber || u?.name || `Unit ${idx + 1}`;
    const displayName = String(rawNumber).toLowerCase().startsWith("unit")
      ? rawNumber
      : `Unit ${rawNumber}`;
    const uType = u?.unitType || u?.type || "";
    const uStatus = String(
      u?.status || u?.availabilityStatus || "AVAILABLE"
    ).toUpperCase();
    const isAvailable = ["AVAILABLE", "VACANT", "ACTIVE"].includes(uStatus);
    const uPrice = u?.rentAmount ?? u?.price ?? u?.rent ?? null;
    const uCurrency = u?.currency || currency;
    const priceText =
      uPrice != null && uPrice !== ""
        ? formatCurrency(uPrice, uCurrency)
        : "Price on request";

    const uParams = new URLSearchParams();
    if (listingId) uParams.set("listingId", String(listingId));
    if (uId) uParams.set("unitId", String(uId));
    if (propertyId) uParams.set("propertyId", String(propertyId));
    uParams.set("returnTo", returnTo);
    const bookingPath = `/admin/add-new-booking?${uParams.toString()}`;
    const bookingHref = isAuthenticated
      ? bookingPath
      : `/auth/log-in?redirectUrl=${encodeURIComponent(bookingPath)}`;

    return {
      key: uId || `unit-${idx}`,
      id: uId,
      displayName,
      typeLabel: uType ? titleCase(uType) : "—",
      statusLabel: titleCase(uStatus),
      isAvailable,
      bedrooms: u?.bedrooms ?? null,
      bathrooms: u?.bathrooms ?? null,
      squareMeters: u?.squareMeters ?? null,
      floor: u?.floor ?? null,
      furnished: typeof u?.furnished === "boolean" ? u.furnished : null,
      priceText,
      bookingHref,
    };
  };

  const normalized = list.map(normalizeUnit);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-primary-900 sm:text-[1.375rem]">
          Units in this Property ({normalized.length})
        </h2>

        {normalized.length > 0 && (
          <div
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1"
            role="group"
            aria-label="Units view mode"
          >
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                view === "grid"
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              aria-label="Table view"
              aria-pressed={view === "table"}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                view === "table"
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Table</span>
            </button>
          </div>
        )}
      </div>

      {normalized.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-6 text-center text-sm text-gray-500">
          No units listed for this property yet.
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {normalized.map((u) => (
            <div
              key={u.key}
              className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-xs transition hover:border-primary-200 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-base font-bold text-gray-900">
                      <DoorOpen
                        className="h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span className="truncate">{u.displayName}</span>
                    </p>
                    {u.typeLabel !== "—" ? (
                      <p className="mt-0.5 text-xs font-medium text-gray-500">
                        {u.typeLabel}
                      </p>
                    ) : null}
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                      u.isAvailable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {u.statusLabel}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-xs text-gray-600">
                  {u.bedrooms != null && (
                    <span className="inline-flex items-center gap-1">
                      <RiHotelBedLine className="h-3.5 w-3.5 text-gray-400" />
                      {u.bedrooms} {Number(u.bedrooms) === 1 ? "Bed" : "Beds"}
                    </span>
                  )}
                  {u.bathrooms != null && (
                    <span className="inline-flex items-center gap-1">
                      <LuBath className="h-3.5 w-3.5 text-gray-400" />
                      {u.bathrooms} {Number(u.bathrooms) === 1 ? "Bath" : "Baths"}
                    </span>
                  )}
                  {u.squareMeters != null && (
                    <span className="inline-flex items-center gap-1">
                      <FaRegSquare className="h-3 w-3 text-gray-400" />
                      {u.squareMeters} m²
                    </span>
                  )}
                  {u.floor != null && (
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-gray-400" />
                      Floor {u.floor}
                    </span>
                  )}
                  {u.furnished !== null && (
                    <span className="inline-flex items-center gap-1">
                      <Sofa className="h-3.5 w-3.5 text-gray-400" />
                      {u.furnished ? "Furnished" : "Unfurnished"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                <span className="font-mono text-sm font-bold text-primary">
                  {u.priceText}
                </span>

                {u.id && (
                  <Link
                    href={u.bookingHref}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90"
                  >
                    Book unit
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-xs">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Specs</th>
                <th className="px-4 py-3">Floor</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {normalized.map((u) => {
                const specs = [
                  u.bedrooms != null ? `${u.bedrooms} bd` : null,
                  u.bathrooms != null ? `${u.bathrooms} ba` : null,
                  u.squareMeters != null ? `${u.squareMeters} m²` : null,
                  u.furnished !== null
                    ? u.furnished
                      ? "Furnished"
                      : "Unfurnished"
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <tr
                    key={u.key}
                    className="transition-colors hover:bg-primary-50/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-gray-900">
                      <span className="inline-flex items-center gap-2">
                        <DoorOpen
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />
                        {u.displayName}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">
                      {u.typeLabel}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-600">
                      {specs || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-gray-600">
                      {u.floor != null ? `Floor ${u.floor}` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-bold text-primary">
                      {u.priceText}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                          u.isAvailable
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {u.statusLabel}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      {u.id ? (
                        <Link
                          href={u.bookingHref}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90"
                        >
                          Book unit
                          <ArrowUpRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

