"use client";

import FormInput from "@/app/_components/FormInput";
import ProgressBar from "@/app/_components/ProgressBar";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import toast from "react-hot-toast";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { createTenant } from "@/app/_lib/action";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

// 4-step flow for tenant creation
const progressBarSteps = [
    { step: 1, label: "Personal" },
    { step: 2, label: "Identification" },
    { step: 3, label: "Emergency" },
    { step: 4, label: "Employment" },
];

const ID_TYPES = [
    { value: "nin", label: "NIN — National Identity Number" },
    { value: "passport", label: "International Passport" },
    { value: "drivers-license", label: "Driver's License" },
    { value: "voters-card", label: "Voter's Card" },
    { value: "other", label: "Other" },
];

const EMPLOYMENT_TYPES = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "self-employed", label: "Self-employed" },
    { value: "contract", label: "Contract" },
    { value: "unemployed", label: "Unemployed" },
    { value: "student", label: "Student" },
    { value: "retired", label: "Retired" },
];

const selectClass =
    "rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236b7280%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10";

const inputClass = (hasError) =>
    `rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
        hasError ? "border-error" : "border-primary-200"
    }`;

const CreateTenantForm = ({
    initialData = null,
    isEditMode = false,
    isReadOnly = false,
}) => {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("propertyId") || null;

    const effectiveData = initialData || {};
    const [activeStep, setActiveStep] = useState(1);
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        trigger,
    } = useForm({
        defaultValues: {
            // Personal
            firstName: effectiveData?.firstName || "",
            lastName: effectiveData?.lastName || "",
            email: effectiveData?.email || "",
            phone: effectiveData?.phone || "",
            dateOfBirth: effectiveData?.dateOfBirth || "",
            occupation: effectiveData?.occupation || "",

            // Identification
            identificationType:
                effectiveData?.identification?.type || "",
            identificationNumber:
                effectiveData?.identification?.number || "",
            identificationIssuedDate:
                effectiveData?.identification?.issuedDate || "",
            identificationExpiryDate:
                effectiveData?.identification?.expiryDate || "",

            // Emergency contact
            emergencyContactName:
                effectiveData?.emergencyContact?.name || "",
            emergencyContactRelationship:
                effectiveData?.emergencyContact?.relationship || "",
            emergencyContactPhone:
                effectiveData?.emergencyContact?.phone || "",
            emergencyContactEmail:
                effectiveData?.emergencyContact?.email || "",

            // Employment
            employer: effectiveData?.employmentInformation?.employer || "",
            jobTitle:
                effectiveData?.employmentInformation?.jobTitle || "",
            employmentType:
                effectiveData?.employmentInformation?.employmentType || "",
            monthlyIncome:
                effectiveData?.employmentInformation?.monthlyIncome ?? "",
            workEmail:
                effectiveData?.employmentInformation?.workEmail || "",
            workPhone:
                effectiveData?.employmentInformation?.workPhone || "",
            workAddress:
                effectiveData?.employmentInformation?.workAddress || "",
        },
    });

    const onSubmit = (data) => {
        const payload = {
            firstName: (data.firstName || "").trim(),
            lastName: (data.lastName || "").trim(),
            email: (data.email || "").trim(),
            phone: (data.phone || "").trim(),
            dateOfBirth: data.dateOfBirth || "",
            occupation: (data.occupation || "").trim(),

            identification: {
                type: data.identificationType || "",
                number: (data.identificationNumber || "").trim(),
                issuedDate: data.identificationIssuedDate || "",
                expiryDate: data.identificationExpiryDate || "",
            },

            emergencyContact: {
                name: (data.emergencyContactName || "").trim(),
                relationship: (data.emergencyContactRelationship || "").trim(),
                phone: (data.emergencyContactPhone || "").trim(),
                email: (data.emergencyContactEmail || "").trim(),
            },

            employmentInformation: {
                employer: (data.employer || "").trim(),
                jobTitle: (data.jobTitle || "").trim(),
                employmentType: data.employmentType || "",
                monthlyIncome:
                    data.monthlyIncome === ""
                        ? null
                        : Number(data.monthlyIncome),
                workEmail: (data.workEmail || "").trim(),
                workPhone: (data.workPhone || "").trim(),
                workAddress: (data.workAddress || "").trim(),
            },
        };

        setIsPending(true);
        toast.promise(createTenant(payload, propertyId), {
            loading: isEditMode ? "Updating tenant..." : "Creating tenant...",
            success: (res) => {
                setIsPending(false);
                setActiveStep(1);
                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                            res?.errors?.[0]?.message ||
                            "Failed to save tenant."
                    );
                }
                if (!isEditMode) reset();
                return isEditMode
                    ? "Tenant updated successfully!"
                    : "Tenant created successfully!";
            },
            error: (error) => {
                setIsPending(false);
                return `${error?.message || "Failed to save tenant."}`;
            },
        });
    };

    // Fields to validate per step before advancing
    const stepFields = {
        1: ["firstName", "lastName", "email", "phone"],
        2: [],
        3: [],
        4: [],
    };

    const handleNext = async () => {
        const fields = stepFields[activeStep] || [];
        if (fields.length === 0) {
            setActiveStep((prev) => prev + 1);
            return;
        }
        const valid = await trigger(fields);
        if (valid) setActiveStep((prev) => prev + 1);
    };

    // Only submit on the last step.
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (activeStep === progressBarSteps.length) {
            handleSubmit(onSubmit)(e);
        }
    };

    const backHref = propertyId
        ? `/dashboard/user/my-properties/${propertyId}/tenants`
        : "/dashboard/user/tenants";

    return (
        <div className="flex flex-col gap-12 w-[796px] mx-auto pb-12">
            <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary self-start"
            >
                <ChevronLeft className="h-4 w-4" />
                Back to tenants
            </Link>

            <header className="flex flex-col items-center justify-center gap-4">
                <p className="text-3xl font-bold text-primary">
                    {isEditMode ? "Edit Tenant" : "Create Tenant"}
                </p>
                {!isEditMode && (
                    <p className="font-mono">
                        Fill in the correct detailed information for the new tenant.
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
                onSubmit={handleFormSubmit}
            >
                {/* ---------- STEP 1: Personal ---------- */}
                {activeStep === 1 && (
                    <>
                        <p className="text-lg">Personal Information</p>
                        <div className="flex flex-col gap-6">
                            <div className="flex md:items-center items-start gap-6 flex-col">
                                <FormInput
                                    label="First Name"
                                    id="firstName"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register("firstName", {
                                            required:
                                                "First name is required",
                                        })}
                                        type="text"
                                        id="firstName"
                                        placeholder="e.g. John"
                                        className={inputClass(
                                            errors.firstName
                                        )}
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
                                            required:
                                                "Last name is required",
                                        })}
                                        type="text"
                                        id="lastName"
                                        placeholder="e.g. Doe"
                                        className={inputClass(
                                            errors.lastName
                                        )}
                                    />
                                    {errors.lastName && (
                                        <span className="-mt-2 text-xs text-error">
                                            {errors.lastName.message}
                                        </span>
                                    )}
                                </FormInput>
                            </div>

                            <div className="flex md:items-center items-start gap-6 flex-col">
                                <FormInput
                                    label="Email Address"
                                    id="email"
                                >
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
                                        placeholder="john@example.com"
                                        className={inputClass(errors.email)}
                                    />
                                    {errors.email && (
                                        <span className="-mt-2 text-xs text-error">
                                            {errors.email.message}
                                        </span>
                                    )}
                                </FormInput>

                                <FormInput
                                    label="Phone Number"
                                    id="phone"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register("phone", {
                                            required:
                                                "Phone number is required",
                                        })}
                                        type="tel"
                                        id="phone"
                                        placeholder="+1234567890"
                                        className={inputClass(errors.phone)}
                                    />
                                    {errors.phone && (
                                        <span className="-mt-2 text-xs text-error">
                                            {errors.phone.message}
                                        </span>
                                    )}
                                </FormInput>
                            </div>

                            <div className="flex md:items-center items-start gap-6 flex-col">
                                <FormInput
                                    label="Date of Birth"
                                    id="dateOfBirth"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register("dateOfBirth")}
                                        type="date"
                                        id="dateOfBirth"
                                        className={inputClass(
                                            errors.dateOfBirth
                                        )}
                                    />
                                </FormInput>

                                <FormInput
                                    label="Occupation"
                                    id="occupation"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register("occupation")}
                                        type="text"
                                        id="occupation"
                                        placeholder="e.g. Software Engineer"
                                        className={inputClass(
                                            errors.occupation
                                        )}
                                    />
                                </FormInput>
                            </div>
                        </div>
                    </>
                )}

                {/* ---------- STEP 2: Identification ---------- */}
                {activeStep === 2 && (
                    <>
                        <p className="text-lg">Identification</p>
                        <div className="flex flex-col gap-6">
                            <div className="flex md:items-center items-start gap-6 flex-col">
                                <FormInput
                                    label="ID Type"
                                    id="identificationType"
                                >
                                    <select
                                        disabled={isReadOnly}
                                        {...register("identificationType")}
                                        id="identificationType"
                                        defaultValue=""
                                        className={selectClass}
                                    >
                                        <option value="" disabled>
                                            Select an ID type
                                        </option>
                                        {ID_TYPES.map((t) => (
                                            <option
                                                key={t.value}
                                                value={t.value}
                                            >
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </FormInput>

                                <FormInput
                                    label="ID Number"
                                    id="identificationNumber"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register(
                                            "identificationNumber"
                                        )}
                                        type="text"
                                        id="identificationNumber"
                                        placeholder="Enter ID number"
                                        className={inputClass(
                                            errors.identificationNumber
                                        )}
                                    />
                                </FormInput>
                            </div>

                            <div className="flex md:items-center items-start gap-6 flex-col">
                                <FormInput
                                    label="Issued Date"
                                    id="identificationIssuedDate"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register(
                                            "identificationIssuedDate"
                                        )}
                                        type="date"
                                        id="identificationIssuedDate"
                                        className={inputClass(
                                            errors.identificationIssuedDate
                                        )}
                                    />
                                </FormInput>

                                <FormInput
                                    label="Expiry Date"
                                    id="identificationExpiryDate"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register(
                                            "identificationExpiryDate"
                                        )}
                                        type="date"
                                        id="identificationExpiryDate"
                                        className={inputClass(
                                            errors.identificationExpiryDate
                                        )}
                                    />
                                </FormInput>
                            </div>
                        </div>
                    </>
                )}

                {/* ---------- STEP 3: Emergency Contact ---------- */}
                {activeStep === 3 && (
                    <>
                        <p className="text-lg">Emergency Contact</p>
                        <div className="flex flex-col gap-6">
                            <div className="flex md:items-center items-start gap-6 flex-col">
                                <FormInput
                                    label="Contact Name"
                                    id="emergencyContactName"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register(
                                            "emergencyContactName"
                                        )}
                                        type="text"
                                        id="emergencyContactName"
                                        placeholder="Full name"
                                        className={inputClass(
                                            errors.emergencyContactName
                                        )}
                                    />
                                </FormInput>

                                <FormInput
                                    label="Relationship"
                                    id="emergencyContactRelationship"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register(
                                            "emergencyContactRelationship"
                                        )}
                                        type="text"
                                        id="emergencyContactRelationship"
                                        placeholder="e.g. Spouse, Parent"
                                        className={inputClass(
                                            errors.emergencyContactRelationship
                                        )}
                                    />
                                </FormInput>
                            </div>

                            <div className="flex md:items-center items-start gap-6 flex-col">
                                <FormInput
                                    label="Phone Number"
                                    id="emergencyContactPhone"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register(
                                            "emergencyContactPhone"
                                        )}
                                        type="tel"
                                        id="emergencyContactPhone"
                                        placeholder="+1234567890"
                                        className={inputClass(
                                            errors.emergencyContactPhone
                                        )}
                                    />
                                </FormInput>

                                <FormInput
                                    label="Email Address"
                                    id="emergencyContactEmail"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register(
                                            "emergencyContactEmail",
                                            {
                                                pattern: {
                                                    value: /\S+@\S+\.\S+/,
                                                    message:
                                                        "Provide a valid email address",
                                                },
                                            }
                                        )}
                                        type="email"
                                        id="emergencyContactEmail"
                                        placeholder="contact@example.com"
                                        className={inputClass(
                                            errors.emergencyContactEmail
                                        )}
                                    />
                                    {errors.emergencyContactEmail && (
                                        <span className="-mt-2 text-xs text-error">
                                            {
                                                errors.emergencyContactEmail
                                                    .message
                                            }
                                        </span>
                                    )}
                                </FormInput>
                            </div>
                        </div>
                    </>
                )}

                {/* ---------- STEP 4: Employment ---------- */}
                {activeStep === 4 && (
                    <>
                        <p className="text-lg">Employment Information</p>
                        <div className="flex flex-col gap-6">
                            <div className="flex md:items-center items-start gap-6 flex-col">
                                <FormInput label="Employer" id="employer">
                                    <input
                                        disabled={isReadOnly}
                                        {...register("employer")}
                                        type="text"
                                        id="employer"
                                        placeholder="Company name"
                                        className={inputClass(
                                            errors.employer
                                        )}
                                    />
                                </FormInput>

                                <FormInput label="Job Title" id="jobTitle">
                                    <input
                                        disabled={isReadOnly}
                                        {...register("jobTitle")}
                                        type="text"
                                        id="jobTitle"
                                        placeholder="e.g. Senior Engineer"
                                        className={inputClass(
                                            errors.jobTitle
                                        )}
                                    />
                                </FormInput>
                            </div>

                            <div className="flex md:items-center items-start gap-6 flex-col">
                                <FormInput
                                    label="Employment Type"
                                    id="employmentType"
                                >
                                    <select
                                        disabled={isReadOnly}
                                        {...register("employmentType")}
                                        id="employmentType"
                                        defaultValue=""
                                        className={selectClass}
                                    >
                                        <option value="" disabled>
                                            Select employment type
                                        </option>
                                        {EMPLOYMENT_TYPES.map((t) => (
                                            <option
                                                key={t.value}
                                                value={t.value}
                                            >
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </FormInput>

                                <FormInput
                                    label="Monthly Income"
                                    id="monthlyIncome"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register("monthlyIncome", {
                                            min: {
                                                value: 0,
                                                message:
                                                    "Must be 0 or greater",
                                            },
                                        })}
                                        type="number"
                                        min="0"
                                        id="monthlyIncome"
                                        placeholder="e.g. 500000"
                                        className={inputClass(
                                            errors.monthlyIncome
                                        )}
                                    />
                                    {errors.monthlyIncome && (
                                        <span className="-mt-2 text-xs text-error">
                                            {errors.monthlyIncome.message}
                                        </span>
                                    )}
                                </FormInput>
                            </div>

                            <div className="flex md:items-center items-start gap-6 flex-col">
                                <FormInput
                                    label="Work Email"
                                    id="workEmail"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register("workEmail", {
                                            pattern: {
                                                value: /\S+@\S+\.\S+/,
                                                message:
                                                    "Provide a valid email address",
                                            },
                                        })}
                                        type="email"
                                        id="workEmail"
                                        placeholder="john@company.com"
                                        className={inputClass(
                                            errors.workEmail
                                        )}
                                    />
                                    {errors.workEmail && (
                                        <span className="-mt-2 text-xs text-error">
                                            {errors.workEmail.message}
                                        </span>
                                    )}
                                </FormInput>

                                <FormInput
                                    label="Work Phone"
                                    id="workPhone"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register("workPhone")}
                                        type="tel"
                                        id="workPhone"
                                        placeholder="+1234567890"
                                        className={inputClass(
                                            errors.workPhone
                                        )}
                                    />
                                </FormInput>
                            </div>

                            <FormInput
                                label="Work Address"
                                id="workAddress"
                            >
                                <input
                                    disabled={isReadOnly}
                                    {...register("workAddress")}
                                    type="text"
                                    id="workAddress"
                                    placeholder="Enter work address"
                                    className={inputClass(
                                        errors.workAddress
                                    )}
                                />
                            </FormInput>
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
                            onClick={handleNext}
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
                                    {isEditMode
                                        ? "Save Changes"
                                        : "Create Tenant"}
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

export default CreateTenantForm;