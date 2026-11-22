"use client";

import FormInput from "@/app/_components/FormInput";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { createUnit, updateUnit } from "@/app/_lib/action";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminHeader from "@/app/_components/AdminHeader";

const UNIT_TYPES = [ 
    {value:"APARTMENT", label:"Apartment"}, 
    {value:"ROOM", label: "Room"}, 
    {value:"OFFICE", label:"Office"}, 
    {value:"SHOP", label:"Shop"}, 
    {value:"VILLA", label:"Villa"}, 
    {value:"PARKING_SPACE", label:"Parking Space"}, 
    {value:"WAREHOUSE", label:"Warehouse"}, 
    {value:"OTHER", label:"Other"} ];

const UNIT_STATUSES = [
    { value: "AVAILABLE", label: "Available" },
    { value: "OCCUPIED", label: "Occupied" },
    { value: "MAINTENANCE", label: "Maintenance" },
    { value: "RESERVED", label: "Reserved" },
    { value: "INACTIVE", label: "Inactive" },
];

const inputClass = (hasError) =>
    `rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink ${
        hasError ? "border-error" : "border-line"
    }`;

const selectClass =
    "rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink border-line";

export default function UnitForm({
    initialData = null,
    isEditMode = false,
    isReadOnly = false,
    buildings = [],
    defaultBuildingId = "",
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const effectiveData = initialData || {};
    const unitId = effectiveData?.id || effectiveData?._id || null;
    const propertyId =
        searchParams?.get("propertyId") || effectiveData?.propertyId || null;
    const returnTo = searchParams?.get("returnTo") || null;

    const backHref =
        returnTo ||
        (isEditMode && propertyId && unitId
            ? `/dashboard/property-owner/properties/${propertyId}/units/${unitId}`
            : propertyId
              ? `/dashboard/property-owner/properties/${propertyId}/units`
              : "/dashboard/property-owner/properties");

    const [isPending, setIsPending] = useState(false);
    const buildingsList = Array.isArray(buildings) ? buildings : [];

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            unitNumber: effectiveData?.unitNumber || "",
            buildingId:
                effectiveData?.buildingId ||
                effectiveData?.building?.id ||
                defaultBuildingId ||
                "",
            floor: effectiveData?.floor ?? "",
            unitType: effectiveData?.unitType || "APARTMENT",
            bedrooms: effectiveData?.bedrooms ?? "",
            bathrooms: effectiveData?.bathrooms ?? "",
            squareMeters: effectiveData?.squareMeters ?? "",
            furnished: Boolean(effectiveData?.furnished),
            status: (effectiveData?.status || "AVAILABLE").toUpperCase(),
            monthlyRent: effectiveData?.monthlyRent ?? "",
            securityDeposit: effectiveData?.securityDeposit ?? "",
            salePrice: effectiveData?.salePrice ?? "",
            shortletPrice: effectiveData?.shortletPrice ?? "",
            description: effectiveData?.description || "",
        },
    });

    const onSubmit = (data) => {
        const payload = {
            unitNumber: (data.unitNumber || "").trim(),
            buildingId: (data.buildingId || "").trim(),
            floor: data.floor,
            unitType: data.unitType || "APARTMENT",
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            squareMeters: data.squareMeters,
            furnished: Boolean(data.furnished),
            ...(isEditMode && data.status ? { status: data.status } : {}),
            monthlyRent: data.monthlyRent,
            securityDeposit: data.securityDeposit,
            salePrice: data.salePrice,
            shortletPrice: data.shortletPrice,
            description: (data.description || "").trim(),
        };

        const actionPromise =
            isEditMode && unitId
                ? updateUnit(unitId, payload, propertyId)
                : createUnit(payload, propertyId);

        setIsPending(true);
        toast.promise(actionPromise, {
            loading: isEditMode ? "Updating unit..." : "Creating unit...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                            res?.errors?.[0]?.message ||
                            "Failed to save unit."
                    );
                }
                if (!isEditMode) reset();
                router.refresh();
                setTimeout(() => {
                    router.push(backHref);
                }, 600);
                return (
                    res?.message ||
                    (isEditMode
                        ? "Unit updated successfully!"
                        : "Unit created successfully!")
                );
            },
            error: (error) => {
                setIsPending(false);
                return `${error?.message || "Failed to save unit."}`;
            },
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader
                title={isEditMode ? "Edit Unit" : "Add Unit"}
                backHref={backHref}
            />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        {isEditMode ? "Edit Unit" : "Create Unit"}
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        {isEditMode
                            ? "Update unit specifications, pricing, or availability."
                            : "Fill in the details for the new unit under this property."}
                    </p>
                </header>

                <form
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {/* Section 1: Basic Info */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Unit Information
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Unit Number *" id="unitNumber">
                                <input
                                    disabled={isReadOnly || isEditMode}
                                    {...register("unitNumber", {
                                        required: isEditMode
                                            ? false
                                            : "Unit number is required",
                                    })}
                                    type="text"
                                    id="unitNumber"
                                    placeholder="e.g. 101 or Flat 2B"
                                    className={`${inputClass(errors.unitNumber)} disabled:opacity-60`}
                                />
                                {errors.unitNumber && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.unitNumber.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="Unit Type *" id="unitType">
                                <select
                                    disabled={isReadOnly}
                                    {...register("unitType", {
                                        required: "Unit type is required",
                                    })}
                                    id="unitType"
                                    className={selectClass}
                                >
                                    {UNIT_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </FormInput>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {buildingsList.length > 0 && (
                                <FormInput label="Building (optional)" id="buildingId">
                                    <select
                                        disabled={isReadOnly}
                                        {...register("buildingId")}
                                        id="buildingId"
                                        className={selectClass}
                                    >
                                        <option value="">No specific building</option>
                                        {buildingsList.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name || "Unnamed Building"}
                                            </option>
                                        ))}
                                    </select>
                                </FormInput>
                            )}

                            <FormInput label="Floor" id="floor">
                                <input
                                    disabled={isReadOnly}
                                    {...register("floor", {
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    id="floor"
                                    placeholder="e.g. 1"
                                    className={inputClass(errors.floor)}
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
                                        {UNIT_STATUSES.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </FormInput>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Specifications */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Specifications
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <FormInput label="Bedrooms" id="bedrooms">
                                <input
                                    disabled={isReadOnly}
                                    {...register("bedrooms", {
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    id="bedrooms"
                                    placeholder="e.g. 2"
                                    className={inputClass(errors.bedrooms)}
                                />
                            </FormInput>

                            <FormInput label="Bathrooms" id="bathrooms">
                                <input
                                    disabled={isReadOnly}
                                    {...register("bathrooms", {
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    id="bathrooms"
                                    placeholder="e.g. 2"
                                    className={inputClass(errors.bathrooms)}
                                />
                            </FormInput>

                            <FormInput label="Size (m²)" id="squareMeters">
                                <input
                                    disabled={isReadOnly}
                                    {...register("squareMeters", {
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    step="any"
                                    id="squareMeters"
                                    placeholder="e.g. 85"
                                    className={inputClass(errors.squareMeters)}
                                />
                            </FormInput>
                        </div>

                        <label
                            htmlFor="furnished"
                            className="inline-flex items-center gap-2.5 text-sm font-medium text-ink cursor-pointer select-none"
                        >
                            <input
                                disabled={isReadOnly}
                                {...register("furnished")}
                                type="checkbox"
                                id="furnished"
                                className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                            />
                            <span>Unit is furnished</span>
                        </label>
                    </div>

                    {/* Section 3: Pricing & Description */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Pricing & Description
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Monthly Rent (₦)" id="monthlyRent">
                                <input
                                    disabled={isReadOnly}
                                    {...register("monthlyRent", {
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    id="monthlyRent"
                                    placeholder="e.g. 250000"
                                    className={inputClass(errors.monthlyRent)}
                                />
                            </FormInput>

                            <FormInput label="Security Deposit (₦)" id="securityDeposit">
                                <input
                                    disabled={isReadOnly}
                                    {...register("securityDeposit", {
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    id="securityDeposit"
                                    placeholder="e.g. 100000"
                                    className={inputClass(errors.securityDeposit)}
                                />
                            </FormInput>

                            <FormInput label="Sale Price (₦, optional)" id="salePrice">
                                <input
                                    disabled={isReadOnly}
                                    {...register("salePrice", {
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    id="salePrice"
                                    placeholder="e.g. 45000000"
                                    className={inputClass(errors.salePrice)}
                                />
                            </FormInput>

                            <FormInput label="Shortlet Price (₦, optional)" id="shortletPrice">
                                <input
                                    disabled={isReadOnly}
                                    {...register("shortletPrice", {
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    id="shortletPrice"
                                    placeholder="e.g. 75000"
                                    className={inputClass(errors.shortletPrice)}
                                />
                            </FormInput>
                        </div>

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
                                rows={4}
                                className="rounded-lg border px-4 py-3 resize-none focus:outline-none border-line bg-card text-ink"
                                placeholder="Enter a short description of the unit..."
                            />
                        </div>
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
                                    {isEditMode ? "Save Changes" : "Create Unit"}
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

