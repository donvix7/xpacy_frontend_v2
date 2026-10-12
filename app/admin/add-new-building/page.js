"use client";

import FormInput from "@/app/_components/FormInput";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { createBuilding } from "@/app/_lib/action";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

const CreateBuildingForm = ({
    initialData = null,
    isEditMode = false,
    isReadOnly = false,
}) => {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("propertyId") || null;

    const effectiveData = initialData || {};
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

        setIsPending(true);
        toast.promise(createBuilding(payload, propertyId), {
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
                return isEditMode
                    ? "Building updated successfully!"
                    : "Building created successfully!";
            },
            error: (error) => {
                setIsPending(false);
                return `${error?.message || "Failed to save building."}`;
            },
        });
    };

    const backHref = propertyId
        ? `/dashboard/user/my-properties/${propertyId}/buildings`
        : "/admin";

    return (
        <div className="flex flex-col gap-12 w-[796px] mx-auto pb-12">
            <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary self-start"
            >
                <ChevronLeft className="h-4 w-4" />
                Back to buildings
            </Link>

            <header className="flex flex-col items-center justify-center gap-4">
                <p className="text-3xl font-bold text-primary">
                    {isEditMode ? "Edit Building" : "Create Building"}
                </p>
                {!isEditMode && (
                    <p className="font-mono">
                        Fill in the correct detailed information for the new building.
                    </p>
                )}
            </header>

            <form
                className="p-6 flex flex-col gap-8"
                onSubmit={handleSubmit(onSubmit)}
            >
                <p className="text-lg">Building Information</p>
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
                            className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                errors.name
                                    ? "border-error"
                                    : "border-primary-200"
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
                            className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                errors.totalFloors
                                    ? "border-error"
                                    : "border-primary-200"
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
                            className="text-sm text-black"
                        >
                            Description
                        </label>
                        <textarea
                            disabled={isReadOnly}
                            {...register("description")}
                            id="description"
                            rows={5}
                            className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 resize-none focus:outline-none border-primary-200"
                            placeholder="Enter a short description of the building..."
                        />
                    </div>
                </div>

                {/* ---------- Actions ---------- */}
                {!isReadOnly && (
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href={backHref}
                            className="bg-white px-4 py-2 font-mono text-primary rounded-lg hover:bg-primary-100/80 cursor-pointer transition flex items-center gap-2"
                        >
                            Cancel
                        </Link>
                        <button
                            disabled={isPending}
                            type="submit"
                            className="px-4 py-2 bg-primary-200 font-mono text-primary rounded-lg hover:bg-primary-200/80 cursor-pointer transition flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span>
                                {isEditMode ? "Save Changes" : "Create Building"}
                            </span>
                            {isPending && <SpinnerMini />}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default CreateBuildingForm;