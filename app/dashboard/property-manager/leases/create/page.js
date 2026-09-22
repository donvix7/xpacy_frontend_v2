"use client";

import FormInput from "@/app/_components/FormInput";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { url } from "@/app/_lib/constants";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaNairaSign } from "react-icons/fa6";

// Billing cycle options (enum values expected by the backend)
const billingCycleOptions = [
    { id: 1, value: "MONTHLY", label: "Monthly" },
    { id: 2, value: "QUARTERLY", label: "Quarterly" },
    { id: 3, value: "BIANNUALLY", label: "Bi-Annually" },
    { id: 4, value: "ANNUALLY", label: "Annually" },
];

// Small helper to format a Naira amount
const formatNaira = (value) => {
    const n = Number(value) || 0;
    return `₦${n.toLocaleString("en-NG")}`;
};

// Small helper to format a date string for display
const formatDate = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return value;
    }
};

// Read-only row used inside the preview modal
const PreviewRow = ({ label, value }) => (
    <div className="flex items-start justify-between gap-6 py-3 border-b border-primary-100 last:border-b-0">
        <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
            {label}
        </span>
        <span className="text-sm text-right text-black whitespace-pre-wrap break-words max-w-[60%]">
            {value || "—"}
        </span>
    </div>
);

const AddNewLeaseForm = ({
    token,
    initialData = null,
    isEditMode = false,
    isReadOnly = false,
    tenantProfiles = [],
    units = [],
}) => {
    const effectiveData = initialData || {};
    const [isPending, setIsPending] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    // Snapshot of the payload captured on preview-open, so the modal
    // always shows the same data that will be submitted.
    const [previewPayload, setPreviewPayload] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            tenantProfileId: effectiveData?.tenantProfileId || "",
            unitId: effectiveData?.unitId || "",
            startDate: effectiveData?.startDate?.slice(0, 10) || "",
            endDate: effectiveData?.endDate?.slice(0, 10) || "",
            rentAmount: effectiveData?.rentAmount ?? "",
            billingCycle: effectiveData?.billingCycle || "",
            securityDeposit: effectiveData?.securityDeposit ?? 0,
            renewalDate: effectiveData?.renewalDate?.slice(0, 10) || "",
            terms: effectiveData?.terms || "",
        },
    });

    // Build the payload from raw form data (shared by preview + submit)
    const buildPayload = (data) => ({
        tenantProfileId: (data.tenantProfileId || "").trim(),
        unitId: (data.unitId || "").trim(),
        startDate: data.startDate
            ? new Date(data.startDate).toISOString()
            : "",
        endDate: data.endDate
            ? new Date(data.endDate).toISOString()
            : "",
        rentAmount: Number(data.rentAmount) || 0,
        billingCycle: data.billingCycle,
        securityDeposit: Number(data.securityDeposit) || 0,
        renewalDate: data.renewalDate
            ? new Date(data.renewalDate).toISOString()
            : "",
        terms: (data.terms || "").trim(),
    });

    // Step 1: form submitted → validate → open preview modal
    const onPreview = (data) => {
        const payload = buildPayload(data);

        // Sanity check: end date must be after start date
        if (
            payload.startDate &&
            payload.endDate &&
            new Date(payload.endDate) <= new Date(payload.startDate)
        ) {
            return toast.error("End date must be after start date.");
        }

        setPreviewPayload(payload);
        setIsPreviewOpen(true);
    };

    // Step 2: user confirms inside modal → actually submit
    const onConfirm = () => {
        if (!previewPayload) return;

        setIsPending(true);
        toast.promise(addLease(previewPayload), {
            loading: isEditMode ? "Updating lease..." : "Creating lease...",
            success: (res) => {
                setIsPending(false);
                setIsPreviewOpen(false);
                setPreviewPayload(null);
                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                            res?.errors?.[0]?.message ||
                            "Failed to save lease."
                    );
                }
                reset();
                return isEditMode
                    ? "Lease updated successfully!"
                    : "Lease created successfully!";
            },
            error: (error) => {
                setIsPending(false);
                return `${error?.message || "Failed to save lease."}`;
            },
        });
    };

    const addLease = async (payload) => {
        try {
            const response = await axios({
                method: isEditMode ? "PUT" : "POST",
                url:
                    isEditMode && effectiveData?.id
                        ? `${url}/lease/update-lease/${effectiveData.id}`
                        : `${url}/lease/create-lease`,
                data: payload,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token?.value}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("addLease error:", error);
            throw new Error(
                error?.response?.data?.message ||
                    error.message ||
                    "An error occurred. Please try again."
            );
        }
    };

    // Resolve human-readable labels for the preview modal
    const tenantLabel = previewPayload
        ? tenantProfiles.find(
              (t) => String(t.id) === String(previewPayload.tenantProfileId)
          )?.name || previewPayload.tenantProfileId
        : "";
    const unitLabel = previewPayload
        ? units.find(
              (u) => String(u.id) === String(previewPayload.unitId)
          )?.name ||
          units.find(
              (u) => String(u.id) === String(previewPayload.unitId)
          )?.unitNumber ||
          previewPayload.unitId
        : "";
    const billingLabel = previewPayload
        ? billingCycleOptions.find(
              (b) => b.value === previewPayload.billingCycle
          )?.label || previewPayload.billingCycle
        : "";

    return (
        <div className="flex flex-col gap-12 w-[796px] mx-auto pb-12">
            <header className="flex flex-col items-center justify-center gap-4">
                <h2 className="text-3xl font-bold text-primary">
                    {isEditMode ? "Edit Lease" : "Create New Lease"}
                </h2>
                {!isEditMode && (
                    <p className="font-mono">
                        Fill in the lease details below. You'll be able to
                        preview before creating.
                    </p>
                )}
            </header>

            <form
                className="p-6 flex flex-col gap-10"
                onSubmit={handleSubmit(onPreview)}
            >
                {/* ---------- Parties ---------- */}
                <section className="flex flex-col gap-6">
                    <h3 className="text-lg">Lease Parties</h3>
                    <div className="flex flex-col gap-6">
                        <FormInput label="Tenant" id="tenantProfileId">
                            <select
                                disabled={isReadOnly}
                                {...register("tenantProfileId", {
                                    required: "Tenant is required",
                                })}
                                id="tenantProfileId"
                                className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                    errors.tenantProfileId
                                        ? "border-error"
                                        : "border-primary-200"
                                }`}
                            >
                                <option value="">Select a tenant</option>
                                {tenantProfiles.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name ||
                                            `${t.firstName || ""} ${
                                                t.lastName || ""
                                            }`}
                                    </option>
                                ))}
                            </select>
                            {errors.tenantProfileId && (
                                <span className="-mt-2 text-xs text-error">
                                    {errors.tenantProfileId.message}
                                </span>
                            )}
                        </FormInput>

                        <FormInput label="Unit" id="unitId">
                            <select
                                disabled={isReadOnly}
                                {...register("unitId", {
                                    required: "Unit is required",
                                })}
                                id="unitId"
                                className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                    errors.unitId
                                        ? "border-error"
                                        : "border-primary-200"
                                }`}
                            >
                                <option value="">Select a unit</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name || u.unitNumber || u.id}
                                    </option>
                                ))}
                            </select>
                            {errors.unitId && (
                                <span className="-mt-2 text-xs text-error">
                                    {errors.unitId.message}
                                </span>
                            )}
                        </FormInput>
                    </div>
                </section>

                {/* ---------- Terms ---------- */}
                <section className="flex flex-col gap-6">
                    <h3 className="text-lg">Lease Terms</h3>
                    <div className="flex flex-col gap-6">
                        <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                            <FormInput label="Start Date" id="startDate">
                                <input
                                    disabled={isReadOnly}
                                    {...register("startDate", {
                                        required: "Start date is required",
                                    })}
                                    type="date"
                                    id="startDate"
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                        errors.startDate
                                            ? "border-error"
                                            : "border-primary-200"
                                    }`}
                                />
                                {errors.startDate && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.startDate.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="End Date" id="endDate">
                                <input
                                    disabled={isReadOnly}
                                    {...register("endDate", {
                                        required: "End date is required",
                                    })}
                                    type="date"
                                    id="endDate"
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                        errors.endDate
                                            ? "border-error"
                                            : "border-primary-200"
                                    }`}
                                />
                                {errors.endDate && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.endDate.message}
                                    </span>
                                )}
                            </FormInput>
                        </div>

                        <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                            <FormInput label="Rent Amount" id="rentAmount">
                                <div
                                    className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                        errors.rentAmount
                                            ? "border-error"
                                            : "border-primary-200"
                                    }`}
                                >
                                    <span>
                                        <FaNairaSign />
                                    </span>
                                    <input
                                        disabled={isReadOnly}
                                        {...register("rentAmount", {
                                            required:
                                                "Rent amount is required",
                                            min: {
                                                value: 1,
                                                message:
                                                    "Rent amount must be greater than 0",
                                            },
                                        })}
                                        type="number"
                                        id="rentAmount"
                                        placeholder="Enter rent amount"
                                        className="focus:outline-none flex-1"
                                    />
                                </div>
                                {errors.rentAmount && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.rentAmount.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput
                                label="Billing Cycle"
                                id="billingCycle"
                            >
                                <select
                                    disabled={isReadOnly}
                                    {...register("billingCycle", {
                                        required: "Billing cycle is required",
                                    })}
                                    id="billingCycle"
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                        errors.billingCycle
                                            ? "border-error"
                                            : "border-primary-200"
                                    }`}
                                >
                                    <option value="">
                                        Select a billing cycle
                                    </option>
                                    {billingCycleOptions.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.billingCycle && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.billingCycle.message}
                                    </span>
                                )}
                            </FormInput>
                        </div>

                        <FormInput
                            label="Security Deposit"
                            id="securityDeposit"
                        >
                            <div
                                className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                    errors.securityDeposit
                                        ? "border-error"
                                        : "border-primary-200"
                                }`}
                            >
                                <span>
                                    <FaNairaSign />
                                </span>
                                <input
                                    disabled={isReadOnly}
                                    {...register("securityDeposit", {
                                        min: {
                                            value: 0,
                                            message:
                                                "Security deposit cannot be negative",
                                        },
                                    })}
                                    type="number"
                                    id="securityDeposit"
                                    placeholder="Enter security deposit"
                                    className="focus:outline-none flex-1"
                                />
                            </div>
                            {errors.securityDeposit && (
                                <span className="-mt-2 text-xs text-error">
                                    {errors.securityDeposit.message}
                                </span>
                            )}
                        </FormInput>
                    </div>
                </section>

                {/* ---------- Renewal & Terms ---------- */}
                <section className="flex flex-col gap-6">
                    <h3 className="text-lg">Renewal & Terms</h3>
                    <div className="flex flex-col gap-6">
                        <FormInput label="Renewal Date" id="renewalDate">
                            <input
                                disabled={isReadOnly}
                                {...register("renewalDate")}
                                type="date"
                                id="renewalDate"
                                className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                    errors.renewalDate
                                        ? "border-error"
                                        : "border-primary-200"
                                }`}
                            />
                            {errors.renewalDate && (
                                <span className="-mt-2 text-xs text-error">
                                    {errors.renewalDate.message}
                                </span>
                            )}
                        </FormInput>

                        <div className="w-full flex flex-col space-y-2 font-mono">
                            <label
                                htmlFor="terms"
                                className="text-sm text-black"
                            >
                                Lease Terms
                            </label>
                            <textarea
                                disabled={isReadOnly}
                                {...register("terms")}
                                id="terms"
                                rows={8}
                                className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 resize-none focus:outline-none border-primary-200"
                                placeholder="Enter any additional terms of the lease..."
                            />
                        </div>
                    </div>
                </section>

                {/* ---------- Submit ---------- */}
                {!isReadOnly && (
                    <div className="self-end">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-200 font-mono text-primary rounded-lg hover:bg-primary-200/80 cursor-pointer transition flex items-center gap-2"
                        >
                            <span>
                                {isEditMode ? "Preview Changes" : "Preview Lease"}
                            </span>
                        </button>
                    </div>
                )}
            </form>

            {/* ---------- Preview Modal ---------- */}
            {isPreviewOpen && previewPayload && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => !isPending && setIsPreviewOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-primary-100">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xl font-bold text-primary">
                                    {isEditMode
                                        ? "Review Lease Changes"
                                        : "Review New Lease"}
                                </h3>
                                <p className="text-xs font-mono text-gray-500">
                                    Please confirm the details below before
                                    submitting.
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setIsPreviewOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                                aria-label="Close preview"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body (scrollable) */}
                        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                            {/* Parties */}
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                                    Lease Parties
                                </span>
                                <PreviewRow
                                    label="Tenant"
                                    value={tenantLabel}
                                />
                                <PreviewRow label="Unit" value={unitLabel} />
                            </div>

                            {/* Terms */}
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                                    Lease Terms
                                </span>
                                <PreviewRow
                                    label="Start Date"
                                    value={formatDate(previewPayload.startDate)}
                                />
                                <PreviewRow
                                    label="End Date"
                                    value={formatDate(previewPayload.endDate)}
                                />
                                <PreviewRow
                                    label="Rent Amount"
                                    value={formatNaira(
                                        previewPayload.rentAmount
                                    )}
                                />
                                <PreviewRow
                                    label="Billing Cycle"
                                    value={billingLabel}
                                />
                                <PreviewRow
                                    label="Security Deposit"
                                    value={formatNaira(
                                        previewPayload.securityDeposit
                                    )}
                                />
                            </div>

                            {/* Renewal */}
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                                    Renewal & Terms
                                </span>
                                <PreviewRow
                                    label="Renewal Date"
                                    value={formatDate(
                                        previewPayload.renewalDate
                                    )}
                                />
                                <PreviewRow
                                    label="Terms"
                                    value={previewPayload.terms || "—"}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-primary-100">
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setIsPreviewOpen(false)}
                                className="px-4 py-2 font-mono text-primary rounded-lg hover:bg-primary-100/80 cursor-pointer transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={onConfirm}
                                className="px-4 py-2 bg-primary-200 font-mono text-primary rounded-lg hover:bg-primary-200/80 cursor-pointer transition flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span>
                                    {isEditMode
                                        ? "Save Changes"
                                        : "Create Lease"}
                                </span>
                                {isPending && <SpinnerMini />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddNewLeaseForm;