"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import AdminHeader from "@/app/_components/AdminHeader";
import FormInput from "@/app/_components/FormInput";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { addOwner } from "@/app/_lib/action";

const inputClass = (hasError) =>
    `rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink ${
        hasError ? "border-error" : "border-line"
    }`;

export default function OwnerForm({
    organizationId = "",
    organizationName = "",
    defaultReturnTo = "",
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const resolvedOrgId =
        organizationId || searchParams?.get("organizationId") || "";
    const resolvedOrgName =
        organizationName || searchParams?.get("organizationName") || "";

    const rawReturnTo = defaultReturnTo || searchParams?.get("returnTo") || "";
    const backHref =
        rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
            ? rawReturnTo
            : "/dashboard/property-owner/settings";

    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            companyName: "",
            notes: "",
        },
    });

    const onSubmit = (data) => {
        if (isPending) return;

        const payload = {
            ...(resolvedOrgId ? { organizationId: resolvedOrgId } : {}),
            firstName: (data.firstName || "").trim(),
            lastName: (data.lastName || "").trim(),
            email: (data.email || "").trim(),
            phone: (data.phone || "").trim(),
            address: (data.address || "").trim(),
            companyName: (data.companyName || "").trim(),
            notes: (data.notes || "").trim(),
        };

        setIsPending(true);
        toast.promise(addOwner(payload), {
            loading: "Creating owner profile...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(
                        res?.message || "Failed to create owner profile."
                    );
                }

                reset();
                router.refresh();
                setTimeout(() => {
                    router.push(backHref);
                }, 600);
                return res?.message || "Owner profile created successfully!";
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to create owner profile.";
            },
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader title="Create Owner Profile" backHref={backHref} />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        Create Owner Profile
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        {resolvedOrgName
                            ? `Create a new property owner profile linked to ${resolvedOrgName}.`
                            : "Create a new property owner profile linked to your organization."}
                    </p>
                </header>

                <form
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Owner Information
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="First Name *" id="firstName">
                                <input
                                    {...register("firstName", {
                                        required: "First name is required",
                                    })}
                                    type="text"
                                    id="firstName"
                                    placeholder="e.g. Chinedu"
                                    className={inputClass(errors.firstName)}
                                />
                                {errors.firstName && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.firstName.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="Last Name *" id="lastName">
                                <input
                                    {...register("lastName", {
                                        required: "Last name is required",
                                    })}
                                    type="text"
                                    id="lastName"
                                    placeholder="e.g. Okafor"
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
                            <FormInput label="Email Address *" id="email">
                                <input
                                    {...register("email", {
                                        required: "Email address is required",
                                    })}
                                    type="email"
                                    id="email"
                                    placeholder="owner@company.com"
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
                                    {...register("phone")}
                                    type="tel"
                                    id="phone"
                                    placeholder="+234 800 000 0000"
                                    className={inputClass(errors.phone)}
                                />
                            </FormInput>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Address" id="address">
                                <input
                                    {...register("address")}
                                    type="text"
                                    id="address"
                                    placeholder="e.g. Lekki Phase 1, Lagos"
                                    className={inputClass(errors.address)}
                                />
                            </FormInput>

                            <FormInput label="Company Name" id="companyName">
                                <input
                                    {...register("companyName")}
                                    type="text"
                                    id="companyName"
                                    placeholder="Optional"
                                    className={inputClass(errors.companyName)}
                                />
                            </FormInput>
                        </div>

                        <FormInput label="Notes" id="notes">
                            <textarea
                                {...register("notes")}
                                id="notes"
                                rows={3}
                                placeholder="Any additional notes about this owner..."
                                className={`${inputClass(errors.notes)} resize-y`}
                            />
                        </FormInput>
                    </div>

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
                                <UserPlus className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span>
                                {isPending
                                    ? "Creating..."
                                    : "Create Owner Profile"}
                            </span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
