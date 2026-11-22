"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Wrench } from "lucide-react";
import AdminHeader from "@/app/_components/AdminHeader";
import FormInput from "@/app/_components/FormInput";
import SpinnerMini from "@/app/_components/SpinnerMini";
import {
    createMaintenanceRequest,
    updateMaintenanceRequest,
} from "@/app/_lib/action";

const PRIORITIES = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
];

const STATUSES = [
    { value: "OPEN", label: "Open" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "RESOLVED", label: "Resolved" },
    { value: "CLOSED", label: "Closed" },
    { value: "CANCELLED", label: "Cancelled" },
];

const CATEGORIES = [
    { value: "PLUMBING", label: "Plumbing" },
    { value: "ELECTRICAL", label: "Electrical" },
    { value: "HVAC", label: "HVAC / Air Conditioning" },
    { value: "STRUCTURAL", label: "Structural" },
    { value: "APPLIANCE", label: "Appliance" },
    { value: "PEST_CONTROL", label: "Pest Control" },
    { value: "CLEANING", label: "Cleaning" },
    { value: "SECURITY", label: "Security" },
    { value: "GENERAL", label: "General Maintenance" },
    { value: "OTHER", label: "Other" },
];

const inputClass = (hasError) =>
    `rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink ${
        hasError ? "border-error" : "border-line"
    }`;

const selectClass =
    "rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink border-line";

function toDateTimeLocal(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}`;
}

export default function MaintenanceForm({
    maintenanceId: maintenanceIdProp = null,
    initialData = null,
    isEditMode = false,
    propertyId = "",
    propertyName = "",
    units = [],
    buildings = [],
    members = [],
    defaultUnitId = "",
    defaultBuildingId = "",
    defaultReturnTo = "",
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const effectiveData = initialData || {};

    const maintenanceId =
        maintenanceIdProp ||
        effectiveData?.id ||
        effectiveData?._id ||
        searchParams?.get("maintenanceId") ||
        null;

    const resolvedPropertyId =
        propertyId ||
        effectiveData?.propertyId ||
        searchParams?.get("propertyId") ||
        "";
    const rawReturnTo = defaultReturnTo || searchParams?.get("returnTo") || "";
    const backHref =
        rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
            ? rawReturnTo
            : resolvedPropertyId
              ? `/dashboard/property-owner/properties/${resolvedPropertyId}`
              : "/dashboard/admin/maintenance";

    const unitsList = Array.isArray(units) ? units : [];
    const buildingsList = Array.isArray(buildings) ? buildings : [];
    const membersList = Array.isArray(members) ? members : [];

    const initialAssignedTo =
        typeof effectiveData?.assignedTo === "string"
            ? effectiveData.assignedTo
            : effectiveData?.assignedTo?.id ||
              effectiveData?.assignedToId ||
              "";

    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            title: effectiveData?.title || "",
            category: (effectiveData?.category || "GENERAL").toUpperCase(),
            priority: (effectiveData?.priority || "MEDIUM").toUpperCase(),
            status: (effectiveData?.status || "OPEN").toUpperCase(),
            assignedTo: initialAssignedTo,
            buildingId:
                effectiveData?.buildingId ||
                effectiveData?.building?.id ||
                defaultBuildingId ||
                "",
            unitId:
                effectiveData?.unitId ||
                effectiveData?.unit?.id ||
                defaultUnitId ||
                "",
            estimatedCost: effectiveData?.estimatedCost ?? "",
            actualCost: effectiveData?.actualCost ?? "",
            scheduledAt: toDateTimeLocal(effectiveData?.scheduledAt),
            completedAt: toDateTimeLocal(
                effectiveData?.completedAt || effectiveData?.resolvedAt
            ),
            description: effectiveData?.description || "",
        },
    });

    const onSubmit = (data) => {
        if (isPending) return;
        if (!isEditMode && !resolvedPropertyId) {
            toast.error("Property ID is missing. Open this form from a property.");
            return;
        }

        const scheduledAt = data.scheduledAt
            ? new Date(data.scheduledAt).toISOString()
            : undefined;
        const completedAt = data.completedAt
            ? new Date(data.completedAt).toISOString()
            : undefined;

        const payload = isEditMode
            ? {
                  title: (data.title || "").trim(),
                  description: (data.description || "").trim(),
                  priority: data.priority || "MEDIUM",
                  status: data.status || "OPEN",
                  ...(data.assignedTo?.trim()
                      ? { assignedTo: data.assignedTo.trim() }
                      : {}),
                  ...(data.estimatedCost !== "" && data.estimatedCost != null
                      ? { estimatedCost: Number(data.estimatedCost) }
                      : {}),
                  ...(data.actualCost !== "" && data.actualCost != null
                      ? { actualCost: Number(data.actualCost) }
                      : {}),
                  ...(scheduledAt ? { scheduledAt } : {}),
                  ...(completedAt ? { completedAt } : {}),
              }
            : {
                  title: (data.title || "").trim(),
                  description: (data.description || "").trim(),
                  category: data.category || "GENERAL",
                  priority: data.priority || "MEDIUM",
                  ...(data.buildingId ? { buildingId: data.buildingId } : {}),
                  ...(data.unitId ? { unitId: data.unitId } : {}),
                  ...(data.estimatedCost !== "" && data.estimatedCost != null
                      ? { estimatedCost: Number(data.estimatedCost) }
                      : {}),
                  ...(scheduledAt ? { scheduledAt } : {}),
              };

        const actionPromise =
            isEditMode && maintenanceId
                ? updateMaintenanceRequest(payload, maintenanceId, resolvedPropertyId || null)
                : createMaintenanceRequest(payload, resolvedPropertyId);

        setIsPending(true);
        toast.promise(actionPromise, {
            loading: isEditMode
                ? "Updating maintenance request..."
                : "Creating maintenance request...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(
                        res?.message || "Failed to save maintenance request."
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
                        ? "Maintenance request updated successfully!"
                        : "Maintenance request created successfully!")
                );
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to save maintenance request.";
            },
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader
                title={
                    isEditMode
                        ? "Edit Maintenance Request"
                        : "New Maintenance Request"
                }
                backHref={backHref}
            />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        {isEditMode
                            ? "Edit Maintenance Request"
                            : "Create Maintenance Request"}
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        {isEditMode
                            ? "Update request details, status, priority, costs, or schedule."
                            : propertyName
                              ? `Log a maintenance issue or work order for ${propertyName}.`
                              : "Log a new maintenance issue or work order for this property."}
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                >
                    {/* Section 1: Request Details */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Request Details
                        </p>

                        <FormInput label="Title *" id="title">
                            <input
                                {...register("title", {
                                    required: "Title is required",
                                })}
                                type="text"
                                id="title"
                                placeholder="e.g. Leaking kitchen pipe in Unit 2B"
                                className={inputClass(errors.title)}
                            />
                            {errors.title && (
                                <span className="-mt-2 text-xs text-error">
                                    {errors.title.message}
                                </span>
                            )}
                        </FormInput>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {!isEditMode ? (
                                <FormInput label="Category *" id="category">
                                    <select
                                        {...register("category", {
                                            required: "Category is required",
                                        })}
                                        id="category"
                                        className={selectClass}
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </FormInput>
                            ) : (
                                <FormInput label="Status *" id="status">
                                    <select
                                        {...register("status")}
                                        id="status"
                                        className={selectClass}
                                    >
                                        {STATUSES.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </FormInput>
                            )}

                            <FormInput label="Priority *" id="priority">
                                <select
                                    {...register("priority", {
                                        required: "Priority is required",
                                    })}
                                    id="priority"
                                    className={selectClass}
                                >
                                    {PRIORITIES.map((p) => (
                                        <option key={p.value} value={p.value}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </FormInput>
                        </div>

                        {isEditMode && (
                            <FormInput label="Assigned To" id="assignedTo">
                                {membersList.length > 0 ? (
                                    <select
                                        {...register("assignedTo")}
                                        id="assignedTo"
                                        className={selectClass}
                                    >
                                        <option value="">Unassigned</option>
                                        {membersList.map((m, idx) => {
                                            const u = m?.user || m?.profile || m || {};
                                            const uid = String(
                                                m?.userId || u?.id || m?.id || ""
                                            );
                                            if (!uid) return null;
                                            const name =
                                                [
                                                    u.firstName || u.firstname,
                                                    u.lastName || u.lastname,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ") ||
                                                u.name ||
                                                u.email ||
                                                "Member";
                                            return (
                                                <option key={`${uid}-${idx}`} value={uid}>
                                                    {name}
                                                    {u.email && name !== u.email
                                                        ? ` (${u.email})`
                                                        : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                ) : (
                                    <input
                                        {...register("assignedTo")}
                                        type="text"
                                        id="assignedTo"
                                        placeholder="Staff user ID (optional)"
                                        className={`font-mono ${inputClass(errors.assignedTo)}`}
                                    />
                                )}
                            </FormInput>
                        )}

                        <FormInput label="Description" id="description">
                            <textarea
                                {...register("description")}
                                id="description"
                                rows={4}
                                placeholder="Describe the issue, affected area, and any helpful context for the technician..."
                                className={`${inputClass(errors.description)} resize-y`}
                            />
                        </FormInput>
                    </div>

                    {/* Section 2: Location (Create mode only) */}
                    {!isEditMode &&
                        (buildingsList.length > 0 || unitsList.length > 0) && (
                            <div className="flex flex-col gap-6">
                                <p className="text-base font-semibold text-ink border-b border-line pb-3">
                                    Affected Building / Unit (Optional)
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {buildingsList.length > 0 && (
                                        <FormInput label="Building" id="buildingId">
                                            <select
                                                {...register("buildingId")}
                                                id="buildingId"
                                                className={selectClass}
                                            >
                                                <option value="">
                                                    All / Entire property
                                                </option>
                                                {buildingsList.map((b) => (
                                                    <option
                                                        key={b.id || b._id}
                                                        value={b.id || b._id}
                                                    >
                                                        {b.name ||
                                                            b.buildingName ||
                                                            "Building"}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormInput>
                                    )}

                                    {unitsList.length > 0 && (
                                        <FormInput label="Unit" id="unitId">
                                            <select
                                                {...register("unitId")}
                                                id="unitId"
                                                className={selectClass}
                                            >
                                                <option value="">
                                                    None / Common area
                                                </option>
                                                {unitsList.map((u) => (
                                                    <option
                                                        key={u.id || u._id}
                                                        value={u.id || u._id}
                                                    >
                                                        {u.unitNumber
                                                            ? `Unit ${u.unitNumber}`
                                                            : u.name || "Unit"}
                                                        {u.unitType
                                                            ? ` (${u.unitType})`
                                                            : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormInput>
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Section 3: Cost & Schedule */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Cost & Schedule (Optional)
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Estimated Cost (₦)" id="estimatedCost">
                                <input
                                    {...register("estimatedCost", {
                                        min: {
                                            value: 0,
                                            message: "Must be 0 or greater",
                                        },
                                    })}
                                    type="number"
                                    min="0"
                                    step="any"
                                    id="estimatedCost"
                                    placeholder="e.g. 25000"
                                    className={inputClass(errors.estimatedCost)}
                                />
                                {errors.estimatedCost && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.estimatedCost.message}
                                    </span>
                                )}
                            </FormInput>

                            {isEditMode && (
                                <FormInput label="Actual Cost (₦)" id="actualCost">
                                    <input
                                        {...register("actualCost", {
                                            min: {
                                                value: 0,
                                                message: "Must be 0 or greater",
                                            },
                                        })}
                                        type="number"
                                        min="0"
                                        step="any"
                                        id="actualCost"
                                        placeholder="e.g. 22000"
                                        className={inputClass(errors.actualCost)}
                                    />
                                </FormInput>
                            )}

                            <FormInput label="Scheduled Date & Time" id="scheduledAt">
                                <input
                                    {...register("scheduledAt")}
                                    type="datetime-local"
                                    id="scheduledAt"
                                    className={inputClass(errors.scheduledAt)}
                                />
                            </FormInput>

                            {isEditMode && (
                                <FormInput
                                    label="Completed Date & Time"
                                    id="completedAt"
                                >
                                    <input
                                        {...register("completedAt")}
                                        type="datetime-local"
                                        id="completedAt"
                                        className={inputClass(errors.completedAt)}
                                    />
                                </FormInput>
                            )}
                        </div>
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
                            {isPending ? (
                                <SpinnerMini />
                            ) : (
                                <Wrench className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span>
                                {isPending
                                    ? isEditMode
                                        ? "Saving..."
                                        : "Submitting..."
                                    : isEditMode
                                      ? "Save Changes"
                                      : "Create Maintenance Request"}
                            </span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
