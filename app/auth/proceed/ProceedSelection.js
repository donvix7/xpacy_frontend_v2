"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    Building2,
    Check,
    ChevronRight,
    LoaderCircle,
    MapPin,
    Shield,
    Users,
    X,
} from "lucide-react";
import { completeProceedSelection } from "@/app/_lib/action";
import Link from "next/link";
import Modal from "@/app/_components/Modal";

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
    return (
        roleLabels[normalized] ||
        String(role || "Member")
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
    );
};

export default function ProceedSelection({
    organizations = [],
    subscription = null,
    role = "user",
    currentUserId = "",
    currentUserEmail = "",
    returnTo = "",
    errorMessage = "",
}) {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const hasOrganizations = organizations.length > 0;
    const hasLoadError = Boolean(errorMessage);
    const isSubscriptionActive = Boolean(subscription?.isActive);
    const selectedOrganization = organizations.find(
        (organization) => String(organization.id) === selectedId
    );
    const roleLabel = formatRoleLabel(role);

    // When there's nothing to pick from (empty list) we just go straight to
    // the dashboard. No org is required.
    const continueWithoutSelection = async () => {
        setError("");
        setIsSubmitting(true);
        try {
            const result = await completeProceedSelection("", returnTo);
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

    const continueWithSelection = async () => {
        if (!isSubscriptionActive) {
            setError(
                "An active subscription is required to select and access an organization workspace. Please choose a subscription plan to proceed."
            );
            setShowConfirmation(false);
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

    const handleContinueClick = () => {
        // Nothing selected (no organizations, a failed load, or the user chose
        // not to pick one) → continue with just the token.
        if (!selectedId) {
            void continueWithoutSelection();
            return;
        }

        // Validate subscription before opening workspace confirmation
        if (!isSubscriptionActive) {
            setError(
                "An active subscription is required to select and access an organization workspace. Please choose a subscription plan to proceed, or proceed directly to your individual dashboard."
            );
            return;
        }

        setShowConfirmation(true);
    };

    return (
        <main className="xp-auth flex min-h-dvh w-full items-center justify-center bg-canvas px-4 py-10 md:px-6">
            <section className="xp-auth-card flex w-full max-w-2xl flex-col gap-6 p-5 sm:p-8">
                <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-soft text-side-active">
                        <Building2 aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h1 className="font-sans text-[22px] font-bold leading-tight text-ink">
                            {hasLoadError ? "We couldn't load your organizations" : "Choose where to continue"}
                        </h1>
                        <p className="mt-1 font-mono text-[13.5px] leading-6 text-mute">
                            {hasLoadError
                                ? "You can continue to your dashboard without an organization, or subscribe to set up your own workspace."
                                : `Select an organization to open its workspace, or continue to your ${roleLabel.toLowerCase()} dashboard.`}
                        </p>
                    </div>
                </div>

                {/* Subscription status indicator */}
                {subscription && (
                    isSubscriptionActive ? (
                        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-ink">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="font-mono text-[12.5px] text-ink">
                                    Subscription Active:{" "}
                                    <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                                        {subscription.plan?.name || "Active Plan"}
                                    </strong>
                                </span>
                            </div>
                            <span className="font-mono text-[11.5px] text-mute uppercase">
                                {subscription.status}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-ink sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-2.5">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <p className="font-sans text-[13.5px] font-semibold text-ink">
                                        {subscription.isExpired ? "Subscription Expired" : "Subscription Required for Workspaces"}
                                    </p>
                                    <p className="mt-0.5 font-mono text-[12px] text-mute">
                                        An active subscription is required to select and enter an organization workspace.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/auth/subscriptions"
                                className="xp-btn xp-btn-fill shrink-0 py-2 px-3 text-center font-mono text-[12px] sm:w-auto"
                            >
                                Subscribe Now
                            </Link>
                        </div>
                    )
                )}

                {hasLoadError ? (
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                        <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                        <div className="min-w-0">
                            <p className="font-sans text-[14px] font-semibold text-red-800 dark:text-red-300">
                                Could not load organizations
                            </p>
                            <p className="mt-1 break-words font-mono text-[12.5px] leading-6 text-red-700 dark:text-red-400">
                                {errorMessage}
                            </p>
                        </div>
                    </div>
                ) : hasOrganizations ? (
                    <div className="flex flex-col gap-3" role="radiogroup" aria-label="Organizations">
                        {organizations.map((organization) => {
                            const id = String(organization.id);
                            const selected = selectedId === id;
                            const members = Array.isArray(organization.members)
                                ? organization.members
                                : [];

                            // Check what role the current user has in the organization
                            const matchedMember = members.find((entry) => {
                                const u = entry?.user || entry?.profile || {};
                                const ids = [
                                    entry?.id,
                                    entry?.userId,
                                    entry?.user_id,
                                    entry?.member?.userId,
                                    u?.id,
                                    u?._id,
                                    u?.userId,
                                ]
                                    .filter(Boolean)
                                    .map(String);
                                const emails = [
                                    entry?.email,
                                    entry?.member?.email,
                                    u?.email,
                                ]
                                    .filter(Boolean)
                                    .map((e) => String(e).trim().toLowerCase());
                                return (
                                    (currentUserId && ids.includes(String(currentUserId))) ||
                                    (currentUserEmail && emails.includes(String(currentUserEmail).trim().toLowerCase()))
                                );
                            });

                            const userRoleInOrg =
                                organization.organizationRole ||
                                matchedMember?.role?.name ||
                                matchedMember?.role ||
                                organization.role ||
                                "";

                            const location =
                                organization.location ||
                                organization.address ||
                                organization.city;

                            return (
                                <div
                                    key={id}
                                    className={`overflow-hidden rounded-xl border transition-colors ${
                                        selected
                                            ? "border-side-active bg-soft/60"
                                            : "border-line bg-card"
                                    }`}
                                >
                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={selected}
                                        onClick={() => {
                                            setSelectedId((prev) => (prev === id ? "" : id));
                                            setError("");
                                        }}
                                        className={`flex w-full items-center gap-4 p-4 text-left transition-colors ${
                                            selected ? "bg-soft/60" : "hover:bg-soft/40"
                                        }`}
                                    >
                                        <span
                                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                                                selected
                                                    ? "bg-side-active text-white"
                                                    : "bg-soft text-mute"
                                            }`}
                                        >
                                            {selected ? (
                                                <Check className="h-5 w-5" />
                                            ) : (
                                                <Building2 className="h-5 w-5" />
                                            )}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block break-words font-sans text-[15px] font-semibold text-ink">
                                                {organization.name}
                                            </span>
                                            {location && (
                                                <span className="mt-1 flex items-center gap-1 font-mono text-[12.5px] text-mute">
                                                    <MapPin
                                                        aria-hidden="true"
                                                        className="h-3.5 w-3.5 shrink-0"
                                                    />
                                                    <span className="truncate">{location}</span>
                                                </span>
                                            )}
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex rounded-full bg-card px-2.5 py-1 font-mono text-[11.5px] font-medium capitalize text-ink ring-1 ring-line">
                                                    Your role:{" "}
                                                    {userRoleInOrg
                                                        ? formatRoleLabel(userRoleInOrg)
                                                        : formatRoleLabel(role || "Member")}
                                                </span>
                                                {!isSubscriptionActive && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 font-mono text-[11px] font-medium text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Subscription required
                                                    </span>
                                                )}
                                            </div>
                                        </span>
                                        {selected && (
                                            <Shield
                                                aria-hidden="true"
                                                className="ml-2 h-5 w-5 shrink-0 text-side-active"
                                            />
                                        )}
                                    </button>

                                   
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-line bg-soft/50 p-5">
                        <p className="font-sans text-[15px] font-semibold text-ink">
                            No organizations available
                        </p>
                        <p className="mt-1 font-mono text-[13px] leading-6 text-mute">
                            You can continue to your dashboard. If you expected an organization
                            here, ask your administrator to add your account — or subscribe to
                            create your own.
                        </p>
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="flex flex-col gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-700 dark:text-red-400 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                            <p className="font-mono text-[12.5px] leading-relaxed">
                                {error}
                            </p>
                        </div>
                        {!isSubscriptionActive && (
                            <Link
                                href="/auth/subscriptions"
                                className="xp-btn xp-btn-fill shrink-0 py-1.5 px-3 text-center font-mono text-[12px] sm:w-auto"
                            >
                                Subscribe Now
                            </Link>
                        )}
                    </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    {selectedId && !isSubscriptionActive && (
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => void continueWithoutSelection()}
                            className="xp-btn w-full py-3 text-center font-mono text-[14px] sm:w-auto"
                        >
                            Skip to personal dashboard
                        </button>
                    )}

                    <Link
                        href="/auth/subscriptions"
                        className={
                            hasLoadError || !isSubscriptionActive
                                ? "xp-btn xp-btn-fill w-full py-3 text-center font-mono text-[14px] sm:w-auto"
                                : "xp-btn w-full py-3 text-center font-mono text-[14px] sm:w-auto"
                        }
                    >
                        {isSubscriptionActive ? "Manage Subscription" : "Subscribe"}
                    </Link>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleContinueClick}
                        className="xp-btn xp-btn-fill w-full py-3 font-mono text-[14px] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        {isSubmitting ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : null}
                        {hasOrganizations && selectedId ? "Continue to workspace" : "Continue to dashboard"}
                        {!isSubmitting && (
                            <ChevronRight aria-hidden="true" className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </section>

            <Modal.Window
                open={showConfirmation}
                onClose={() => !isSubmitting && setShowConfirmation(false)}
                closeOnOverlayClick={!isSubmitting}
                closeOnEscape={!isSubmitting}
                hideCloseButton
                className="max-w-md p-6"
                ariaLabelledBy="proceed-confirm-title"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p
                            id="proceed-confirm-title"
                            className="font-sans text-[18px] font-bold text-ink"
                        >
                            Confirm your workspace
                        </p>
                        <p className="mt-2 font-mono text-[13px] leading-6 text-mute">
                            Continue to{" "}
                            <span className="font-semibold text-ink">
                                {selectedOrganization?.name}
                            </span>{" "}
                            as{" "}
                            {formatRoleLabel(
                                selectedOrganization?.organizationRole || role
                            )}
                            ?
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Close confirmation"
                        onClick={() => setShowConfirmation(false)}
                        className="rounded-lg p-1 text-mute transition-colors hover:bg-soft hover:text-ink"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setShowConfirmation(false)}
                        className="xp-btn px-4 py-2.5 font-mono text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => void continueWithSelection()}
                        className="xp-btn xp-btn-fill px-4 py-2.5 font-mono text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : null}
                        Continue
                    </button>
                </div>
            </Modal.Window>
        </main>
    );
}