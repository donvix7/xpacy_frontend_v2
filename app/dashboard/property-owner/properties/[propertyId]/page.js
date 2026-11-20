import Link from "next/link";
import {
    Building2,
    ChevronLeft,
    MapPin,
    Users,
    Home,
    DollarSign,
    Flag,
    Calendar,
    DoorOpen,
    Layers,
    Hash,
    Plus,
} from "lucide-react";
import {
    getPropertyById,
    getProperty,
    getAllUnits,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import DataTable from "@/app/_components/DataTable";
import StatusChips from "@/app/_components/StatusChips";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

// ---------- Helpers ----------

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
          });
}

function statusOf(property) {
    if (!property) return "active";
    const explicit =
        property.status ||
        property.property_status ||
        property.availability_status;
    if (explicit) return String(explicit).toLowerCase();
    const flag = property.isActive ?? property.is_active;
    if (typeof flag === "boolean") {
        return flag ? "active" : "inactive";
    }
    return "active";
}

function personName(person) {
    const u = person.user || person.ownerProfile || person.profile || {};
    return (
        [
            u.firstName || u.firstname || person.firstName || person.firstname,
            u.lastName || u.lastname || person.lastName || person.lastname,
        ]
            .filter(Boolean)
            .join(" ") ||
        person.name ||
        u.name ||
        u.username ||
        person.username ||
        person.email ||
        u.email ||
        "Member"
    );
}

function normalizeProperty(p) {
    if (!p) return null;
    const name =
        p.name || p.property_name || p.title || "Untitled Property";
    const status = statusOf(p);
    const propertyType =
        p.propertyType || p.property_type || "Residential";
    const address = p.address || "";
    const city = p.city || "";
    const state = p.state || p.province || "";
    const country = p.country || "";
    const postalCode =
        p.postalCode || p.postal_code || p.zipCode || "";
    const yearBuilt = p.yearBuilt ?? p.year_built ?? null;
    const totalFloors = p.totalFloors ?? p.total_floors ?? null;
    const totalUnits =
        p.totalUnits ?? p.total_units ?? p._count?.units ?? null;
    const description =
        p.description || p.property_description || "";
    const rawPrice = p.price ?? p.property_price ?? null;
    const price =
        rawPrice !== null && !Number.isNaN(Number(rawPrice))
            ? Number(rawPrice)
            : null;
    const createdAt = p.createdAt || p.created_at || p.date_added || null;
    const media =
        Array.isArray(p.media) && p.media.length > 0
            ? p.media
            : Array.isArray(p.images)
              ? p.images.map((img) =>
                    typeof img === "string"
                        ? { url: img }
                        : { url: img.image_url || img.url }
                )
              : [];
    const managers = Array.isArray(p.managers) ? p.managers : [];
    const owners = Array.isArray(p.owners) ? p.owners : [];

    return {
        ...p,
        name,
        status,
        propertyType,
        address,
        city,
        state,
        country,
        postalCode,
        yearBuilt,
        totalFloors,
        totalUnits,
        description,
        price,
        createdAt,
        media,
        managers,
        owners,
    };
}

function buildDetailRows(property) {
    return [
        { label: "Property Name", value: property.name, icon: Building2 },
        { label: "Property Type", value: property.propertyType, icon: Building2 },
        { label: "Address", value: property.address, icon: Home },
        { label: "City", value: property.city, icon: MapPin },
        { label: "State / Province", value: property.state, icon: MapPin },
        { label: "Country", value: property.country, icon: Flag },
        { label: "Postal Code", value: property.postalCode, icon: Hash },
        {
            label: "Year Built",
            value: property.yearBuilt ? String(property.yearBuilt) : null,
            icon: Calendar,
        },
        {
            label: "Total Floors",
            value:
                property.totalFloors !== null && property.totalFloors !== undefined
                    ? String(property.totalFloors)
                    : null,
            icon: Layers,
        },
        {
            label: "Total Units",
            value:
                property.totalUnits !== null && property.totalUnits !== undefined
                    ? String(property.totalUnits)
                    : null,
            icon: DoorOpen,
        },
        {
            label: "Price / Rent",
            value:
                property.price !== null && property.price !== undefined
                    ? `₦${Number(property.price).toLocaleString()}`
                    : null,
            icon: DollarSign,
        },
        {
            label: "Status",
            value:
                property.status.charAt(0).toUpperCase() +
                property.status.slice(1).toLowerCase(),
            icon: Building2,
        },
        {
            label: "Created",
            value: formatDate(property.createdAt),
            icon: Calendar,
        },
    ].filter(
        ({ value }) =>
            value !== undefined && value !== null && value !== "" && value !== "—"
    );
}

// ---------- Page ----------

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const propertyId = resolvedParams?.propertyId || resolvedParams?.id;
    try {
        let property = null;
        try {
            const res = await getPropertyById(propertyId);
            property = res?.data || res?.property || res;
        } catch {
            const res = await getProperty(propertyId);
            property = res?.property || res?.data || res;
        }
        return {
            title: property?.name || property?.property_name || "Property",
            description:
                property?.description || property?.property_description || "",
        };
    } catch {
        return {
            title: "Property",
            description: "",
        };
    }
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const rawId = resolvedParams?.propertyId || resolvedParams?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || typeof id !== "string" || !id.trim()) {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                <Link
                    href="/dashboard/property-owner/properties"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to properties
                </Link>

                <EmptyState
                    icon={Building2}
                    title="Invalid property id"
                    message="The property id in the URL is missing or malformed."
                />
            </div>
        );
    }

    const propId = id.trim();

    const results = await Promise.allSettled([
        getPropertyById(propId).catch(() => getProperty(propId)),
        getAllUnits(propId).catch(() => []),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const propResult =
        results[0].status === "fulfilled" ? results[0].value : null;
    const rawProperty =
        propResult?.data || propResult?.property || propResult;
    const unitsRes =
        results[1].status === "fulfilled" ? results[1].value : [];
    const unitsList = Array.isArray(unitsRes)
        ? unitsRes
        : Array.isArray(unitsRes?.data)
          ? unitsRes.data
          : [];

    if (!rawProperty || typeof rawProperty !== "object" || Array.isArray(rawProperty)) {
        return (
            <div className="space-y-6 p-2 sm:p-4">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
                <Link
                    href="/dashboard/property-owner/properties"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
                >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Back to properties
                </Link>

                <EmptyState
                    icon={Building2}
                    title="Property not found"
                    message={`No property was found for id "${propId}". This property may have been removed or the link may be incorrect.`}
                />
            </div>
        );
    }

    const property = normalizeProperty(rawProperty);
    const details = buildDetailRows(property);

    const peopleList = [
        ...property.managers.map((m) => ({
            ...m,
            roleType: m.role || "Manager",
        })),
        ...property.owners.map((o) => ({
            ...o,
            roleType: o.role || "Owner",
        })),
    ];

    const totalUnitsCount =
        property.totalUnits ?? unitsList.length ?? 0;

    const heroStats = [
        {
            label: "Units",
            value: totalUnitsCount,
            hint: "Total units",
        },
        {
            label: "Type",
            value: property.propertyType,
            hint: "Classification",
        },
        {
            label: "Status",
            value:
                property.status.charAt(0).toUpperCase() +
                property.status.slice(1).toLowerCase(),
            hint: "Availability state",
        },
        {
            label: property.yearBuilt ? "Year Built" : "Created",
            value: property.yearBuilt
                ? String(property.yearBuilt)
                : formatDate(property.createdAt),
            hint: property.yearBuilt ? "Construction year" : "Registration date",
        },
    ];

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const locationText = [
        property.address,
        property.city,
        property.state,
        property.country,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href="/dashboard/property-owner/properties"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to properties
            </Link>

            {/* ---------- Hero ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Property profile · {today}
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                {property.name}
                            </h1>
                            <p className="mt-2 max-w-xl break-all text-[13.5px] leading-relaxed text-side-mute">
                                {locationText || "No address provided"}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusChips status={property.status} />
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
                                <dd className="mt-1 truncate text-[18px] font-semibold leading-tight tracking-[-0.3px] text-white sm:text-[20px]">
                                    {stat.value}
                                </dd>
                                <p className="mt-1.5 truncate text-[11.5px] text-side-mute">
                                    {stat.hint}
                                </p>
                            </div>
                        ))}
                    </dl>

                    {/* ---------- Action row ---------- */}
                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
                        <Link
                            href="/dashboard/property-owner/properties"
                            className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                            All Properties
                        </Link>
                        <Link
                            href="/dashboard/property-owner/properties/new"
                            className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3.5 py-2 text-[12.5px] font-semibold text-side transition-colors hover:bg-white"
                        >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            Add property
                        </Link>
                    </div>
                </div>
            </section>

            {/* ---------- Property information ---------- */}
            <DashboardGridItem title="Property information">
                <div className="grid grid-cols-1 gap-3 container sm:grid-cols-2">
                    {details.map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="rounded-xl border border-gray-100 bg-white p-3 dark:border-line dark:bg-card"
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50">
                                    <Icon
                                        className="h-3.5 w-3.5 text-primary"
                                        aria-hidden="true"
                                    />
                                </div>
                                <dt className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-500 dark:text-mute">
                                    {label}
                                </dt>
                            </div>
                            <dd className="mt-2 break-words text-[13px] capitalize text-ink">
                                {value}
                            </dd>
                        </div>
                    ))}
                </div>
            </DashboardGridItem>

            {/* ---------- Description ---------- */}
            {property.description && (
                <DashboardGridItem title="Description">
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {property.description}
                    </p>
                </DashboardGridItem>
            )}

            {/* ---------- Units ---------- */}
            <DashboardGridItem title="Units">
                {unitsList.length === 0 ? (
                    <EmptyState
                        icon={DoorOpen}
                        title="No units"
                        message={`No units found for ${property.name || "this property"}.`}
                    />
                ) : (
                    <DataTable
                        data={unitsList}
                        showPagination={unitsList.length > 10}
                        pageSize={10}
                        className="p-0 border-none shadow-none"
                        rowKey={(unit, index) => unit.id ?? unit._id ?? index}
                        columns={[
                            {
                                heading: "Unit",
                                render: (unit, index) => (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-soft text-ink">
                                            <DoorOpen className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-ink">
                                                {unit.unitNumber || unit.name || `Unit ${index + 1}`}
                                            </p>
                                            {unit.floorNumber !== undefined &&
                                                unit.floorNumber !== null && (
                                                    <p className="text-xs text-mute">
                                                        Floor {unit.floorNumber}
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                heading: "Type / Bedrooms",
                                className: "text-xs text-mute",
                                render: (unit) =>
                                    unit.unitType ||
                                    (unit.bedrooms
                                        ? `${unit.bedrooms} Bed`
                                        : "—"),
                            },
                            {
                                heading: "Price / Rent",
                                render: (unit) => {
                                    const amount =
                                        unit.rentAmount ??
                                        unit.price ??
                                        unit.rent;
                                    return amount !== null &&
                                        amount !== undefined
                                        ? `₦${Number(amount).toLocaleString()}`
                                        : "—";
                                },
                            },
                            {
                                heading: "Status",
                                center: true,
                                render: (unit) => (
                                    <div className="flex justify-center">
                                        <StatusChips
                                            status={
                                                unit.status ||
                                                unit.availability_status ||
                                                "available"
                                            }
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                )}
            </DashboardGridItem>

            {/* ---------- Property members & managers ---------- */}
            <DashboardGridItem title="Property members & managers">
                {peopleList.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No members"
                        message={`No members or managers found for ${property.name || "this property"}.`}
                    />
                ) : (
                    <DataTable
                        data={peopleList}
                        showPagination={peopleList.length > 10}
                        pageSize={10}
                        className="p-0 border-none shadow-none"
                        rowKey={(person, index) =>
                            person.id ?? person.userId ?? index
                        }
                        columns={[
                            {
                                heading: "Member",
                                render: (person) => {
                                    const name = personName(person);
                                    const email =
                                        person.user?.email || person.email;
                                    return (
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-semibold uppercase text-ink">
                                                {name.charAt(0) || "M"}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium capitalize text-ink">
                                                    {name}
                                                </p>
                                                {email && (
                                                    <p className="truncate text-xs text-mute">
                                                        {email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                },
                            },
                            {
                                heading: "Role",
                                className: "capitalize text-mute",
                                render: (person) =>
                                    person.roleType?.replace(/_/g, " ") ??
                                    "Member",
                            },
                            {
                                heading: "Status",
                                center: true,
                                render: (person) => (
                                    <div className="flex justify-center">
                                        <StatusChips
                                            status={
                                                person.status ||
                                                (person.isActive === false
                                                    ? "inactive"
                                                    : "active")
                                            }
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                )}
            </DashboardGridItem>

            {/* ---------- Media ---------- */}
            {property.media.length > 0 && (
                <DashboardGridItem title="Media">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {property.media.map((item, i) => {
                            const url =
                                item?.url ||
                                (typeof item === "string" ? item : null);
                            if (!url) return null;
                            return (
                                <div
                                    key={item.id || url || i}
                                    className="aspect-video overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                                >
                                    <img
                                        src={url}
                                        alt={`${property.name} media ${i + 1}`}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </DashboardGridItem>
            )}
        </div>
    );
}
