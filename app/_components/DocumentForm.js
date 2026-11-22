"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import AdminHeader from "@/app/_components/AdminHeader";
import FormInput from "@/app/_components/FormInput";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { createDocument } from "@/app/_lib/action";

const DOCUMENT_TYPES = [
    { value: "PROPERTY_DOCUMENT", label: "Property Document" },
    { value: "LEASE_AGREEMENT", label: "Lease Agreement" },
    { value: "DEED", label: "Property Deed / Title" },
    { value: "INSURANCE", label: "Insurance Policy" },
    { value: "INSPECTION_REPORT", label: "Inspection Report" },
    { value: "INVOICE", label: "Invoice" },
    { value: "RECEIPT", label: "Payment Receipt" },
    { value: "ID_DOCUMENT", label: "Identification Document" },
    { value: "CONTRACT", label: "Contract" },
    { value: "OTHER", label: "Other" },
];

const MIME_TYPES = [
    { value: "application/pdf", label: "PDF (application/pdf)" },
    { value: "image/jpeg", label: "JPEG Image (image/jpeg)" },
    { value: "image/png", label: "PNG Image (image/png)" },
    { value: "application/msword", label: "Word Document (.doc)" },
    {
        value: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        label: "Word Document (.docx)",
    },
    { value: "text/plain", label: "Plain Text (text/plain)" },
];

const inputClass = (hasError) =>
    `rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink ${
        hasError ? "border-error" : "border-line"
    }`;

const selectClass =
    "rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink border-line";

export default function DocumentForm({
    properties = [],
    defaultPropertyId = "",
    organizationId = "",
    defaultReturnTo = "",
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const rawReturnTo = defaultReturnTo || searchParams?.get("returnTo") || "";
    const backHref =
        rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
            ? rawReturnTo
            : "/dashboard/property-owner/documents";

    const propertiesList = Array.isArray(properties) ? properties : [];
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            name: "",
            type: "PROPERTY_DOCUMENT",
            url: "",
            propertyId: defaultPropertyId || "",
            mimeType: "application/pdf",
            fileSize: 0,
        },
    });

    const onSubmit = (data) => {
        if (isPending) return;

        const payload = {
            name: (data.name || "").trim(),
            type: data.type || "PROPERTY_DOCUMENT",
            url: (data.url || "").trim(),
            ...(data.propertyId ? { propertyId: data.propertyId } : {}),
            ...(organizationId ? { organizationId } : {}),
            fileSize:
                data.fileSize !== "" && data.fileSize != null
                    ? Number(data.fileSize)
                    : 0,
            mimeType: data.mimeType || "application/pdf",
        };

        setIsPending(true);
        toast.promise(createDocument(payload), {
            loading: "Saving document...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(res?.message || "Failed to save document.");
                }
                reset();
                router.refresh();
                setTimeout(() => {
                    router.push(backHref);
                }, 600);
                return res?.message || "Document saved successfully!";
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to save document.";
            },
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader title="Add Document" backHref={backHref} />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        Add New Document
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        Store and organize leases, deeds, inspection reports, and other property records.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                >
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Document Details
                        </p>

                        <FormInput label="Document Name *" id="name">
                            <input
                                {...register("name", {
                                    required: "Document name is required",
                                })}
                                type="text"
                                id="name"
                                placeholder="e.g. Unit 2B Lease Agreement 2026"
                                className={inputClass(errors.name)}
                            />
                            {errors.name && (
                                <span className="-mt-2 text-xs text-error">
                                    {errors.name.message}
                                </span>
                            )}
                        </FormInput>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Document Type *" id="type">
                                <select
                                    {...register("type", {
                                        required: "Document type is required",
                                    })}
                                    id="type"
                                    className={selectClass}
                                >
                                    {DOCUMENT_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </FormInput>

                            {propertiesList.length > 0 && (
                                <FormInput label="Linked Property (Optional)" id="propertyId">
                                    <select
                                        {...register("propertyId")}
                                        id="propertyId"
                                        className={selectClass}
                                    >
                                        <option value="">Organization-wide</option>
                                        {propertiesList.map((p) => (
                                            <option
                                                key={p.id || p._id}
                                                value={p.id || p._id}
                                            >
                                                {p.name || p.property_name || "Property"}
                                            </option>
                                        ))}
                                    </select>
                                </FormInput>
                            )}
                        </div>

                        <FormInput label="Document URL *" id="url">
                            <input
                                {...register("url", {
                                    required: "Document URL is required",
                                })}
                                type="url"
                                id="url"
                                placeholder="https://storage.example.com/documents/lease.pdf"
                                className={`font-mono ${inputClass(errors.url)}`}
                            />
                            {errors.url && (
                                <span className="-mt-2 text-xs text-error">
                                    {errors.url.message}
                                </span>
                            )}
                        </FormInput>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="File Format (MIME Type)" id="mimeType">
                                <select
                                    {...register("mimeType")}
                                    id="mimeType"
                                    className={selectClass}
                                >
                                    {MIME_TYPES.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </FormInput>

                            <FormInput label="File Size (bytes, optional)" id="fileSize">
                                <input
                                    {...register("fileSize", {
                                        min: { value: 0, message: "Must be 0 or greater" },
                                    })}
                                    type="number"
                                    min="0"
                                    step="1"
                                    id="fileSize"
                                    placeholder="e.g. 245760"
                                    className={inputClass(errors.fileSize)}
                                />
                            </FormInput>
                        </div>
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
                                <FileText className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span>{isPending ? "Saving..." : "Save Document"}</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

