"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, LayoutGrid, MapPin, Search, SlidersHorizontal, Table2 } from "lucide-react";
import StatusChips from "@/app/_components/StatusChips";
import { formatCurrency } from "@/app/_lib/utils";

function listingImage(property) {
  const image = property?.images?.[0];
  if (!image) return null;
  return /^https?:\/\//i.test(image) ? image : `https://app.xpacy.com/src/upload/properties/${image}`;
}

export default function ListingsDirectoryTab({ listings = [], organizationId }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [unitType, setUnitType] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [view, setView] = useState("grid");

  const cards = useMemo(() => listings.map((listing, index) => {
    const property = listing.property || {};
    const kind = String(listing.listingType || listing.listing_type || "").toUpperCase();
    const categoryName = kind.includes("SHORT") ? "Shortlet" : kind === "SALE" || kind === "BUY" ? "For Sale" : "For Rent";
    const name = property.property_name || property.name || property.title || listing.title || "Property listing";
    const address = [property.address, property.city || listing.location?.city, property.state || listing.location?.state].filter(Boolean).join(", ");
    const slug = property.property_slug || property.slug;
    const route = categoryName === "Shortlet" ? "shortlet" : categoryName === "For Sale" ? "buy" : "rent";
    const href = slug ? `/${route}/${slug}?organizationId=${encodeURIComponent(organizationId || "")}` : `/listings?organizationId=${encodeURIComponent(organizationId || "")}`;
    return {
      ...listing,
      key: listing.id || listing._id || `${listing.propertyId}-${index}`,
      property,
      name,
      address,
      categoryName,
      href,
      image: listingImage(property),
      price: listing.price ?? property.property_price ?? property.price,
      unitName: listing.unit?.unitNumber || listing.unit?.unitType || "Not specified",
      resolvedUnitType: listing.unit?.unitType || property.property_type || property.propertyType || property.type || "Not specified",
      availabilityText: listing.availability == null || listing.availability === "" ? "Not specified" : String(listing.availability),
    };
  }), [listings, organizationId]);

  const availableCategories = [...new Set(cards.map((item) => item.categoryName))];
  const availableUnitTypes = [...new Set(cards.map((item) => item.resolvedUnitType).filter((item) => item !== "Not specified"))];
  const availableStatuses = [...new Set(cards.map((item) => String(item.status || "PUBLISHED").toUpperCase()))];
  const visible = cards.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${item.name} ${item.title || ""} ${item.address} ${item.description || ""} ${item.unitName}`.toLowerCase().includes(query);
    const matchesCategory = category === "all" || item.categoryName === category;
    const matchesStatus = status === "all" || String(item.status || "PUBLISHED").toUpperCase() === status;
    const matchesUnit = unitType === "all" || item.resolvedUnitType === unitType;
    const matchesAvailability = availability === "all" || (availability === "specified" ? item.availability != null && item.availability !== "" : item.availability == null || item.availability === "");
    return matchesSearch && matchesCategory && matchesStatus && matchesUnit && matchesAvailability;
  });

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <aside className="h-fit w-full shrink-0 rounded-xl border border-primary-100 bg-white p-5  md:sticky md:top-28 md:w-[290px]">
        <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="font-bold text-gray-900">Filter listings</h2>
        </div>
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-gray-600">Search listings
            <span className="relative mt-1.5 block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, location, unit..." className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm font-normal text-gray-900 outline-none focus:border-primary" /></span>
          </label>
          <FilterSelect label="Listing type" value={category} onChange={setCategory} options={availableCategories} allLabel="All listing types" />
          <FilterSelect label="Listing status" value={status} onChange={setStatus} options={availableStatuses} allLabel="All statuses" />
          <FilterSelect label="Unit / property type" value={unitType} onChange={setUnitType} options={availableUnitTypes} allLabel="All unit types" />
          <label className="block text-xs font-semibold text-gray-600">Availability
            <select value={availability} onChange={(event) => setAvailability(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal text-gray-800 outline-none focus:border-primary">
              <option value="all">Any availability</option><option value="specified">Availability provided</option><option value="unspecified">Not specified</option>
            </select>
          </label>
          <button type="button" onClick={() => { setSearch(""); setCategory("all"); setStatus("all"); setUnitType("all"); setAvailability("all"); }} className="w-full rounded-lg border border-primary px-3 py-2.5 text-sm font-bold text-primary transition hover:bg-primary-50">Clear filters</button>
        </div>
      </aside>

      <section className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-100 bg-white px-4 py-3">
          <p className="text-sm text-gray-500"><span className="font-bold text-gray-900">{visible.length}</span> {visible.length === 1 ? "listing" : "listings"}</p>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1" aria-label="Listing view">
            <button type="button" onClick={() => setView("grid")} aria-label="Grid view" aria-pressed={view === "grid"} className={`rounded-md p-2 ${view === "grid" ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"}`}><LayoutGrid className="h-4 w-4" /></button>
            <button type="button" onClick={() => setView("table")} aria-label="Table view" aria-pressed={view === "table"} className={`rounded-md p-2 ${view === "table" ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"}`}><Table2 className="h-4 w-4" /></button>
          </div>
        </div>

        {visible.length ? view === "grid" ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((listing) => (
            <article key={listing.key} className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm transition hover:shadow-md">
              <Link href={listing.href} className="relative block h-52 bg-gray-100">
                {listing.image ? <Image src={listing.image} alt={listing.name} fill unoptimized className="object-cover" /> : <div className="flex h-full items-center justify-center text-gray-400"><Building2 className="h-10 w-10" /></div>}
                <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white">{listing.categoryName}</span>
              </Link>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-gray-900">{listing.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">{listing.title && listing.title !== listing.name ? listing.title : listing.description || "View property details and availability."}</p>
                    </div>
                    </div>
                <p className="flex items-center gap-1.5 text-sm text-gray-500">{listing.address || "Location available on request"}</p>
                <div className="flex items-end justify-between border-t border-gray-100 pt-3"><div><p className="text-xs text-gray-400">{listing.unit?.unitNumber ? `Unit ${listing.unit.unitNumber}` : listing.resolvedUnitType}</p><p className="mt-1 text-sm font-extrabold text-primary">{listing.price == null ? "Price on request" : formatCurrency(listing.price)}</p></div><Link href={listing.href} className="rounded-lg bg-primary-50 px-3 py-2 text-sm font-bold text-primary hover:bg-primary-100">Details</Link></div>
              </div>
            </article>
          ))}
        </div> : <div className="overflow-x-auto rounded-xl border border-primary-100 bg-white shadow-sm"><table className="w-full min-w-[940px] text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/80 text-xs font-bold uppercase tracking-wide text-gray-600"><tr>
            <th className="p-4">Listing</th>
            <th className="p-4">Unit</th>
            <th className="p-4">Location</th>
            <th className="p-4">Type</th>
            <th className="p-4 text-right">Price</th>
            <th className="p-4">Availability</th>
            <th className="p-4 text-right">Action</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">{visible.map((listing) => <tr key={listing.key} className="text-gray-700 transition hover:bg-gray-50/70">
            <td className="p-4"><div className="flex min-w-[220px] items-center gap-3"><div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">{listing.image ? <Image src={listing.image} alt={listing.name} fill unoptimized className="object-cover" /> : <div className="flex h-full items-center justify-center text-gray-400"><Building2 className="h-5 w-5" /></div>}</div><div className="min-w-0"><p className="truncate font-bold text-gray-900">{listing.title || listing.name}</p><p className="truncate text-xs text-gray-500">{listing.name}</p></div></div></td>
            <td className="p-4">{listing.unit?.unitNumber ? `Unit ${listing.unit.unitNumber}` : listing.resolvedUnitType}</td>
            <td className="p-4"><span className="flex max-w-[180px] items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" /><span className="truncate">{listing.address || "Location unavailable"}</span></span></td>
            <td className="p-4"><span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary">{listing.categoryName}</span></td>
            <td className="p-4 text-right font-bold text-primary">{listing.price == null ? "Price on request" : formatCurrency(listing.price)}</td>
            <td className="p-4 text-xs text-gray-600">{listing.availabilityText}</td>
            <td className="p-4 text-right"><Link href={listing.href} className="inline-flex whitespace-nowrap rounded-lg bg-primary-50 px-3 py-2 text-xs font-bold text-primary hover:bg-primary-100">View details</Link></td>
          </tr>)}</tbody>
        </table></div> : <div className="rounded-xl border border-primary-100 bg-white p-12 text-center text-sm text-gray-500">No listings match these filters.</div>}
      </section>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, allLabel }) {
  return <label className="block text-xs font-semibold text-gray-600">{label}
    <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal text-gray-800 outline-none focus:border-primary">
      <option value="all">{allLabel}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>;
}
