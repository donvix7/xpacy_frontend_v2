"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    Trash2,
    UserPlus,
    UserMinus,
    ShieldPlus,
    X,
    Loader2,
    AlertTriangle,
    Percent,
} from "lucide-react";
import {
    archiveProperty,
    addManagerTOProperty,
    deleteManagerFromProperty,
    assignOwnerToProperty,
} from "@/app/_lib/action";

const MANAGER_ROLES = [
    { value: "PROPERTY_MANAGER", label: "Property Manager" },
    { value: "FACILITY_MANAGER", label: "Facility Manager" },
];

function memberDisplayName(m) {
    const u = m?.user || m?.profile || m || {};
    const full = [
        u.firstName || u.firstname || u.first_name,
        u.lastName || u.lastname || u.last_name,
    ]
        .filter(Boolean)
        .join(" ");
    return full || u.name || u.email || "Member";
}

/* -------------------------------------------------------------------------- */
/* 1. Delete / Archive Property                                               */
/* -------------------------------------------------------------------------- */
export function DeletePropertyButton({
    propertyId,
    propertyName = "this property",
    redirectTo = "/dashboard/property-owner/properties",
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleDelete = () => {
        if (!propertyId || isPending) return;
        setIsPending(true);
        toast.promise(archiveProperty(propertyId), {
            loading: "Deleting property...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(res?.message || "Failed to delete property.");
                }
                setOpen(false);
                router.refresh();
                router.push(redirectTo);
                return res?.message || "Property deleted successfully!";
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to delete property.";
            },
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-400/35 bg-red-500/20 px-3.5 py-2 text-[12.5px] font-medium text-red-100 backdrop-blur-sm transition-colors hover:bg-red-500/35 cursor-pointer"
            >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => !isPending && setOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-line bg-card p-6 text-left text-ink shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-ink">
                                        Delete Property
                                    </h3>
                                    <p className="text-xs text-mute">
                                        This will archive and remove the property from active listings.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-1.5 text-mute hover:bg-soft hover:text-ink cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mt-4 rounded-xl border border-line bg-soft/60 p-3.5 text-xs text-ink">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold capitalize">{propertyName}</span>?
                        </p>

                        <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setOpen(false)}
                                className="rounded-lg border border-line bg-card px-4 py-2 text-xs font-semibold text-mute hover:bg-soft hover:text-ink cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer disabled:opacity-60"
                            >
                                {isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                )}
                                <span>{isPending ? "Deleting..." : "Delete Property"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Add Manager to Property                                                 */
/* -------------------------------------------------------------------------- */
export function AddManagerButton({
    propertyId,
    availableMembers = [],
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [userId, setUserId] = useState("");
    const [role, setRole] = useState("FACILITY_MANAGER");

    const members = Array.isArray(availableMembers) ? availableMembers : [];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userId.trim()) {
            toast.error("Please select or enter a user ID.");
            return;
        }
        setIsPending(true);
        toast.promise(
            addManagerTOProperty(propertyId, { userId: userId.trim(), role }),
            {
                loading: "Assigning manager...",
                success: (res) => {
                    setIsPending(false);
                    if (!res?.success) {
                        throw new Error(res?.message || "Failed to add manager.");
                    }
                    setOpen(false);
                    setUserId("");
                    router.refresh();
                    return res?.message || "Manager added to property!";
                },
                error: (err) => {
                    setIsPending(false);
                    return err?.message || "Failed to add manager.";
                },
            }
        );
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink shadow-xs transition-colors hover:border-primary hover:text-primary cursor-pointer"
            >
                <ShieldPlus className="h-3.5 w-3.5" />
                Add manager
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => !isPending && setOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-line bg-card p-6 text-left text-ink shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <ShieldPlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-ink">
                                        Add Manager
                                    </h3>
                                    <p className="text-xs text-mute">
                                        Assign a user to manage this property.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-1.5 text-mute hover:bg-soft hover:text-ink cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            {members.length > 0 ? (
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="manager-user-select"
                                        className="block text-xs font-semibold text-ink"
                                    >
                                        Select Organization Member *
                                    </label>
                                    <select
                                        id="manager-user-select"
                                        disabled={isPending}
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                                    >
                                        <option value="">Choose a member...</option>
                                        {members.map((m, idx) => {
                                            const uid = String(
                                                m?.userId || m?.user?.id || m?.id || ""
                                            );
                                            const email = m?.user?.email || m?.email || "";
                                            if (!uid) return null;
                                            return (
                                                <option key={uid || idx} value={uid}>
                                                    {memberDisplayName(m)}
                                                    {email ? ` (${email})` : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="manager-user-id"
                                        className="block text-xs font-semibold text-ink"
                                    >
                                        User ID *
                                    </label>
                                    <input
                                        id="manager-user-id"
                                        type="text"
                                        disabled={isPending}
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        placeholder="Enter user UUID"
                                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs font-mono text-ink placeholder:font-sans placeholder:text-mute focus:border-primary focus:outline-none"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="manager-role"
                                    className="block text-xs font-semibold text-ink"
                                >
                                    Role *
                                </label>
                                <select
                                    id="manager-role"
                                    disabled={isPending}
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                                >
                                    {MANAGER_ROLES.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => setOpen(false)}
                                    className="rounded-lg border border-line bg-card px-4 py-2 text-xs font-semibold text-mute hover:bg-soft hover:text-ink cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 cursor-pointer disabled:opacity-60"
                                >
                                    {isPending ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <ShieldPlus className="h-3.5 w-3.5" />
                                    )}
                                    <span>{isPending ? "Assigning..." : "Assign Manager"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Remove Manager from Property                                            */
/* -------------------------------------------------------------------------- */
export function RemoveManagerButton({
    propertyId,
    managerId,
    managerName = "this manager",
}) {
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleRemove = () => {
        if (!propertyId || !managerId || isPending) return;
        setIsPending(true);
        toast.promise(deleteManagerFromProperty(propertyId, managerId), {
            loading: `Removing ${managerName}...`,
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(res?.message || "Failed to remove manager.");
                }
                setConfirming(false);
                router.refresh();
                return res?.message || "Manager removed from property!";
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to remove manager.";
            },
        });
    };

    if (confirming) {
        return (
            <div className="inline-flex items-center gap-1.5">
                <button
                    type="button"
                    disabled={isPending}
                    onClick={handleRemove}
                    className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-700 cursor-pointer disabled:opacity-60"
                >
                    {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                    Confirm
                </button>
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setConfirming(false)}
                    className="rounded-md border border-line bg-card px-2 py-1 text-[11px] font-medium text-mute hover:text-ink cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 cursor-pointer"
            title={`Remove ${managerName}`}
        >
            <UserMinus className="h-3.5 w-3.5" />
            Remove
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Add / Assign Owner to Property                                          */
/* -------------------------------------------------------------------------- */
export function AddOwnerButton({
    propertyId,
    availableOwners = [],
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [ownerProfileId, setOwnerProfileId] = useState("");
    const [ownershipPercentage, setOwnershipPercentage] = useState("100");

    const owners = Array.isArray(availableOwners) ? availableOwners : [];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!ownerProfileId.trim()) {
            toast.error("Please select or enter an owner.");
            return;
        }
        const pct = Number(ownershipPercentage);
        if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
            toast.error("Ownership percentage must be between 1 and 100.");
            return;
        }
        setIsPending(true);
        toast.promise(
            assignOwnerToProperty(propertyId, {
                ownerProfileId: ownerProfileId.trim(),
                ownershipPercentage: pct,
            }),
            {
                loading: "Assigning owner...",
                success: (res) => {
                    setIsPending(false);
                    if (!res?.success) {
                        throw new Error(res?.message || "Failed to assign owner.");
                    }
                    setOpen(false);
                    setOwnerProfileId("");
                    setOwnershipPercentage("100");
                    router.refresh();
                    return res?.message || "Owner assigned to property!";
                },
                error: (err) => {
                    setIsPending(false);
                    return err?.message || "Failed to assign owner.";
                },
            }
        );
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary/90 cursor-pointer"
            >
                <UserPlus className="h-3.5 w-3.5" />
                Add owner
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => !isPending && setOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-line bg-card p-6 text-left text-ink shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-ink">
                                        Assign Property Owner
                                    </h3>
                                    <p className="text-xs text-mute">
                                        Link an owner profile and set their ownership stake.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-1.5 text-mute hover:bg-soft hover:text-ink cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            {owners.length > 0 ? (
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="owner-profile-select"
                                        className="block text-xs font-semibold text-ink"
                                    >
                                        Select Owner *
                                    </label>
                                    <select
                                        id="owner-profile-select"
                                        disabled={isPending}
                                        value={ownerProfileId}
                                        onChange={(e) => setOwnerProfileId(e.target.value)}
                                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                                    >
                                        <option value="">Choose an owner...</option>
                                        {owners.map((o, idx) => {
                                            const oid = String(o?.id || o?._id || "");
                                            const email = o?.email || o?.user?.email || "";
                                            if (!oid) return null;
                                            return (
                                                <option key={oid || idx} value={oid}>
                                                    {memberDisplayName(o)}
                                                    {email ? ` (${email})` : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="owner-profile-id"
                                        className="block text-xs font-semibold text-ink"
                                    >
                                        Owner Profile ID *
                                    </label>
                                    <input
                                        id="owner-profile-id"
                                        type="text"
                                        disabled={isPending}
                                        value={ownerProfileId}
                                        onChange={(e) => setOwnerProfileId(e.target.value)}
                                        placeholder="Enter owner profile UUID"
                                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs font-mono text-ink placeholder:font-sans placeholder:text-mute focus:border-primary focus:outline-none"
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="ownership-percentage"
                                    className="flex items-center gap-1.5 text-xs font-semibold text-ink"
                                >
                                    <Percent className="h-3.5 w-3.5 text-mute" />
                                    Ownership Percentage (1 – 100) *
                                </label>
                                <input
                                    id="ownership-percentage"
                                    type="number"
                                    min="1"
                                    max="100"
                                    step="1"
                                    disabled={isPending}
                                    value={ownershipPercentage}
                                    onChange={(e) => setOwnershipPercentage(e.target.value)}
                                    className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs font-mono text-ink focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => setOpen(false)}
                                    className="rounded-lg border border-line bg-card px-4 py-2 text-xs font-semibold text-mute hover:bg-soft hover:text-ink cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 cursor-pointer disabled:opacity-60"
                                >
                                    {isPending ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <UserPlus className="h-3.5 w-3.5" />
                                    )}
                                    <span>{isPending ? "Assigning..." : "Assign Owner"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

