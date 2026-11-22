"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Receipt } from "lucide-react";
import AdminHeader from "@/app/_components/AdminHeader";
import FormInput from "@/app/_components/FormInput";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { createExpense, updateExpense } from "@/app/_lib/action";

const EXPENSE_CATEGORIES = [
    { value: "REPAIRS", label: "Repairs" },
    { value: "ELECTRICITY", label: "Electricity" },
    { value: "WATER", label: "Water" },
    { value: "SECURITY", label: "Security" },
    { value: "CLEANING", label: "Cleaning" },
    { value: "STAFF", label: "Staff" },
    { value: "MAINTENANCE", label: "Maintenance" },
    { value: "UTILITIES", label: "Utilities" },
    { value: "PROPERTY_TAX", label: "Property Tax" },
    { value: "INSURANCE", label: "Insurance" },
    { value: "OTHER", label: "Other" },
];

const CURRENCIES = [
    { value: "NGN", label: "NGN (₦)" },
    { value: "USD", label: "USD ($)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "EUR", label: "EUR (€)" },
];

const inputClass = (hasError) =>
    `rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink ${
        hasError ? "border-error" : "border-line"
    }`;

const selectClass =
    "rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink border-line";

function toDateInputValue(value) {
    if (!value) return new Date().toISOString().slice(0, 10);
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
}

export default function ExpenseForm({
    expenseId: expenseIdProp = null,
    initialData = null,
    isEditMode = false,
    properties = [],
    defaultPropertyId = "",
    organizationId = "",
    defaultReturnTo = "",
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const effectiveData = initialData || {};

    const expenseId =
        expenseIdProp ||
        effectiveData?.id ||
        effectiveData?._id ||
        searchParams?.get("expenseId") ||
        null;

    const rawReturnTo = defaultReturnTo || searchParams?.get("returnTo") || "";
    const backHref =
        rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
            ? rawReturnTo
            : "/dashboard/property-owner/expenses";

    const propertiesList = Array.isArray(properties) ? properties : [];
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            category: (effectiveData?.category || "MAINTENANCE").toUpperCase(),
            vendor: effectiveData?.vendor || "",
            amount: effectiveData?.amount ?? "",
            currency: (effectiveData?.currency || "NGN").toUpperCase(),
            date: toDateInputValue(effectiveData?.date),
            propertyId:
                effectiveData?.propertyId ||
                effectiveData?.property?.id ||
                defaultPropertyId ||
                (propertiesList.length === 1
                    ? String(propertiesList[0]?.id || propertiesList[0]?._id || "")
                    : ""),
            description: effectiveData?.description || "",
            receipt: effectiveData?.receipt || "",
        },
    });

    const onSubmit = (data) => {
        if (isPending) return;

        const isoDate = data.date
            ? new Date(data.date).toISOString()
            : new Date().toISOString();

        const payload = {
            category: data.category || "OTHER",
            vendor: (data.vendor || "").trim(),
            amount: Number(data.amount),
            currency: data.currency || "NGN",
            date: isoDate,
            ...(data.propertyId ? { propertyId: data.propertyId } : {}),
            description: (data.description || "").trim(),
            receipt: (data.receipt || "").trim(),
        };

        const actionPromise =
            isEditMode && expenseId
                ? updateExpense(expenseId, payload, organizationId || null)
                : createExpense(payload, organizationId || null);

        setIsPending(true);
        toast.promise(actionPromise, {
            loading: isEditMode ? "Updating expense..." : "Recording expense...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(res?.message || "Failed to save expense.");
                }
                if (!isEditMode) reset();
                router.refresh();
                setTimeout(() => {
                    router.push(backHref);
                }, 600);
                return (
                    res?.message ||
                    (isEditMode
                        ? "Expense updated successfully!"
                        : "Expense recorded successfully!")
                );
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to save expense.";
            },
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader
                title={isEditMode ? "Edit Expense" : "Create Expense"}
                backHref={backHref}
            />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        {isEditMode ? "Edit Expense" : "Create Expense"}
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        {isEditMode
                            ? "Update expense category, vendor, amount, date, or receipt."
                            : "Log a new operating or maintenance expense for your portfolio."}
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                >
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Expense Details
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Category *" id="category">
                                <select
                                    {...register("category", {
                                        required: "Category is required",
                                    })}
                                    id="category"
                                    className={selectClass}
                                >
                                    {EXPENSE_CATEGORIES.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </FormInput>

                            <FormInput label="Vendor / Payee" id="vendor">
                                <input
                                    {...register("vendor")}
                                    type="text"
                                    id="vendor"
                                    placeholder="e.g. Eko Electricity / ABC Plumbing"
                                    className={inputClass(errors.vendor)}
                                />
                            </FormInput>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <FormInput label="Amount *" id="amount">
                                <input
                                    {...register("amount", {
                                        required: "Amount is required",
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    step="any"
                                    id="amount"
                                    placeholder="e.g. 50000"
                                    className={inputClass(errors.amount)}
                                />
                                {errors.amount && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.amount.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="Currency" id="currency">
                                <select
                                    disabled={isEditMode}
                                    {...register("currency")}
                                    id="currency"
                                    className={`${selectClass} disabled:opacity-60`}
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </FormInput>

                            <FormInput label="Expense Date *" id="date">
                                <input
                                    {...register("date", {
                                        required: "Date is required",
                                    })}
                                    type="date"
                                    id="date"
                                    className={inputClass(errors.date)}
                                />
                                {errors.date && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.date.message}
                                    </span>
                                )}
                            </FormInput>
                        </div>

                        {!isEditMode && (
                            <FormInput label="Property *" id="propertyId">
                                {propertiesList.length > 0 ? (
                                    <select
                                        {...register("propertyId", {
                                            required: "Please select a property",
                                        })}
                                        id="propertyId"
                                        className={selectClass}
                                    >
                                        <option value="">Select a property...</option>
                                        {propertiesList.map((p) => (
                                            <option
                                                key={p.id || p._id}
                                                value={p.id || p._id}
                                            >
                                                {p.name || p.property_name || "Property"}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="rounded-lg border border-amber-300/60 bg-amber-50/70 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
                                        No properties found. Please create a property first.
                                    </div>
                                )}
                                {errors.propertyId && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.propertyId.message}
                                    </span>
                                )}
                            </FormInput>
                        )}

                        <FormInput label="Receipt URL (Optional)" id="receipt">
                            <input
                                {...register("receipt")}
                                type="url"
                                id="receipt"
                                placeholder="https://storage.example.com/receipts/invoice.pdf"
                                className={`font-mono ${inputClass(errors.receipt)}`}
                            />
                        </FormInput>

                        <FormInput label="Description" id="description">
                            <textarea
                                {...register("description")}
                                id="description"
                                rows={3}
                                placeholder="Add notes about what this expense covers..."
                                className={`${inputClass(errors.description)} resize-y`}
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
                                <Receipt className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span>
                                {isPending
                                    ? isEditMode
                                        ? "Saving..."
                                        : "Recording..."
                                    : isEditMode
                                      ? "Save Changes"
                                      : "Create Expense"}
                            </span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

