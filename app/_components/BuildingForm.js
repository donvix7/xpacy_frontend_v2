"use client";

import FormInput from "@/app/_components/FormInput";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { createBuilding, updateBuilding } from "@/app/_lib/action";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminHeader from "@/app/_components/AdminHeader";

export default function BuildingForm({
    initialData = null,
    isEditMode = false,
    isReadOnly = false,
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const effectiveData = initialData || {};
    const buildingId = effectiveData?.id || effectiveData?._id || null;
    const propertyId =
        searchParams?.get("propertyId") || effectiveData?.propertyId || null;
    const returnTo = searchParams?.get("returnTo") || null;

    const backHref =
        returnTo ||
        (isEditMode && propertyId && buildingId
            ? `/dashboard/property-owner/properties/${propertyId}/buildings/${buildingId}`
            : propertyId
              ? `/dashboard/property-owner/properties/${propertyId}/buildings`
              : "/dashboard/property-owner/properties");

    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            name: effectiveData?.name || "",
            description: effectiveData?.description || "",
            totalFloors: effectiveData?.totalFloors ?? "",
        },
    });

    const onSubmit = (data) => {
        const payload = {
            name: (data.name || "").trim(),
            description: (data.description || "").trim(),
            totalFloors: data.totalFloors === "" ? 0 : Number(data.totalFloors),
        };

        const actionPromise =
            isEditMode && buildingId
                ? updateBuilding(buildingId, payload, propertyId)
                : createBuilding(payload, propertyId);

        setIsPending(true);
        toast.promise(actionPromise, {
            loading: isEditMode ? "Updating building..." : "Creating building...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                            res?.errors?.[0]?.message ||
                            "Failed to save building."
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
                        ? "Building updated successfully!"
                        : "Building created successfully!")
                );
            },
            error: (error) => {
                setIsPending(false);
                return `${error?.message || "Failed to save building."}`;
            },
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader
                title={isEditMode ? "Edit Building" : "Add Building"}
                backHref={backHref}
            />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        {isEditMode ? "Edit Building" : "Create Building"}
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        {isEditMode
                            ? "Update the name, floor count, or description for this building."
                            : "Fill in the details for the building under this property."}
                    </p>
                </header>

                <form
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <p className="text-base font-semibold text-ink border-b border-line pb-3">
                        Building Information
                    </p>
                    <div className="flex flex-col gap-6">
                        <FormInput label="Building Name" id="name">
                            <input
                                disabled={isReadOnly}
                                {...register("name", {
                                    required: "Building name is required",
                                })}
                                type="text"
                                id="name"
                                placeholder="e.g. Block A"
                                className={`rounded-lg border px-4 py-3 focus:outline-none bg-card text-ink ${
                                    errors.name ? "border-error" : "border-line"
                                }`}
                            />
                            {errors.name && (
                                <span className="-mt-2 text-xs text-error">
                                    {errors.name.message}
                                </span>
                            )}
                        </FormInput>

                        <FormInput label="Total Floors" id="totalFloors">
                            <input
                                disabled={isReadOnly}
                                {...register("totalFloors", {
                                    min: {
                                        value: 0,
                                        message: "Must be 0 or greater",
                                    },
                                    max: {
                                        value: 500,
                                        message: "Value looks too large",
                                    },
                                })}
                                type="number"
                                min="0"
                                id="totalFloors"
                                placeholder="e.g. 4"
                                className={`rounded-lg border px-4 py-3 focus:outline-none bg-card text-ink ${
                                    errors.totalFloors ? "border-error" : "border-line"
                                }`}
                            />
                            {errors.totalFloors && (
                                <span className="-mt-2 text-xs text-error">
                                    {errors.totalFloors.message}
                                </span>
                            )}
                        </FormInput>

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
                                placeholder="Enter a short description of the building..."
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
                                    {isEditMode ? "Save Changes" : "Create Building"}
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

