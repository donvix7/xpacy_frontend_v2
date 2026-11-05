"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Building2,
  ExternalLink,
  Zap,
  MapPin,
  Plus,
} from "lucide-react";
import StatusChips from "@/app/_components/StatusChips";
import { formatCurrency } from "@/app/_lib/utils";

const displayField = (value) => {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.map(displayField).join(", ") : "—";
  if (typeof value === "object") return Object.values(value).filter((part) => part != null && part !== "").map(displayField).join(", ") || "—";
  return String(value);
};

const formatListingDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(date);
};

const formatListingPrice = (amount, currency = "NGN") => {
  if (amount == null || amount === "") return "—";
  if (currency === "NGN") return formatCurrency(amount);
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).format(Number(amount));
  } catch {
    return `${currency} ${Number(amount).toLocaleString()}`;
  }
};

export default function ListingsDirectoryTab({ listings = [], organizationId }) {
  const organizationQuery = organizationId ? `organizationId=${encodeURIComponent(organizationId)}` : "";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const allListings = useMemo(() => listings.map((listing, idx) => {
    const property = listing.property || {};
    const rawType = String(listing.listingType || "").toUpperCase().replace(/[\s_-]/g, "");
    const route = rawType === "RENT" ? "rent" : rawType.includes("SHORT") ? "shortlet" : "buy";
    const propertySlug = property.property_slug || property.slug;
    const location = listing.location;
    const listingLocation = typeof location === "string"
      ? location
      : [location?.address, location?.city, location?.state, location?.country].filter(Boolean).join(", ");
    return {
      id: listing.id || listing._id || `listing-${idx}`,
      propertyId: listing.propertyId,
      unitId: listing.unitId || listing.unit?.id,
      title: listing.title || `Listing ${idx + 1}`,
      description: listing.description,
      propertyName: property.property_name || property.name || property.title || "—",
      propertyType: property.property_type || property.propertyType || property.type,
      bedrooms: property.total_bedrooms ?? property.bedrooms ?? property.bedroomsCount,
      bathrooms: property.total_bathrooms ?? property.bathrooms ?? property.bathroomsCount,
      propertyPrice: property.property_price ?? property.price,
      unitNumber: listing.unit?.unitNumber,
      unitType: listing.unit?.unitType,
      locality: listingLocation || [property.address, property.city, property.state, property.country].filter(Boolean).join(", ") || null,
      listingType: listing.listingType,
      category: rawType.includes("SHORT") ? "Shortlet" : rawType === "SALE" || rawType === "BUY" ? "For Sale" : "For Rent",
      price: listing.price,
      currency: listing.currency || "NGN",
      deposit: listing.deposit,
      availability: listing.availability,
      amenities: listing.amenities,
      publishedAt: listing.publishedAt,
      expiresAt: listing.expiresAt,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      status: listing.status || "UNKNOWN",
      isBoosted: Boolean(listing.isBoosted || listing.featured),
      image: property.images?.[0] ? `https://app.xpacy.com/src/upload/properties/${property.images[0]}` : null,
      detailsHref: propertySlug ? `/${route}/${propertySlug}?${organizationQuery}` : `/listings?${organizationQuery}`,
    };
  }), [listings, organizationQuery]);

  // Filtered listings
  const filteredListings = useMemo(() => {
    return allListings.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        displayField(item.locality).toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.propertyName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" ||
        String(item.status).toLowerCase() === selectedStatus.toLowerCase();

      const matchesCategory =
        selectedCategory === "all" ||
        item.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [allListings, searchQuery, selectedStatus, selectedCategory]);
console.log(filteredListings)
  return (
    <div className="space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="bg-white rounded-xl border border-primary-100 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search listings by title, locality, or building..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary text-gray-900"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
          </select>

          {/* Category select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-primary"
          >
            <option value="all">All Categories</option>
            <option value="rent">For Rent</option>
            <option value="sale">For Sale</option>
            <option value="shortlet">Short Let</option>
          </select>

          <Link
            href={`/management?${organizationQuery}`}
            className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold py-2 px-3.5 rounded-lg hover:bg-primary-900 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Management</span>
          </Link>
        </div>
      </div>

      {/* Listings Table (Desktop) */}
      <div className="hidden lg:block bg-white rounded-xl border border-primary-100 shadow-xs overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-neutrals-900 font-mono text-xs font-bold uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="p-4">Listing Details</th>
              <th className="p-4">Unit</th>
              <th className="p-4">Location</th>
              <th className="p-4 text-center">Category</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4">Availability</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-10 text-center text-gray-400 text-sm">
                  No listings found matching your search and filter criteria.
                </td>
              </tr>
            ) : (
              filteredListings.map((listing) => (
                <tr
                  key={listing.id}
                  className="hover:bg-gray-50/60 transition-colors text-xs sm:text-sm"
                >
                  {/* Listing Details */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-11 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                        {listing.image ? (
                          <Image
                            src={listing.image}
                            alt={listing.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Building2 className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        {listing.isBoosted && (
                          <span
                            title="Featured Boost Active"
                            className="absolute top-1 left-1 p-0.5 bg-amber-500 text-white rounded-xs"
                          >
                            <Zap className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 max-w-[200px]">
                        <p className="font-bold text-gray-900 truncate" title={listing.title}>
                          {listing.title}
                        </p>
                        <p className="max-w-[220px] truncate text-[11px] text-gray-500" title={displayField(listing.description)}>{displayField(listing.description)}</p>
                       
                      </div>
                    </div>
                  </td>

                  {/* Property / Unit */}
                  <td className="p-4 text-gray-700">
                    <div>
                        <span className="font-semibold block truncate">
                          {listing.propertyName}
                        </span>
                        <span className="text-[11px] text-gray-500 block">Type: {displayField(listing.propertyType)}</span>
                        <span className="text-[11px] text-gray-500 block">Property price: {formatListingPrice(listing.propertyPrice)}</span>
                        <span className="text-[11px] text-gray-400 block">Unit {displayField(listing.unitNumber)} · {displayField(listing.unitType)}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[150px]">{displayField(listing.locality)}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {listing.category}
                    </span>
                  </td>

                  {/* Price and deposit */}
                  <td className="p-4 text-right font-extrabold text-primary font-mono">
                    <span>{formatListingPrice(listing.price, listing.currency)}</span>
                  </td>

                  <td className="max-w-[180px] p-4 text-xs text-gray-600">
                    <span className="block">Available: {displayField(listing.availability)}</span>
                  </td>

           

            

                  {/* Action */}
                  <td className="p-4 text-right">
                    <Link
                      href={listing.detailsHref}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 text-primary text-xs font-bold hover:bg-primary-100 transition-colors"
                    >
                      <ExternalLink className="w-7 h-7" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredListings.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center text-gray-400 text-xs">
            No listings found.
          </div>
        ) : (
          filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-xl border border-primary-100 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                    {listing.image ? (
                      <Image
                        src={listing.image}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Building2 className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {listing.title}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{displayField(listing.locality)}</p>
                  </div>
                </div>
                <StatusChips status={listing.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[11px]">Price ({listing.currency})</span>
                  <span className="font-extrabold text-primary font-mono">
                    {formatListingPrice(listing.price, listing.currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[11px]">Deposit</span>
                  <span className="font-bold text-gray-700">{formatListingPrice(listing.deposit, listing.currency)}</span>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-xs">
                {[
                  ["Listing ID", listing.id], ["Property ID", listing.propertyId], ["Property type", listing.propertyType],
                  ["Bedrooms", listing.bedrooms], ["Bathrooms", listing.bathrooms], ["Property price", listing.propertyPrice], ["Unit ID", listing.unitId],
                  ["Listing type", listing.listingType], ["Unit number", listing.unitNumber], ["Unit type", listing.unitType],
                  ["Availability", listing.availability], ["Amenities", listing.amenities], ["Published", formatListingDate(listing.publishedAt)],
                  ["Expires", formatListingDate(listing.expiresAt)], ["Created", formatListingDate(listing.createdAt)], ["Updated", formatListingDate(listing.updatedAt)],
                ].map(([label, value]) => <div key={label}><dt className="text-gray-400">{label}</dt><dd className="mt-0.5 break-words font-medium text-gray-700">{displayField(value)}</dd></div>)}
                <div className="col-span-2"><dt className="text-gray-400">Description</dt><dd className="mt-0.5 break-words font-medium text-gray-700">{displayField(listing.description)}</dd></div>
              </dl>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-500">
                  {listing.propertyName} • Unit {displayField(listing.unitNumber)} ({displayField(listing.unitType)})
                </span>
                <Link
                  href={listing.detailsHref}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span>Details</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
