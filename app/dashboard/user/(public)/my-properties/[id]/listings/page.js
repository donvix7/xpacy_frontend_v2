import Link from "next/link";
import { cookies } from "next/headers";
import { Building2, CheckCircle2, Clock, XCircle, ChevronLeft } from "lucide-react";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import SummaryCards from "@/app/_components/SummaryCards";
import StatusChips from "@/app/_components/StatusChips";
import { getListingById } from "@/app/_lib/data-services";
import { formatCurrency } from "@/app/_lib/utils";

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
        const value = key.split(".").reduce((object, part) => object?.[part], listing);
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
        `Listing ${index + 1}`
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
        null
    );

export default async function UserListingsPage({ params }) {
    // Next.js 15: params is a Promise. On Next.js 14, drop the `await`.
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Adjust this call/signature to match your data service.
    const listings = await getListingById(id, token);
    const list = Array.isArray(listings)
        ? listings
        : listings && typeof listings === "object"
            ? [listings]
            : [];

    const normalizedStatus = (listing) => statusOf(listing).toLowerCase();

    const activeCount = list.filter((l) =>
        ["active", "published", "available", "confirmed"].includes(normalizedStatus(l))
    ).length;
    const pendingCount = list.filter((l) =>
        ["pending", "draft", "review"].includes(normalizedStatus(l))
    ).length;
    const inactiveCount = list.filter((l) =>
        ["inactive", "unpublished", "archived", "closed", "sold", "rented", "cancelled", "canceled"].includes(
            normalizedStatus(l)
        )
    ).length;

    const summaryCards = [
        { label: "All listings", value: list.length, color: "bg-primary-100", icon: <Building2 className="h-5 w-5 text-primary-700" /> },
        { label: "Active", value: activeCount, color: "bg-green-100", icon: <CheckCircle2 className="h-5 w-5 text-green-700" /> },
        { label: "Pending", value: pendingCount, color: "bg-amber-100", icon: <Clock className="h-5 w-5 text-amber-700" /> },
        { label: "Inactive", value: inactiveCount, color: "bg-gray-100", icon: <XCircle className="h-5 w-5 text-gray-600" /> },
    ];

    const renderRow = (listing, index) => {
        const listingId = listing.id || listing._id;
        const detailsHref = `/dashboard/user/my-properties/${id}/listings/${listingId}`;

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
                        <span className="text-xs text-gray-500">{unitDisplay(listing)}</span>
                    </div>
                </td>
                <td className="p-4 text-gray-600">{locationDisplay(listing)}</td>
                <td className="p-4 text-center font-bold text-gray-900">
                    {priceAmount(listing) === null ? "—" : formatCurrency(priceAmount(listing))}
                </td>
                <td className="p-4 text-center">
                    <div className="flex justify-center">
                        <StatusChips status={statusOf(listing)} />
                    </div>
                </td>
                <td className="p-4 text-right">
                    <Link
                        href={detailsHref}
                        className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-100"
                    >
                        View details
                    </Link>
                </td>
            </tr>
        );
    };

    const renderMobileCard = (listing, index) => {
        const listingId = listing.id || listing._id;
        const detailsHref = `/dashboard/user/my-properties/${id}/listings/${listingId}`;

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
                        <dd className="mt-1 text-gray-800">{locationDisplay(listing)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-gray-500">Rent</dt>
                        <dd className="mt-1 font-bold text-gray-900">
                            {priceAmount(listing) === null ? "—" : formatCurrency(priceAmount(listing))}
                        </dd>
                    </div>
                    {valueFrom(listing, ["billingCycle", "billing_cycle"], "") && (
                        <div>
                            <dt className="text-xs text-gray-500">Billing cycle</dt>
                            <dd className="mt-1 capitalize text-gray-800">
                                {String(valueFrom(listing, ["billingCycle", "billing_cycle"])).toLowerCase()}
                            </dd>
                        </div>
                    )}
                </dl>

                <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
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
        <div className="space-y-6 p-2 sm:p-4">
            <div>
                <Link
                    href={`/dashboard/user/my-properties/${id}`}
                    className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to property
                </Link>
                <p className="text-[28px] font-bold text-primary lg:text-4xl">My Listings</p>
                <p className="mt-1 text-sm text-gray-500">
                    View and manage listings associated with this property.
                </p>
            </div>

            <SummaryCards cards={summaryCards} title="Listing summary" />

            <DashboardGridItem title="Listings">
                {list.length === 0 ? (
                    <EmptyState
                        message="No listings found for this property."
                        cta="Back to property"
                        link={`/dashboard/user/my-properties/${id}`}
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