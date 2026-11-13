"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronRight, LoaderCircle, MapPin, Shield, Users, X } from "lucide-react";
import { completeProceedSelection } from "@/app/_lib/action";

const roleLabels = {
    user: "User",
    admin: "Administrator",
    propertyowner: "Property owner",
    propertymanager: "Property manager",
    facilitymanager: "Facility manager",
    organizationadmin: "Organization admin",
    organizationadministrator: "Organization admin",
    organizationowner: "Organization owner",
    owner: "Owner",
    tenant: "Tenant",
};

const formatRoleLabel = (role) => {
    const normalized = String(role || "").trim().toLowerCase().replace(/[\s_-]/g, "");
    return roleLabels[normalized] || String(role || "Member").replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function ProceedSelection({ organizations = [], role = "user", returnTo = "" }) {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const selectedOrganization = organizations.find((organization) => String(organization.id) === selectedId);
    const roleLabel = formatRoleLabel(role);

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
        <main className="xp-auth flex min-h-dvh w-full items-center justify-center bg-canvas px-4 py-10 md:px-6">
            <section className="xp-auth-card flex w-full max-w-2xl flex-col gap-6 p-5 sm:p-8">
                <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-soft text-side-active">
                        <Building2 aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                        <h1 className="font-sans text-[22px] font-bold leading-tight text-ink">Choose where to continue</h1>
                        <p className="mt-1 font-mono text-[13.5px] leading-6 text-mute">
                            Select an organization to open your {roleLabel.toLowerCase()} workspace.
                        </p>
                    </div>
                </div>

                {organizations.length > 0 ? (
                    <div className="flex flex-col gap-3" role="radiogroup" aria-label="Organizations">
                        {organizations.map((organization) => {
                            const id = String(organization.id);
                            const selected = selectedId === id;
                            const location = organization.location || organization.address || organization.city;
                            return (
                                <div key={id} className={`overflow-hidden rounded-xl border transition-colors ${selected ? "border-side-active bg-soft/60" : "border-line bg-card"}`}>
                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={selected}
                                        onClick={() => {
                                            setSelectedId(id);
                                            setError("");
                                        }}
                                        className={`flex w-full items-center gap-4 p-4 text-left transition-colors ${selected ? "bg-soft/60" : "hover:bg-soft/40"}`}
                                    >
                                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${selected ? "bg-side-active text-white" : "bg-soft text-mute"}`}>
                                            {selected ? <Check className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block break-words font-sans text-[15px] font-semibold text-ink">{organization.name}</span>
                                            {location && (
                                                <span className="mt-1 flex items-center gap-1 font-mono text-[12.5px] text-mute">
                                                    <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{location}</span>
                                                </span>
                                            )}
                                            <span className="mt-2 inline-flex rounded-full bg-card px-2.5 py-1 font-mono text-[11.5px] font-medium capitalize text-ink ring-1 ring-line">
                                                Your role: {organization.organizationRole ? formatRoleLabel(organization.organizationRole) : "Role unavailable"}
                                            </span>
                                        </span>
                                        {selected && <Shield aria-hidden="true" className="ml-2 h-5 w-5 shrink-0 text-side-active" />}
                                    </button>

                                    <details className="group border-t border-line">
                                        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-mono text-[12.5px] font-medium text-mute transition-colors hover:bg-soft/60">
                                            <Users aria-hidden="true" className="h-4 w-4 text-side-active" />
                                            Organization members ({organization.members?.length || 0})
                                        </summary>
                                        {organization.members?.length ? (
                                            <ul className="divide-y divide-line border-t border-line">
                                                {organization.members.map((member, index) => (
                                                    <li key={`${member.id || member.email || "member"}-${index}`} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                                        <div className="min-w-0">
                                                            <p className="break-words text-[13.5px] font-medium text-ink">{member.name}</p>
                                                            {member.email && <p className="break-all font-mono text-[11.5px] text-mute">{member.email}</p>}
                                                        </div>
                                                        <span className="inline-flex w-fit rounded-full bg-card px-2.5 py-1 font-mono text-[11.5px] font-medium capitalize text-ink ring-1 ring-line">
                                                            {member.role ? formatRoleLabel(member.role) : "Role unavailable"}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="border-t border-line px-4 py-3 font-mono text-[12.5px] text-mute">No member records were returned.</p>
                                        )}
                                    </details>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-line bg-soft/50 p-5">
                        <p className="font-sans text-[15px] font-semibold text-ink">No organizations available</p>
                        <p className="mt-1 font-mono text-[13px] leading-6 text-mute">
                            You can continue to your dashboard. If you expected an organization here, ask your administrator to add your account.
                        </p>
                    </div>
                )}

                {error && (
                    <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-mono text-[12.5px] text-red-700">
                        {error}
                    </p>
                )}

                <div className="flex justify-end">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => organizations.length > 0 ? setShowConfirmation(true) : void continueToDashboard()}
                        className="xp-btn xp-btn-fill w-full py-3 font-mono text-[14px] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                        Continue
                        {!isSubmitting && <ChevronRight aria-hidden="true" className="h-4 w-4" />}
                    </button>
                </div>
            </section>

            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-side/60 p-4 backdrop-blur-sm" role="presentation">
                    <div role="dialog" aria-modal="true" aria-labelledby="proceed-confirm-title" className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p id="proceed-confirm-title" className="font-sans text-[18px] font-bold text-ink">Confirm your workspace</p>
                                <p className="mt-2 font-mono text-[13px] leading-6 text-mute">
                                    Continue to <span className="font-semibold text-ink">{selectedOrganization?.name}</span> as {formatRoleLabel(selectedOrganization?.organizationRole)}?
                                </p>
                            </div>
                            <button type="button" aria-label="Close confirmation" onClick={() => setShowConfirmation(false)} className="rounded-lg p-1 text-mute transition-colors hover:bg-soft hover:text-ink">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" disabled={isSubmitting} onClick={() => setShowConfirmation(false)} className="xp-btn px-4 py-2.5 font-mono text-[13px] disabled:cursor-not-allowed disabled:opacity-60">
                                Cancel
                            </button>
                            <button type="button" disabled={isSubmitting} onClick={() => void continueToDashboard()} className="xp-btn xp-btn-fill px-4 py-2.5 font-mono text-[13px] disabled:cursor-not-allowed disabled:opacity-60">
                                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
