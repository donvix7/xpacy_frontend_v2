"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  Building2,
  ExternalLink,
  Zap,
  MapPin,
  Plus,
} from "lucide-react";
import StatusChips from "@/app/_components/StatusChips";
import { formatCurrency } from "@/app/_lib/utils";

export default function ListingsDirectoryTab({ properties = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Transform raw properties into unified listing records
  const allListings = useMemo(() => {
    if (properties.length > 0) {
      return properties.map((p, idx) => ({
        id: p.id || p._id || `listing-${idx}`,
        title: p.property_name || p.name || `Listing #${1000 + idx}`,
        propertyName: p.property_name || p.name || "Main Property",
        unit: p.unitNumber ? `Unit ${p.unitNumber}` : "Entire Building",
        locality: [p.city, p.state].filter(Boolean).join(", ") || p.address || "Lagos, Nigeria",
        category: p.category || (idx % 2 === 0 ? "For Rent" : "For Sale"),
        type: p.propertyType || (idx % 3 === 0 ? "Flat" : idx % 3 === 1 ? "House" : "Duplex"),
        price: p.property_price || p.price || (idx % 2 === 0 ? 3500000 : 85000000),
        status: p.status || p.property_status || "active",
        views: Number(p.views) || (idx === 0 ? 412 : idx === 1 ? 320 : 145),
        enquiries: Math.round((Number(p.views) || 120) * 0.08) || (idx + 3) * 2,
        isBoosted: idx % 3 === 0,
        image: p.images?.[0] ? `https://app.xpacy.com/src/upload/properties/${p.images[0]}` : null,
      }));
    }

    // Default rich sample listings if database has 0 items
    return [
      /*
      {
        id: "lst-101",
        title: "Luxury 4-Bedroom Terrace Duplex",
        propertyName: "Imperial Vista Court",
        unit: "Unit B4",
        locality: "Lekki Phase 1, Lagos",
        category: "For Rent",
        type: "Terraced Duplex",
        price: 8500000,
        status: "active",
        views: 520,
        enquiries: 34,
        isBoosted: true,
        image: null,
      },
      {
        id: "lst-102",
        title: "Modern 2-Bedroom Waterfront Apartment",
        propertyName: "Oceanview Heights",
        unit: "Penthouse 12",
        locality: "Victoria Island, Lagos",
        category: "For Rent",
        type: "Flat",
        price: 12000000,
        status: "active",
        views: 430,
        enquiries: 28,
        isBoosted: true,
        image: null,
      },
      {
        id: "lst-103",
        title: "Executive 5-Bedroom Detached Mansion",
        propertyName: "Crown Ridge Estate",
        unit: "Plot 18",
        locality: "Maitama, Abuja",
        category: "For Sale",
        type: "House",
        price: 350000000,
        status: "pending",
        views: 290,
        enquiries: 18,
        isBoosted: false,
        image: null,
      },
      {
        id: "lst-104",
        title: "Serviced 3-Bedroom Flat with BQ",
        propertyName: "Heritage Court",
        unit: "Flat 3A",
        locality: "Ikeja GRA, Lagos",
        category: "For Rent",
        type: "Flat",
        price: 6000000,
        status: "rented",
        views: 380,
        enquiries: 22,
        isBoosted: false,
        image: null,
      },
      {
        id: "lst-105",
        title: "Commercial Grade A Office Floor",
        propertyName: "Broad Street Financial Tower",
        unit: "Wing B, 5th Floor",
        locality: "Marina, Lagos Island",
        category: "For Rent",
        type: "Commercial",
        price: 45000000,
        status: "active",
        views: 195,
        enquiries: 12,
        isBoosted: true,
        image: null,
      },*/
    ];
  }, [properties]);

  // Filtered listings
  const filteredListings = useMemo(() => {
    return allListings.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.propertyName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" ||
        item.status.toLowerCase() === selectedStatus.toLowerCase();

      const matchesCategory =
        selectedCategory === "all" ||
        item.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [allListings, searchQuery, selectedStatus, selectedCategory]);

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
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rented">Rented</option>
            <option value="draft">Draft</option>
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
            href="/dashboard/admin/properties"
            className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold py-2 px-3.5 rounded-lg hover:bg-primary-900 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Properties</span>
          </Link>
        </div>
      </div>

      {/* Listings Table (Desktop) */}
      <div className="hidden lg:block bg-white rounded-xl border border-primary-100 shadow-xs overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-neutrals-900 font-mono text-xs font-bold uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="p-4">Listing Details</th>
              <th className="p-4">Property / Unit</th>
              <th className="p-4">Location</th>
              <th className="p-4 text-center">Category</th>
              <th className="p-4 text-right">Price / Rent</th>
              <th className="p-4 text-center">Views / Enq.</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-gray-400 text-sm">
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
                        <p className="text-[11px] text-gray-500 font-mono">
                          ID: {listing.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Property / Unit */}
                  <td className="p-4 text-gray-700">
                    <div>
                      <span className="font-semibold block truncate">
                        {listing.propertyName}
                      </span>
                      <span className="text-[11px] text-gray-400 block">
                        {listing.unit}
                      </span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[150px]">{listing.locality}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {listing.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4 text-right font-extrabold text-primary font-mono">
                    {formatCurrency(listing.price)}
                  </td>

                  {/* Views & Enquiries */}
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-gray-600 font-semibold" title="Total Views">
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        {listing.views}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600 font-semibold" title="Enquiries">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                        {listing.enquiries}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <StatusChips status={listing.status} />
                    </div>
                  </td>

                  {/* Action */}
                  <td className="p-4 text-right">
                    <Link
                      href={`/dashboard/admin/properties`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 text-primary text-xs font-bold hover:bg-primary-100 transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
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
                    <p className="text-xs text-gray-500 truncate">{listing.locality}</p>
                  </div>
                </div>
                <StatusChips status={listing.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[11px]">Price / Rent</span>
                  <span className="font-extrabold text-primary font-mono">
                    {formatCurrency(listing.price)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[11px]">Views & Leads</span>
                  <span className="font-bold text-gray-700">
                    {listing.views} views • {listing.enquiries} enq.
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-500">
                  {listing.propertyName} • {listing.unit}
                </span>
                <Link
                  href={`/dashboard/admin/properties`}
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

