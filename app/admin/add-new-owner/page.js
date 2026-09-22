"use client";

import FormInput from "@/app/_components/FormInput";
import ProgressBar from "@/app/_components/ProgressBar";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import axios from "axios";
import toast from "react-hot-toast";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { url } from "@/app/_lib/constants";
import { addOwner } from "@/app/_lib/action";

// 3-step flow for owner creation
const progressBarSteps = [
    { step: 1, label: "Personal Info" },
    { step: 2, label: "Contact" },
    { step: 3, label: "Company" },
];

const AddNewOwnerForm = ({
    token,
    initialData = null,
    isEditMode = false,
    isReadOnly = false,
}) => {
    const effectiveData = initialData || {};
    const [activeStep, setActiveStep] = useState(1);
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            firstName: effectiveData?.firstName || "",
            lastName: effectiveData?.lastName || "",
            email: effectiveData?.email || "",
            phone: effectiveData?.phone || "",
            companyName: effectiveData?.companyName || "",
            address: effectiveData?.address || "",
            notes: effectiveData?.notes || "",
        },
    });

    const onSubmit = (data) => {
        const payload = {
            firstName: (data.firstName || "").trim(),
            lastName: (data.lastName || "").trim(),
            email: (data.email || "").trim(),
            phone: (data.phone || "").trim(),
            companyName: (data.companyName || "").trim(),
            address: (data.address || "").trim(),
            notes: (data.notes || "").trim(),
        };

        setIsPending(true);
        toast.promise(addOwner(payload), {
            loading: isEditMode ? "Updating owner..." : "Adding new owner...",
            success: (res) => {
                setIsPending(false);
                setActiveStep(1);
                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                        res?.errors?.[0]?.message ||
                        "Failed to save owner."
                    );
                }
                reset();
                return isEditMode
                    ? "Owner updated successfully!"
                    : "Owner added successfully!";
            },
            error: (error) => {
                setIsPending(false);
                return `${
                    error?.message || "Failed to save owner."
                }`;
            },
        });
    };


    const pathname = usePathname();

    return (
        <div className="flex flex-col gap-12 w-[796px] mx-auto pb-12">
            <header className="flex flex-col items-center justify-center gap-4">
                <h2 className="text-3xl font-bold text-primary">
                    {isEditMode ? "Edit Owner" : "Add New Owner"}
                </h2>
                {!isEditMode && (
                    <p className="font-mono">
                        Fill in the correct detailed information for the new owner.
                    </p>
                )}
            </header>

            <ProgressBar
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                steps={progressBarSteps}
            />

            <form
                className="p-6 flex flex-col gap-8"
                onSubmit={handleSubmit(onSubmit)}
            >
                {/* ---------- STEP 1: Personal Info ---------- */}
                {activeStep === 1 && (
                    <>
                        <h3 className="text-lg">Personal Information</h3>
                        <div className="flex flex-col gap-6">
                            <div className="flex md:items-center items-start gap-6 flex-col">
                                <FormInput label="First Name" id="firstName">
                                    <input
                                        disabled={isReadOnly}
                                        {...register("firstName", {
                                            required: "First name is required",
                                        })}
                                        type="text"
                                        id="firstName"
                                        placeholder="Enter first name"
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                            errors.firstName
                                                ? "border-error"
                                                : "border-primary-200"
                                        }`}
                                    />
                                    {errors.firstName && (
                                        <span className="-mt-2 text-xs text-error">
                                            {errors.firstName.message}
                                        </span>
                                    )}
                                </FormInput>

                                <FormInput label="Last Name" id="lastName">
                                    <input
                                        disabled={isReadOnly}
                                        {...register("lastName", {
                                            required: "Last name is required",
                                        })}
                                        type="text"
                                        id="lastName"
                                        placeholder="Enter last name"
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                            errors.lastName
                                                ? "border-error"
                                                : "border-primary-200"
                                        }`}
                                    />
                                    {errors.lastName && (
                                        <span className="-mt-2 text-xs text-error">
                                            {errors.lastName.message}
                                        </span>
                                    )}
                                </FormInput>
                            </div>
                        </div>
                    </>
                )}

                {/* ---------- STEP 2: Contact ---------- */}
                {activeStep === 2 && (
                    <>
                        <h3 className="text-lg">Contact Details</h3>
                        <div className="flex flex-col gap-6">
                            <FormInput label="Email Address" id="email">
                                <input
                                    disabled={isReadOnly}
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /\S+@\S+\.\S+/,
                                            message:
                                                "Provide a valid email address",
                                        },
                                    })}
                                    type="email"
                                    id="email"
                                    placeholder="Enter email address"
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                        errors.email
                                            ? "border-error"
                                            : "border-primary-200"
                                    }`}
                                />
                                {errors.email && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.email.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="Phone Number" id="phone">
                                <input
                                    disabled={isReadOnly}
                                    {...register("phone", {
                                        required: "Phone number is required",
                                    })}
                                    type="tel"
                                    id="phone"
                                    placeholder="Enter phone number"
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                        errors.phone
                                            ? "border-error"
                                            : "border-primary-200"
                                    }`}
                                />
                                {errors.phone && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.phone.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="Address" id="address">
                                <input
                                    disabled={isReadOnly}
                                    {...register("address", {
                                        required: "Address is required",
                                    })}
                                    type="text"
                                    id="address"
                                    placeholder="Enter address"
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
                                        errors.address
                                            ? "border-error"
                                            : "border-primary-200"
                                    }`}
                                />
                                {errors.address && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.address.message}
                                    </span>
                                )}
                            </FormInput>
                        </div>
                    </>
                )}

                {/* ---------- STEP 3: Company & Notes ---------- */}
                {activeStep === 3 && (
                    <>
                        <h3 className="text-lg">Company & Notes</h3>
                        <div className="flex flex-col gap-6">
                            <FormInput label="Company Name" id="companyName">
                                <input
                                    disabled={isReadOnly}
                                    {...register("companyName")}
                                    type="text"
                                    id="companyName"
                                    placeholder="Enter company name (optional)"
                                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                                />
                            </FormInput>

                            <div className="w-full flex flex-col space-y-2 font-mono">
                                <label
                                    htmlFor="notes"
                                    className="text-sm text-black"
                                >
                                    Notes
                                </label>
                                <textarea
                                    disabled={isReadOnly}
                                    {...register("notes")}
                                    id="notes"
                                    rows={6}
                                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 resize-none focus:outline-none border-primary-200"
                                    placeholder="Enter any notes about this owner..."
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* ---------- Navigation ---------- */}
                <div
                    className={`${
                        activeStep > 1
                            ? "flex items-center justify-between"
                            : "self-end"
                    }`}
                >
                    {activeStep > 1 && (
                        <button
                            type="button"
                            onClick={() =>
                                setActiveStep((prev) => Math.max(1, prev - 1))
                            }
                            className="bg-white px-4 py-2 font-mono text-primary rounded-lg hover:bg-primary-100/80 cursor-pointer transition flex items-center gap-2"
                        >
                            <FaAngleLeft />
                            <span>Previous</span>
                        </button>
                    )}

                    {activeStep < progressBarSteps.length ? (
                        <button
                            type="button"
                            onClick={() =>
                                setActiveStep((prev) => prev + 1)
                            }
                            className="px-4 py-2 font-mono text-primary rounded-lg hover:bg-primary-100/80 cursor-pointer transition flex items-center gap-2"
                        >
                            <span>Next</span>
                            <FaAngleRight />
                        </button>
                    ) : (
                        !isReadOnly && (
                            <button
                                disabled={isPending}
                                type="submit"
                                className="px-4 py-2 bg-primary-200 font-mono text-primary rounded-lg hover:bg-primary-200/80 cursor-pointer transition flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span>
                                    {isEditMode ? "Save Changes" : "Finish"}
                                </span>
                                {isPending && <SpinnerMini />}
                            </button>
                        )
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddNewOwnerForm;