"use client";

import FormInput from "@/app/_components/FormInput";
import ProgressBar from "@/app/_components/ProgressBar";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import toast from "react-hot-toast";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { createTenant, updateTenant } from "@/app/_lib/action";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminHeader from "@/app/_components/AdminHeader";

// 4-step flow for tenant creation & editing
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

const TENANT_STATUSES = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "PENDING", label: "Pending" },
    { value: "SUSPENDED", label: "Suspended" },
];

const selectClass =
    "rounded-lg border bg-card text-ink px-4.5 py-3 focus:outline-none focus:border-primary border-line appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236b7280%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10";

const inputClass = (hasError) =>
    `rounded-lg border bg-card text-ink px-4.5 py-3 focus:outline-none focus:border-primary ${
        hasError ? "border-error" : "border-line"
    }`;

function toDateInputValue(value) {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
}

export default function TenantForm({
    initialData = null,
    isEditMode = false,
    isReadOnly = false,
    basePath = "/dashboard/property-owner/tenants",
    embedded = false,
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const propertyId = searchParams?.get("propertyId") || null;
    const returnTo = searchParams?.get("returnTo") || null;

    const effectiveData = initialData || {};
    const tenantId = effectiveData?.id || effectiveData?._id || null;
    const emp =
        effectiveData?.employmentInformation ||
        effectiveData?.employmentInfo ||
        effectiveData?.employment ||
        {};
    const idDoc = effectiveData?.identification || {};
    const emg = effectiveData?.emergencyContact || {};

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
            phone: effectiveData?.phone || effectiveData?.phoneNumber || "",
            dateOfBirth: toDateInputValue(effectiveData?.dateOfBirth),
            occupation: effectiveData?.occupation || "",
            status: (effectiveData?.status || "ACTIVE").toUpperCase(),

            // Identification
            identificationType:
                idDoc?.type ||
                effectiveData?.idType ||
                effectiveData?.identificationType ||
                "",
            identificationNumber:
                idDoc?.number ||
                effectiveData?.idNumber ||
                effectiveData?.identificationNumber ||
                "",
            identificationIssuedDate: toDateInputValue(idDoc?.issuedDate),
            identificationExpiryDate: toDateInputValue(idDoc?.expiryDate),

            // Emergency contact
            emergencyContactName: emg?.name || emg?.fullName || "",
            emergencyContactRelationship:
                emg?.relationship || emg?.relation || "",
            emergencyContactPhone: emg?.phone || emg?.phoneNumber || "",
            emergencyContactEmail: emg?.email || "",

            // Employment
            employer: emp?.employer || emp?.company || "",
            jobTitle: emp?.jobTitle || emp?.position || emp?.role || "",
            employmentType: emp?.employmentType || "",
            monthlyIncome: emp?.monthlyIncome ?? "",
            workEmail: emp?.workEmail || "",
            workPhone: emp?.workPhone || "",
            workAddress: emp?.workAddress || emp?.address || "",
        },
    });

    const onSubmit = (data) => {
        const payload = {
            firstName: (data.firstName || "").trim(),
            lastName: (data.lastName || "").trim(),
            email: (data.email || "").trim(),
            phone: (data.phone || "").trim(),
            dateOfBirth: data.dateOfBirth || null,
            occupation: (data.occupation || "").trim(),
            ...(isEditMode && data.status ? { status: data.status } : {}),

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
                    data.monthlyIncome === "" || data.monthlyIncome === null
                        ? null
                        : Number(data.monthlyIncome),
                workEmail: (data.workEmail || "").trim(),
                workPhone: (data.workPhone || "").trim(),
                workAddress: (data.workAddress || "").trim(),
            },
        };

        const actionPromise =
            isEditMode && tenantId
                ? updateTenant(tenantId, payload)
                : createTenant(payload, propertyId);

        setIsPending(true);
        toast.promise(actionPromise, {
            loading: isEditMode ? "Updating tenant..." : "Creating tenant...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                            res?.errors?.[0]?.message ||
                            "Failed to save tenant."
                    );
                }

                if (isEditMode) {
                    router.refresh();
                    const dest =
                        returnTo ||
                        (tenantId ? `${basePath}/${tenantId}` : basePath);
                    router.push(dest);
                    return "Tenant updated successfully!";
                }

                setActiveStep(1);
                reset();
                const newTenantId =
                    res?.data?.id || res?.id || res?.data?.tenant?.id;
                if (newTenantId) {
                    router.push(
                        returnTo
                            ? `${returnTo}/${newTenantId}`
                            : `${basePath}/${newTenantId}`
                    );
                } else if (returnTo) {
                    router.push(returnTo);
                } else {
                    router.push(basePath);
                }
                return "Tenant created successfully!";
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

    // Allow saving directly on any step in edit mode; in create mode, submit on the last step.
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isEditMode || activeStep === progressBarSteps.length) {
            handleSubmit(onSubmit)(e);
        }
    };

    const backHref =
        returnTo ||
        (isEditMode && tenantId
            ? `${basePath}/${tenantId}`
            : propertyId
              ? `/dashboard/admin/properties/${propertyId}`
              : basePath);

    const formContent = (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
            {!embedded && (
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        {isEditMode ? "Edit Tenant" : "Create Tenant"}
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        {isEditMode
                            ? "Update the tenant's profile, identification, emergency contact, or employment details."
                            : "Fill in the detailed information for the tenant."}
                    </p>
                </header>
            )}

            <ProgressBar
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                steps={progressBarSteps}
            />

            <form
                className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                onSubmit={handleFormSubmit}
            >
                {/* ---------- STEP 1: Personal ---------- */}
                {activeStep === 1 && (
                    <>
                        <p className="text-lg font-semibold text-ink">
                            Personal Information
                        </p>
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormInput label="First Name" id="firstName">
                                    <input
                                        disabled={isReadOnly}
                                        {...register("firstName", {
                                            required: "First name is required",
                                        })}
                                        type="text"
                                        id="firstName"
                                        placeholder="e.g. John"
                                        className={inputClass(errors.firstName)}
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
                                        placeholder="e.g. Doe"
                                        className={inputClass(errors.lastName)}
                                    />
                                    {errors.lastName && (
                                        <span className="-mt-2 text-xs text-error">
                                            {errors.lastName.message}
                                        </span>
                                    )}
                                </FormInput>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                                        placeholder="john@example.com"
                                        className={inputClass(errors.email)}
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
                                            required:
                                                "Phone number is required",
                                        })}
                                        type="tel"
                                        id="phone"
                                        placeholder="+2348012345678"
                                        className={inputClass(errors.phone)}
                                    />
                                    {errors.phone && (
                                        <span className="-mt-2 text-xs text-error">
                                            {errors.phone.message}
                                        </span>
                                    )}
                                </FormInput>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

                                <FormInput label="Occupation" id="occupation">
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

                            {isEditMode && (
                                <FormInput label="Status" id="status">
                                    <select
                                        disabled={isReadOnly}
                                        {...register("status")}
                                        id="status"
                                        className={selectClass}
                                    >
                                        {TENANT_STATUSES.map((s) => (
                                            <option
                                                key={s.value}
                                                value={s.value}
                                            >
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </FormInput>
                            )}
                        </div>
                    </>
                )}

                {/* ---------- STEP 2: Identification ---------- */}
                {activeStep === 2 && (
                    <>
                        <p className="text-lg font-semibold text-ink">
                            Identification
                        </p>
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormInput
                                    label="ID Type"
                                    id="identificationType"
                                >
                                    <select
                                        disabled={isReadOnly}
                                        {...register("identificationType")}
                                        id="identificationType"
                                        className={selectClass}
                                    >
                                        <option value="">
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
                                        {...register("identificationNumber")}
                                        type="text"
                                        id="identificationNumber"
                                        placeholder="Enter ID number"
                                        className={inputClass(
                                            errors.identificationNumber
                                        )}
                                    />
                                </FormInput>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                        <p className="text-lg font-semibold text-ink">
                            Emergency Contact
                        </p>
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormInput
                                    label="Contact Name"
                                    id="emergencyContactName"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register("emergencyContactName")}
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
                                        placeholder="e.g. Spouse, Parent, Friend"
                                        className={inputClass(
                                            errors.emergencyContactRelationship
                                        )}
                                    />
                                </FormInput>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormInput
                                    label="Phone Number"
                                    id="emergencyContactPhone"
                                >
                                    <input
                                        disabled={isReadOnly}
                                        {...register("emergencyContactPhone")}
                                        type="tel"
                                        id="emergencyContactPhone"
                                        placeholder="+2348012345678"
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
                                        {...register("emergencyContactEmail", {
                                            pattern: {
                                                value: /\S+@\S+\.\S+/,
                                                message:
                                                    "Provide a valid email address",
                                            },
                                        })}
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
                        <p className="text-lg font-semibold text-ink">
                            Employment Information
                        </p>
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormInput label="Employer" id="employer">
                                    <input
                                        disabled={isReadOnly}
                                        {...register("employer")}
                                        type="text"
                                        id="employer"
                                        placeholder="Company name"
                                        className={inputClass(errors.employer)}
                                    />
                                </FormInput>

                                <FormInput label="Job Title" id="jobTitle">
                                    <input
                                        disabled={isReadOnly}
                                        {...register("jobTitle")}
                                        type="text"
                                        id="jobTitle"
                                        placeholder="e.g. Senior Engineer"
                                        className={inputClass(errors.jobTitle)}
                                    />
                                </FormInput>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormInput
                                    label="Employment Type"
                                    id="employmentType"
                                >
                                    <select
                                        disabled={isReadOnly}
                                        {...register("employmentType")}
                                        id="employmentType"
                                        className={selectClass}
                                    >
                                        <option value="">
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
                                                message: "Must be 0 or greater",
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormInput label="Work Email" id="workEmail">
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
                                        className={inputClass(errors.workEmail)}
                                    />
                                    {errors.workEmail && (
                                        <span className="-mt-2 text-xs text-error">
                                            {errors.workEmail.message}
                                        </span>
                                    )}
                                </FormInput>

                                <FormInput label="Work Phone" id="workPhone">
                                    <input
                                        disabled={isReadOnly}
                                        {...register("workPhone")}
                                        type="tel"
                                        id="workPhone"
                                        placeholder="+2348012345678"
                                        className={inputClass(errors.workPhone)}
                                    />
                                </FormInput>
                            </div>

                            <FormInput label="Work Address" id="workAddress">
                                <input
                                    disabled={isReadOnly}
                                    {...register("workAddress")}
                                    type="text"
                                    id="workAddress"
                                    placeholder="Enter work address"
                                    className={inputClass(errors.workAddress)}
                                />
                            </FormInput>
                        </div>
                    </>
                )}

                {/* ---------- Navigation & Actions ---------- */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                    <div className="flex items-center gap-2">
                        {activeStep > 1 ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveStep((prev) =>
                                        Math.max(1, prev - 1)
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-soft cursor-pointer"
                            >
                                <FaAngleLeft />
                                <span>Previous</span>
                            </button>
                        ) : (
                            <Link
                                href={backHref}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium text-mute transition-colors hover:bg-soft hover:text-ink"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Cancel
                            </Link>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {isEditMode &&
                            !isReadOnly &&
                            activeStep < progressBarSteps.length && (
                                <button
                                    disabled={isPending}
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>Save Changes</span>
                                    {isPending && <SpinnerMini />}
                                </button>
                            )}

                        {activeStep < progressBarSteps.length ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="inline-flex items-center gap-2 rounded-lg border border-line bg-soft px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-soft/80 cursor-pointer"
                            >
                                <span>Next</span>
                                <FaAngleRight />
                            </button>
                        ) : (
                            !isReadOnly && (
                                <button
                                    disabled={isPending}
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isEditMode && <Save className="h-4 w-4" />}
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
                </div>
            </form>
        </div>
    );

    if (embedded) {
        return formContent;
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader
                title={isEditMode ? "Edit Tenant" : "Add Tenant"}
                backHref={backHref}
            />
            <main className="flex-1 w-full px-4 py-8 sm:px-6 sm:py-10">
                {formContent}
            </main>
        </div>
    );
}

