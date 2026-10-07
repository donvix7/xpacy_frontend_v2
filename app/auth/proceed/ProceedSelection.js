"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronRight, LoaderCircle, MapPin, Shield, X } from "lucide-react";
import { completeProceedSelection } from "@/app/_lib/action";

const roleLabels = {
    user: "User",
    admin: "Administrator",
    propertyowner: "Property owner",
    propertymanager: "Property manager",
    facilitymanager: "Facility manager",
};

export default function ProceedSelection({ organizations = [], role = "user", returnTo = "" }) {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const selectedOrganization = organizations.find((organization) => String(organization.id) === selectedId);
    const roleLabel = roleLabels[String(role).toLowerCase().replace(/[\s_-]/g, "")] || "Account";

    const continueToDashboard = async () => {
        if (organizations.length > 0 && !selectedId) {
            setError("Choose an organization to continue.");
            return;
        }

        setError("");
        setIsSubmitting(true);
        try {
            const result = await completeProceedSelection(selectedId, returnTo);
            if (!result?.success) {
                setError(result?.message || "Could not continue. Please try again.");
                setIsSubmitting(false);
                return;
            }
            router.replace(result.redirectTo);
        } catch (submitError) {
            setError(submitError?.message || "Could not continue. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <section className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="mb-7 flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                        <Building2 aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">Choose where to continue</p>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                            Select an organization to open your {roleLabel.toLowerCase()} workspace.
                        </p>
                    </div>
                </div>

                {organizations.length > 0 ? (
                    <div className="space-y-3" role="radiogroup" aria-label="Organizations">
                        {organizations.map((organization) => {
                            const id = String(organization.id);
                            const selected = selectedId === id;
                            const location = organization.location || organization.address || organization.city;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => {
                                        setSelectedId(id);
                                        setError("");
                                    }}
                                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${selected ? "border-primary bg-primary-50" : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"}`}
                                >
                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                                        {selected ? <Check className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block break-words font-semibold text-gray-900">{organization.name}</span>
                                        {location && (
                                            <span className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                                                <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{location}</span>
                                            </span>
                                        )}
                                    </span>
                                    {selected && <Shield aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
                        <p className="font-semibold text-gray-800">No organizations available</p>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                            You can continue to your dashboard. If you expected an organization here, ask your administrator to add your account.
                        </p>
                    </div>
                )}

                {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                <div className="mt-7 flex justify-end">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => organizations.length > 0 ? setShowConfirmation(true) : void continueToDashboard()}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                        Continue
                        {!isSubmitting && <ChevronRight aria-hidden="true" className="h-4 w-4" />}
                    </button>
                </div>
            </section>

            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
                    <div role="dialog" aria-modal="true" aria-labelledby="proceed-confirm-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p id="proceed-confirm-title" className="text-lg font-bold text-gray-900">Confirm your workspace</p>
                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    Continue to <span className="font-semibold text-gray-900">{selectedOrganization?.name}</span> as {roleLabel}?
                                </p>
                            </div>
                            <button type="button" aria-label="Close confirmation" onClick={() => setShowConfirmation(false)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" disabled={isSubmitting} onClick={() => setShowConfirmation(false)} className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
                                Cancel
                            </button>
                            <button type="button" disabled={isSubmitting} onClick={() => void continueToDashboard()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-white hover:bg-primary-700 disabled:opacity-60">
                                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                                Continue to workspace
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
