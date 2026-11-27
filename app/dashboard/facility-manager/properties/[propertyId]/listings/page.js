import Link from "next/link";
import { cookies } from "next/headers";
import {
    Building2,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronLeft,
    Plus,
    Sparkles,
} from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import { getListingById } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

const headers = [
    { heading: "Listing" },
    { heading: "Property / Unit" },
    { heading: "Location" },
    { heading: "Rent", center: true },
    { heading: "Status", center: true },
    { heading: "" },
];

const valueFrom = (listing, keys, fallback = "—") => {
    for (const key of keys) {
        const value = key
            .split(".")
            .reduce((object, part) => object?.[part], listing);
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return fallback;
};

const statusOf = (listing) =>
    String(valueFrom(listing, ["status", "listingStatus", "state"], "Unknown"));

const listingTitle = (listing, index) =>
    valueFrom(
        listing,
        ["title", "name", "listingTitle", "listingNumber", "reference", "id", "_id"],
        `Listing ${index + 1}`,
    );

const propertyName = (listing) => {
    const value = valueFrom(listing, [
        "property.name",
        "property.title",
        "property.property_name",
        "propertyName",
        "propertyTitle",
    ]);
    return typeof value === "object"
        ? value?.name || value?.title || "—"
        : value;
};

const unitDisplay = (listing) => {
    const unit = listing.unit;
    if (unit?.unitNumber) return `Unit ${unit.unitNumber}`;
    if (unit?.name) return unit.name;
    return valueFrom(listing, ["unitNumber", "unit_number", "unitName"], "—");
};

const locationDisplay = (listing) => {
    const city = valueFrom(listing, ["city", "address.city", "location.city"], "");
    const state = valueFrom(listing, ["state", "address.state", "location.state"], "");
    const country = valueFrom(listing, ["country", "address.country", "location.country"], "");
    const parts = [city, state, country].filter((p) => p && p !== "—");
    return parts.length ? parts.join(", ") : "—";
};

const priceAmount = (listing) =>
    valueFrom(
        listing,
        ["rentAmount", "rent_amount", "price", "amount", "monthlyRent"],
        null,
    );

export default async function UserListingsPage({ params }) {
    const resolved = await params;
    const id = resolved?.propertyId || resolved?.id;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const results = await Promise.allSettled([getListingById(id, token)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const listings =
        results[0].status === "fulfilled" ? results[0].value : [];
    const list = Array.isArray(listings)
        ? listings
        : listings && typeof listings === "object"
            ? [listings]
            : [];

    const normalizedStatus = (listing) => statusOf(listing).toLowerCase();

    const activeCount = list.filter((l) =>
        ["active", "published", "available", "confirmed"].includes(
            normalizedStatus(l),
        ),
    ).length;
    const pendingCount = list.filter((l) =>
        ["pending", "draft", "review"].includes(normalizedStatus(l)),
    ).length;
    const inactiveCount = list.filter((l) =>
        [
            "inactive",
            "unpublished",
            "archived",
            "closed",
            "sold",
            "rented",
            "cancelled",
            "canceled",
        ].includes(normalizedStatus(l)),
    ).length;

    // Health signal: % of listings currently live
    const activeShare =
        list.length > 0 ? Math.round((activeCount / list.length) * 100) : 0;

    const heroStats = [
        {
            label: "All listings",
            value: list.length,
            hint: "Total records",
        },
        {
            label: "Active",
            value: activeCount,
            hint: "Live & published",
        },
        {
            label: "Pending",
            value: pendingCount,
            hint: "Awaiting review",
        },
        {
            label: "Inactive",
            value: inactiveCount,
            hint: "Archived / closed",
        },
    ];

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const renderRow = (listing, index) => {
        const listingId = listing.id || listing._id;
        const detailsHref = `/dashboard/property-owner/properties/${id}/listings/${listingId}`;

        return (
            <tr
                key={listingId || index}
                className="border-b border-gray-100 text-sm last:border-0 transition-colors hover:bg-gray-50/60"
            >
                <td className="p-4 font-semibold text-primary">
                    <Link href={detailsHref} className="hover:underline">
                        {listingTitle(listing, index)}
                    </Link>
                </td>
                <td className="p-4 text-gray-700">
                    <div className="flex flex-col">
                        <span>{propertyName(listing)}</span>
                        <span className="text-xs text-gray-500">
                            {unitDisplay(listing)}
                        </span>
                    </div>
                </td>
                <td className="p-4 text-gray-600">{locationDisplay(listing)}</td>
                <td className="p-4 text-center font-bold text-gray-900">
                    {priceAmount(listing) === null
                        ? "—"
                        : formatCurrency(priceAmount(listing))}
                </td>
                <td className="p-4 text-center">
                    <div className="flex justify-center">
                        <StatusChips status={statusOf(listing)} />
                    </div>
                </td>
                <td className="p-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                    
                        <Link
                            href={detailsHref}
                            className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-100"
                        >
                            View details
                        </Link>
                    </div>
                </td>
            </tr>
        );
    };

    const renderMobileCard = (listing, index) => {
        const listingId = listing.id || listing._id;
        const detailsHref = `/dashboard/property-owner/properties/${id}/listings/${listingId}`;

        return (
            <article
                key={listingId || index}
                className="rounded-xl border border-primary-100 bg-white p-4 shadow-sm"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={detailsHref}
                            className="break-words text-sm font-bold text-primary hover:underline"
                        >
                            {listingTitle(listing, index)}
                        </Link>
                        <p className="mt-1 text-xs text-gray-500">
                            {propertyName(listing)} • {unitDisplay(listing)}
                        </p>
                    </div>
                    <StatusChips status={statusOf(listing)} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
                    <div className="col-span-2">
                        <dt className="text-xs text-gray-500">Location</dt>
                        <dd className="mt-1 text-gray-800">
                            {locationDisplay(listing)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-gray-500">Rent</dt>
                        <dd className="mt-1 font-bold text-gray-900">
                            {priceAmount(listing) === null
                                ? "—"
                                : formatCurrency(priceAmount(listing))}
                        </dd>
                    </div>
                    {valueFrom(listing, ["billingCycle", "billing_cycle"], "") && (
                        <div>
                            <dt className="text-xs text-gray-500">Billing cycle</dt>
                            <dd className="mt-1 capitalize text-gray-800">
                                {String(
                                    valueFrom(listing, ["billingCycle", "billing_cycle"]),
                                ).toLowerCase()}
                            </dd>
                        </div>
                    )}
                </dl>

                <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3">
                
                    <Link
                        href={detailsHref}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        View details
                    </Link>
                </div>
            </article>
        );
    };

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            {/* ---------- Back link ---------- */}
            <Link
                href={`/dashboard/property-owner/properties/${id}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to property
            </Link>

            {/* ---------- Hero summary ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                           
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Listings console · {today}
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                My Listings
                            </h1>
                            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                                View and manage listing associated with this property.
                            </p>
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

                      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
                            <Link
                                href={`/admin/add-new-listing?propertyId=${encodeURIComponent(id)}&returnTo=${encodeURIComponent(`/dashboard/property-owner/properties/${id}/listings`)}`}
                                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                            >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                New listing
                            </Link>
                        </div>

                   
                </div>
            </section>

            {/* ---------- Listings table ---------- */}
            <DashboardGridItem title="Listings">
                {list.length === 0 ? (
                    <EmptyState
                        message="No listings found for this property."
                        cta="Back to property"
                        link={`/dashboard/property-owner/properties/${id}`}
                    />
                ) : (
                    <DataTable
                        headers={headers}
                        data={list}
                        renderRow={renderRow}
                        renderMobileCard={renderMobileCard}
                        showPagination={false}
                        className="p-0! border-none shadow-none"
                        emptyMessage="No listings found."
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}