"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserPlus, X, Loader2, Percent } from "lucide-react";
import { addOwner, assignOwnerToProperty } from "@/app/_lib/action";

export default function CreateOwnerProfileButton({
    propertyId,
    propertyName = "this property",
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [notes, setNotes] = useState("");
    const [assignToProperty, setAssignToProperty] = useState(true);
    const [ownershipPercentage, setOwnershipPercentage] = useState("100");

    const resetForm = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setCompanyName("");
        setNotes("");
        setAssignToProperty(true);
        setOwnershipPercentage("100");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isPending) return;

        if (!firstName.trim() || !lastName.trim()) {
            toast.error("First name and last name are required.");
            return;
        }
        if (!email.trim()) {
            toast.error("Email address is required.");
            return;
        }
        if (!phone.trim()) {
            toast.error("Phone number is required.");
            return;
        }

        const pct = Number(ownershipPercentage);
        if (assignToProperty && (!Number.isFinite(pct) || pct <= 0 || pct > 100)) {
            toast.error("Ownership percentage must be between 1 and 100.");
            return;
        }

        const createAndOptionallyAssign = async () => {
            const createRes = await addOwner(
                {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    address: address.trim(),
                    companyName: companyName.trim(),
                    notes: notes.trim(),
                },
                propertyId
            );

            if (!createRes?.success) {
                throw new Error(
                    createRes?.message || "Failed to create owner profile."
                );
            }

            const createdId =
                createRes?.data?.id ||
                createRes?.data?._id ||
                createRes?.data?.ownerProfileId ||
                null;

            if (assignToProperty && propertyId && createdId) {
                const assignRes = await assignOwnerToProperty(propertyId, {
                    ownerProfileId: createdId,
                    ownershipPercentage: pct,
                });
                if (!assignRes?.success) {
                    return {
                        success: true,
                        message: `Owner profile created, but could not auto-assign: ${assignRes?.message || "assign manually."}`,
                    };
                }
                return {
                    success: true,
                    message: "Owner profile created and assigned to property!",
                };
            }

            return createRes;
        };

        setIsPending(true);
        toast.promise(createAndOptionallyAssign(), {
            loading: assignToProperty
                ? "Creating & assigning owner profile..."
                : "Creating owner profile...",
            success: (res) => {
                setIsPending(false);
                resetForm();
                setOpen(false);
                router.refresh();
                return res?.message || "Owner profile created successfully!";
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to create owner profile.";
            },
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
            >
                <UserPlus className="h-3.5 w-3.5" />
                Create owner profile
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => !isPending && setOpen(false)}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-card p-6 text-left text-ink shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-ink">
                                        Create Owner Profile
                                    </h3>
                                    <p className="text-xs text-mute">
                                        Create a new property owner profile and link them to {propertyName}.
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
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="new-owner-first-name"
                                        className="block text-xs font-semibold text-ink"
                                    >
                                        First Name *
                                    </label>
                                    <input
                                        id="new-owner-first-name"
                                        type="text"
                                        required
                                        disabled={isPending}
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="e.g. Chinedu"
                                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="new-owner-last-name"
                                        className="block text-xs font-semibold text-ink"
                                    >
                                        Last Name *
                                    </label>
                                    <input
                                        id="new-owner-last-name"
                                        type="text"
                                        required
                                        disabled={isPending}
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="e.g. Okafor"
                                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="new-owner-email"
                                        className="block text-xs font-semibold text-ink"
                                    >
                                        Email Address *
                                    </label>
                                    <input
                                        id="new-owner-email"
                                        type="email"
                                        required
                                        disabled={isPending}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="owner@company.com"
                                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="new-owner-phone"
                                        className="block text-xs font-semibold text-ink"
                                    >
                                        Phone Number *
                                    </label>
                                    <input
                                        id="new-owner-phone"
                                        type="tel"
                                        required
                                        disabled={isPending}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+234 800 000 0000"
                                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="new-owner-address"
                                        className="block text-xs font-semibold text-ink"
                                    >
                                        Address
                                    </label>
                                    <input
                                        id="new-owner-address"
                                        type="text"
                                        disabled={isPending}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Lekki Phase 1, Lagos"
                                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="new-owner-company"
                                        className="block text-xs font-semibold text-ink"
                                    >
                                        Company Name
                                    </label>
                                    <input
                                        id="new-owner-company"
                                        type="text"
                                        disabled={isPending}
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Optional"
                                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="new-owner-notes"
                                    className="block text-xs font-semibold text-ink"
                                >
                                    Notes
                                </label>
                                <textarea
                                    id="new-owner-notes"
                                    rows={2}
                                    disabled={isPending}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any additional notes about this owner..."
                                    className="w-full rounded-lg border border-line bg-card px-3.5 py-2 text-xs text-ink focus:border-primary focus:outline-none resize-y"
                                />
                            </div>

                            {propertyId && (
                                <div className="space-y-3 rounded-xl border border-line bg-soft/50 p-3.5">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={assignToProperty}
                                            disabled={isPending}
                                            onChange={(e) =>
                                                setAssignToProperty(e.target.checked)
                                            }
                                            className="h-4 w-4 rounded border-line accent-primary"
                                        />
                                        <span>Also assign this owner to {propertyName}</span>
                                    </label>

                                    {assignToProperty && (
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="new-owner-pct"
                                                className="flex items-center gap-1.5 text-xs font-semibold text-ink"
                                            >
                                                <Percent className="h-3.5 w-3.5 text-mute" />
                                                Ownership Percentage (1 – 100) *
                                            </label>
                                            <input
                                                id="new-owner-pct"
                                                type="number"
                                                min="1"
                                                max="100"
                                                step="1"
                                                disabled={isPending}
                                                value={ownershipPercentage}
                                                onChange={(e) =>
                                                    setOwnershipPercentage(e.target.value)
                                                }
                                                className="w-full rounded-lg border border-line bg-card px-3.5 py-2 text-xs font-mono text-ink focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

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
                                    <span>
                                        {isPending
                                            ? "Saving..."
                                            : assignToProperty
                                              ? "Create & Assign Owner"
                                              : "Create Owner Profile"}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

