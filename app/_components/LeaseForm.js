"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminHeader from "@/app/_components/AdminHeader";
import FormInput from "@/app/_components/FormInput";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { createLease, updateLease } from "@/app/_lib/action";

const BILLING_CYCLES = [
    { value: "MONTHLY", label: "Monthly" },
    { value: "QUARTERLY", label: "Quarterly" },
    { value: "YEARLY", label: "Yearly" },
    { value: "CUSTOM", label: "Custom" },
];

const LEASE_STATUSES = [
    { value: "DRAFT", label: "Draft" },
    { value: "PENDING", label: "Pending" },
    { value: "ACTIVE", label: "Active" },
    { value: "EXPIRED", label: "Expired" },
    { value: "TERMINATED", label: "Terminated" },
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

function getTenantLabel(tenant) {
    const name = [
        tenant?.firstName || tenant?.firstname,
        tenant?.lastName || tenant?.lastname,
    ]
        .filter(Boolean)
        .join(" ");
    const display = name || tenant?.name || "Tenant";
    return tenant?.email ? `${display} (${tenant.email})` : display;
}

export default function LeaseForm({
    leaseId: leaseIdProp = null,
    initialData = null,
    isEditMode = false,
    units = [],
    tenants = [],
    defaultUnitId = "",
    defaultTenantId = "",
    organizationId = "",
    propertyName = "",
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const effectiveData = initialData || {};

    const leaseId =
        leaseIdProp ||
        effectiveData?.id ||
        effectiveData?._id ||
        searchParams?.get("leaseId") ||
        searchParams?.get("id") ||
        searchParams?.get("edit") ||
        null;

    const propertyId =
        searchParams?.get("propertyId") ||
        effectiveData?.propertyId ||
        effectiveData?.unit?.propertyId ||
        null;

    const returnTo = searchParams?.get("returnTo") || null;

    const backHref =
        returnTo ||
        (isEditMode && propertyId && leaseId
            ? `/dashboard/property-owner/properties/${propertyId}/leases/${leaseId}`
            : propertyId
              ? `/dashboard/property-owner/properties/${propertyId}/leases`
              : "/dashboard/property-owner/properties");

    const unitsList = Array.isArray(units) ? units : [];
    const tenantsList = Array.isArray(tenants) ? tenants : [];

    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            unitId:
                effectiveData?.unitId ||
                effectiveData?.unit?.id ||
                defaultUnitId ||
                "",
            tenantProfileId:
                effectiveData?.tenantProfileId ||
                effectiveData?.tenantProfile?.id ||
                effectiveData?.tenant?.id ||
                defaultTenantId ||
                "",
            startDate: toDateInputValue(effectiveData?.startDate),
            endDate: toDateInputValue(effectiveData?.endDate),
            renewalDate: toDateInputValue(effectiveData?.renewalDate),
            rentAmount: effectiveData?.rentAmount ?? "",
            billingCycle: (
                effectiveData?.billingCycle || "MONTHLY"
            ).toUpperCase(),
            securityDeposit: effectiveData?.securityDeposit ?? 0,
            status: (effectiveData?.status || "DRAFT").toUpperCase(),
            terms:
                typeof effectiveData?.terms === "string"
                    ? effectiveData.terms
                    : effectiveData?.terms
                      ? JSON.stringify(effectiveData.terms)
                      : "",
        },
    });

    const watchedStartDate = watch("startDate");

    const onSubmit = (data) => {
        const startDateObj = new Date(data.startDate);
        const endDateObj = new Date(data.endDate);
        if (
            Number.isNaN(startDateObj.getTime()) ||
            Number.isNaN(endDateObj.getTime()) ||
            endDateObj <= startDateObj
        ) {
            toast.error("Lease end date must be after the start date.");
            return;
        }

        const payload = {
            unitId: (data.unitId || "").trim(),
            tenantProfileId: (data.tenantProfileId || "").trim(),
            startDate: startDateObj.toISOString(),
            endDate: endDateObj.toISOString(),
            rentAmount: data.rentAmount === "" ? 0 : Number(data.rentAmount),
            billingCycle: data.billingCycle || "MONTHLY",
            securityDeposit:
                data.securityDeposit === "" ? 0 : Number(data.securityDeposit),
            ...(data.renewalDate
                ? { renewalDate: new Date(data.renewalDate).toISOString() }
                : {}),
            ...(data.terms?.trim() ? { terms: data.terms.trim() } : {}),
            ...(isEditMode && data.status ? { status: data.status } : {}),
        };

        const actionPromise =
            isEditMode && leaseId
                ? updateLease(payload, leaseId, organizationId || null, propertyId)
                : createLease(payload, organizationId || null, propertyId);

        setIsPending(true);
        toast.promise(actionPromise, {
            loading: isEditMode ? "Updating lease..." : "Creating lease...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                            res?.errors?.[0]?.message ||
                            "Failed to save lease."
                    );
                }
                if (!isEditMode) {
                    reset();
                }
                router.refresh();
                setTimeout(() => {
                    router.push(backHref);
                }, 600);
                return (
                    res?.message ||
                    (isEditMode
                        ? "Lease updated successfully!"
                        : "Lease created successfully!")
                );
            },
            error: (error) => {
                setIsPending(false);
                return `${error?.message || "Failed to save lease."}`;
            },
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader
                title={isEditMode ? "Edit Lease" : "Add Lease"}
                backHref={backHref}
            />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        {isEditMode ? "Edit Lease Agreement" : "Create Lease Agreement"}
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        {propertyName
                            ? `${isEditMode ? "Update" : "Set up"} tenancy terms, rent schedule, and dates for ${propertyName}.`
                            : isEditMode
                              ? "Update tenancy terms, rent schedule, or lease status."
                              : "Assign a tenant to a unit and define rent, deposit, and lease dates."}
                    </p>
                </header>

                <form
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {/* Section 1: Parties & Unit */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Unit & Tenant
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {unitsList.length > 0 ? (
                                <FormInput label="Unit *" id="unitId">
                                    <select
                                        disabled={isEditMode}
                                        {...register("unitId", {
                                            required: isEditMode
                                                ? false
                                                : "Please select a unit",
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

                            {tenantsList.length > 0 ? (
                                <FormInput label="Tenant *" id="tenantProfileId">
                                    <select
                                        disabled={isEditMode}
                                        {...register("tenantProfileId", {
                                            required: isEditMode
                                                ? false
                                                : "Please select a tenant",
                                        })}
                                        id="tenantProfileId"
                                        className={`${selectClass} disabled:opacity-60`}
                                    >
                                        <option value="">Select a tenant...</option>
                                        {tenantsList.map((t) => (
                                            <option
                                                key={t.id || t._id}
                                                value={t.id || t._id}
                                            >
                                                {getTenantLabel(t)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.tenantProfileId && (
                                        <span className="-mt-2 text-xs text-error">
                                            {errors.tenantProfileId.message}
                                        </span>
                                    )}
                                </FormInput>
                            ) : (
                                <FormInput label="Tenant *" id="tenantProfileId">
                                    <div className="rounded-lg border border-amber-300/60 bg-amber-50/70 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
                                        No tenants found.{" "}
                                        <Link
                                            href="/admin/add-new-tenant"
                                            className="font-semibold underline hover:text-primary"
                                        >
                                            Add a tenant first
                                        </Link>
                                    </div>
                                </FormInput>
                            )}

                            {isEditMode && (
                                <FormInput label="Status" id="status">
                                    <select
                                        {...register("status")}
                                        id="status"
                                        className={selectClass}
                                    >
                                        {LEASE_STATUSES.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </FormInput>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Lease Term & Dates */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Lease Dates
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <FormInput label="Start Date *" id="startDate">
                                <input
                                    {...register("startDate", {
                                        required: "Start date is required",
                                    })}
                                    type="date"
                                    id="startDate"
                                    className={inputClass(errors.startDate)}
                                />
                                {errors.startDate && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.startDate.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="End Date *" id="endDate">
                                <input
                                    {...register("endDate", {
                                        required: "End date is required",
                                        validate: (val) => {
                                            if (!watchedStartDate || !val) return true;
                                            return (
                                                new Date(val) > new Date(watchedStartDate) ||
                                                "End date must be after start date"
                                            );
                                        },
                                    })}
                                    type="date"
                                    id="endDate"
                                    min={watchedStartDate || undefined}
                                    className={inputClass(errors.endDate)}
                                />
                                {errors.endDate && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.endDate.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="Renewal Date" id="renewalDate">
                                <input
                                    {...register("renewalDate")}
                                    type="date"
                                    id="renewalDate"
                                    min={watchedStartDate || undefined}
                                    className={inputClass(errors.renewalDate)}
                                />
                            </FormInput>
                        </div>
                    </div>

                    {/* Section 3: Rent & Billing */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Rent & Billing
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <FormInput label="Rent Amount (₦) *" id="rentAmount">
                                <input
                                    {...register("rentAmount", {
                                        required: "Rent amount is required",
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    step="any"
                                    id="rentAmount"
                                    placeholder="e.g. 2500000"
                                    className={inputClass(errors.rentAmount)}
                                />
                                {errors.rentAmount && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.rentAmount.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="Billing Cycle *" id="billingCycle">
                                <select
                                    {...register("billingCycle", {
                                        required: "Billing cycle is required",
                                    })}
                                    id="billingCycle"
                                    className={selectClass}
                                >
                                    {BILLING_CYCLES.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </FormInput>

                            <FormInput label="Security Deposit (₦)" id="securityDeposit">
                                <input
                                    {...register("securityDeposit", {
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    step="any"
                                    id="securityDeposit"
                                    placeholder="e.g. 250000"
                                    className={inputClass(errors.securityDeposit)}
                                />
                            </FormInput>
                        </div>
                    </div>

                    {/* Section 4: Terms */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Terms & Notes
                        </p>

                        <FormInput label="Lease Terms & Conditions" id="terms">
                            <textarea
                                {...register("terms")}
                                id="terms"
                                rows={4}
                                placeholder="Outline payment terms, maintenance responsibilities, notice period, or house rules..."
                                className={`${inputClass(errors.terms)} resize-y`}
                            />
                        </FormInput>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-line pt-6">
                        <Link
                            href={backHref}
                            className="w-full sm:w-auto text-center rounded-lg border border-line px-6 py-3 font-mono text-sm font-medium text-ink hover:bg-canvas transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-mono text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer"
                        >
                            {isPending && <SpinnerMini />}
                            <span>
                                {isPending
                                    ? isEditMode
                                        ? "Saving..."
                                        : "Creating..."
                                    : isEditMode
                                      ? "Save Changes"
                                      : "Create Lease"}
                            </span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

