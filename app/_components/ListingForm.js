"use client";

import FormInput from "@/app/_components/FormInput";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { createListing, updateListing } from "@/app/_lib/action";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminHeader from "@/app/_components/AdminHeader";

const LISTING_TYPES = [
    { value: "RENT", label: "For Rent" },
    { value: "SHORTLET", label: "Shortlet" },
    { value: "SALE", label: "For Sale" },
];

const CURRENCIES = [
    { value: "NGN", label: "NGN (₦)" },
    { value: "USD", label: "USD ($)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "EUR", label: "EUR (€)" },
];

const LISTING_STATUSES = [
    { value: "PUBLISHED", label: "Published" },
    { value: "ACTIVE", label: "Active" },
    { value: "PAUSED", label: "Paused" },
    { value: "DRAFT", label: "Draft" },
    { value: "ARCHIVED", label: "Archived" },
];

const AMENITY_OPTIONS = [
    { key: "parking", label: "Parking" },
    { key: "security", label: "24/7 Security" },
    { key: "powerBackup", label: "Power Backup" },
    { key: "wifi", label: "Wi-Fi" },
    { key: "airConditioning", label: "Air Conditioning" },
    { key: "swimmingPool", label: "Swimming Pool" },
    { key: "gym", label: "Gym" },
    { key: "waterSupply", label: "Water Supply" },
];

const inputClass = (hasError) =>
    `rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink ${
        hasError ? "border-error" : "border-line"
    }`;

const selectClass =
    "rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink border-line";

function toDateInputValue(value) {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
}

export default function ListingForm({
    listingId: listingIdProp = null,
    initialData = null,
    isEditMode = false,
    isReadOnly = false,
    units = [],
    defaultUnitId = "",
    defaultLocation = "",
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const effectiveData = initialData || {};
    const listingId =
        listingIdProp ||
        effectiveData?.id ||
        effectiveData?._id ||
        searchParams?.get("listingId") ||
        searchParams?.get("id") ||
        searchParams?.get("edit") ||
        null;
    const propertyId =
        searchParams?.get("propertyId") || effectiveData?.propertyId || null;
    const returnTo = searchParams?.get("returnTo") || null;

    const backHref =
        returnTo ||
        (isEditMode && propertyId && listingId
            ? `/dashboard/property-owner/properties/${propertyId}/listings/${listingId}`
            : propertyId
              ? `/dashboard/property-owner/properties/${propertyId}/listings`
              : "/dashboard/property-owner/properties");

    const [isPending, setIsPending] = useState(false);
    const [selectedAmenities, setSelectedAmenities] = useState(() => {
        const existing = effectiveData?.amenities;
        if (existing && typeof existing === "object" && !Array.isArray(existing)) {
            return { ...existing };
        }
        return {};
    });

    const unitsList = Array.isArray(units) ? units : [];

    const toggleAmenity = (key) => {
        setSelectedAmenities((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            title: effectiveData?.title || "",
            listingType: effectiveData?.listingType || "RENT",
            unitId:
                effectiveData?.unitId ||
                effectiveData?.unit?.id ||
                defaultUnitId ||
                "",
            location: effectiveData?.location || defaultLocation || "",
            currency: effectiveData?.currency || "NGN",
            price: effectiveData?.price ?? "",
            deposit: effectiveData?.deposit ?? 0,
            availableFrom: toDateInputValue(
                effectiveData?.availability?.availableFrom
            ),
            minimumTerm: effectiveData?.availability?.minimumTerm || "",
            status: (effectiveData?.status || "ACTIVE").toUpperCase(),
            description: effectiveData?.description || "",
        },
    });

    const onSubmit = (data) => {
        const availability = {};
        if (data.availableFrom) availability.availableFrom = data.availableFrom;
        if (data.minimumTerm?.trim()) {
            availability.minimumTerm = data.minimumTerm.trim();
        }

        const amenities = Object.fromEntries(
            Object.entries(selectedAmenities).filter(([, v]) => Boolean(v))
        );

        const payload = {
            unitId: (data.unitId || "").trim(),
            title: (data.title || "").trim(),
            description: (data.description || "").trim(),
            listingType: data.listingType || "RENT",
            price: data.price === "" ? 0 : Number(data.price),
            currency: data.currency || "NGN",
            deposit: data.deposit === "" ? 0 : Number(data.deposit),
            availability,
            amenities,
            location: (data.location || "").trim(),
            ...(isEditMode && data.status ? { status: data.status } : {}),
        };

        const actionPromise =
            isEditMode && listingId
                ? updateListing(listingId, payload, propertyId)
                : createListing(payload, propertyId);

        setIsPending(true);
        toast.promise(actionPromise, {
            loading: isEditMode ? "Updating listing..." : "Creating listing...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                            res?.errors?.[0]?.message ||
                            "Failed to save listing."
                    );
                }
                if (!isEditMode) {
                    reset();
                    setSelectedAmenities({});
                }
                router.refresh();
                setTimeout(() => {
                    router.push(backHref);
                }, 600);
                return (
                    res?.message ||
                    (isEditMode
                        ? "Listing updated successfully!"
                        : "Listing created successfully!")
                );
            },
            error: (error) => {
                setIsPending(false);
                return `${error?.message || "Failed to save listing."}`;
            },
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader
                title={isEditMode ? "Edit Listing" : "Add Listing"}
                backHref={backHref}
            />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        {isEditMode ? "Edit Listing" : "Create Listing"}
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        {isEditMode
                            ? "Update listing details, pricing, availability, or amenities."
                            : "Publish a new listing for this property or one of its units."}
                    </p>
                </header>

                <form
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {/* Section 1: Listing Information */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Listing Information
                        </p>

                        <FormInput label="Listing Title *" id="title">
                            <input
                                disabled={isReadOnly}
                                {...register("title", {
                                    required: "Listing title is required",
                                })}
                                type="text"
                                id="title"
                                placeholder="e.g. Beautiful 2 Bedroom Apartment"
                                className={inputClass(errors.title)}
                            />
                            {errors.title && (
                                <span className="-mt-2 text-xs text-error">
                                    {errors.title.message}
                                </span>
                            )}
                        </FormInput>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Listing Type *" id="listingType">
                                <select
                                    disabled={isReadOnly}
                                    {...register("listingType", {
                                        required: "Listing type is required",
                                    })}
                                    id="listingType"
                                    className={selectClass}
                                >
                                    {LISTING_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </FormInput>

                            {unitsList.length > 0 ? (
                                <FormInput label="Unit *" id="unitId">
                                    <select
                                        disabled={isReadOnly || isEditMode}
                                        {...register("unitId", {
                                            required: isEditMode
                                                ? false
                                                : "Please select a unit for this listing",
                                        })}
                                        id="unitId"
                                        className={`${selectClass} disabled:opacity-60`}
                                    >
                                        <option value="">Select a unit...</option>
                                        {unitsList.map((u) => (
                                            <option
                                                key={u.id || u._id}
                                                value={u.id || u._id}
                                            >
                                                {u.unitNumber
                                                    ? `Unit ${u.unitNumber}`
                                                    : u.name || "Unit"}
                                                {u.unitType ? ` (${u.unitType})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.unitId && (
                                        <span className="-mt-2 text-xs text-error">
                                            {errors.unitId.message}
                                        </span>
                                    )}
                                </FormInput>
                            ) : (
                                <FormInput label="Unit *" id="unitId">
                                    <div className="rounded-lg border border-amber-300/60 bg-amber-50/70 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
                                        No units found for this property.{" "}
                                        {propertyId && (
                                            <Link
                                                href={`/admin/add-new-unit?propertyId=${encodeURIComponent(propertyId)}`}
                                                className="font-semibold underline hover:text-primary"
                                            >
                                                Create a unit first
                                            </Link>
                                        )}
                                    </div>
                                </FormInput>
                            )}

                            <FormInput label="Location" id="location">
                                <input
                                    disabled={isReadOnly}
                                    {...register("location")}
                                    type="text"
                                    id="location"
                                    placeholder="e.g. Lekki Phase 1, Lagos"
                                    className={inputClass(errors.location)}
                                />
                            </FormInput>

                            {isEditMode && (
                                <FormInput label="Status" id="status">
                                    <select
                                        disabled={isReadOnly}
                                        {...register("status")}
                                        id="status"
                                        className={selectClass}
                                    >
                                        {LISTING_STATUSES.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </FormInput>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Pricing & Availability */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Pricing & Availability
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Currency" id="currency">
                                <select
                                    disabled={isReadOnly}
                                    {...register("currency")}
                                    id="currency"
                                    className={selectClass}
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </FormInput>

                            <FormInput label="Price *" id="price">
                                <input
                                    disabled={isReadOnly}
                                    {...register("price", {
                                        required: "Price is required",
                                        min: {
                                            value: 0,
                                            message: "Must be 0 or greater",
                                        },
                                    })}
                                    type="number"
                                    min="0"
                                    id="price"
                                    placeholder="e.g. 500000"
                                    className={inputClass(errors.price)}
                                />
                                {errors.price && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.price.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="Deposit" id="deposit">
                                <input
                                    disabled={isReadOnly}
                                    {...register("deposit", {
                                        min: {
                                            value: 0,
                                            message: "Must be 0 or greater",
                                        },
                                    })}
                                    type="number"
                                    min="0"
                                    id="deposit"
                                    placeholder="0"
                                    className={inputClass(errors.deposit)}
                                />
                            </FormInput>

                            <FormInput label="Available From (optional)" id="availableFrom">
                                <input
                                    disabled={isReadOnly}
                                    {...register("availableFrom")}
                                    type="date"
                                    id="availableFrom"
                                    className={inputClass(errors.availableFrom)}
                                />
                            </FormInput>

                            <FormInput label="Minimum Term (optional)" id="minimumTerm">
                                <input
                                    disabled={isReadOnly}
                                    {...register("minimumTerm")}
                                    type="text"
                                    id="minimumTerm"
                                    placeholder="e.g. 12 months"
                                    className={inputClass(errors.minimumTerm)}
                                />
                            </FormInput>
                        </div>
                    </div>

                    {/* Section 3: Amenities */}
                    <div className="flex flex-col gap-4">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Amenities
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {AMENITY_OPTIONS.map((item) => {
                                const checked = Boolean(selectedAmenities[item.key]);
                                return (
                                    <label
                                        key={item.key}
                                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer select-none ${
                                            checked
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-line bg-card text-ink hover:bg-soft"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            disabled={isReadOnly}
                                            checked={checked}
                                            onChange={() => toggleAmenity(item.key)}
                                            className="h-3.5 w-3.5 rounded border-line text-primary focus:ring-primary"
                                        />
                                        <span>{item.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section 4: Description */}
                    <div className="w-full flex flex-col space-y-2 font-mono">
                        <label
                            htmlFor="description"
                            className="text-sm font-medium text-ink"
                        >
                            Description
                        </label>
                        <textarea
                            disabled={isReadOnly}
                            {...register("description")}
                            id="description"
                            rows={5}
                            className="rounded-lg border px-4 py-3 resize-none focus:outline-none border-line bg-card text-ink"
                            placeholder="Highlight key amenities, nearby landmarks, and lease terms..."
                        />
                    </div>

                    {!isReadOnly && (
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                            <Link
                                href={backHref}
                                className="xp-btn px-4 py-2 font-mono text-sm"
                            >
                                Cancel
                            </Link>
                            <button
                                disabled={isPending}
                                type="submit"
                                className="xp-btn xp-btn-fill px-5 py-2 font-mono text-sm disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span>
                                    {isEditMode ? "Save Changes" : "Publish Listing"}
                                </span>
                                {isPending && <SpinnerMini />}
                            </button>
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}
