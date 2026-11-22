"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Link2, UserCheck, X, Loader2, Mail, Hash } from "lucide-react";
import { linkTenant } from "@/app/_lib/action";

export default function LinkTenantToUserButton({
    tenantId,
    tenantName = "Tenant",
    tenantEmail = "",
    linkedUserId = null,
    linkedUserEmail = null,
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [customUserId, setCustomUserId] = useState("");
    const [linked, setLinked] = useState(Boolean(linkedUserId));

    if (linked) {
        return (
            <span
                title={
                    linkedUserEmail
                        ? `Linked to ${linkedUserEmail}`
                        : linkedUserId
                          ? `Linked User ID: ${linkedUserId}`
                          : "Linked to Xpacy user account"
                }
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-500/20 px-3.5 py-2 text-[12.5px] font-medium text-emerald-100 backdrop-blur-sm"
            >
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                User linked
            </span>
        );
    }

    const handleLink = async (e) => {
        e.preventDefault();
        if (!tenantId || isPending) return;

        const trimmedUserId = customUserId.trim();
        const payload = trimmedUserId ? { userId: trimmedUserId } : null;

        setIsPending(true);
        toast.promise(linkTenant(tenantId, payload), {
            loading: "Linking tenant to user account...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                            res?.errors?.[0]?.message ||
                            "Failed to link tenant to user."
                    );
                }
                setLinked(true);
                setOpen(false);
                setCustomUserId("");
                router.refresh();
                return res?.message || "Tenant linked to user account!";
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to link tenant to user.";
            },
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 cursor-pointer"
            >
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                Link to user
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="link-tenant-modal-title"
                    onClick={() => !isPending && setOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-line bg-card p-6 text-left text-ink shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Link2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3
                                        id="link-tenant-modal-title"
                                        className="text-base font-semibold text-ink"
                                    >
                                        Link Tenant to User
                                    </h3>
                                    <p className="text-xs text-mute">
                                        Connect this tenant record to a registered Xpacy user account.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-1.5 text-mute transition-colors hover:bg-soft hover:text-ink cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleLink} className="mt-5 space-y-4">
                            <div className="rounded-xl border border-line bg-soft/60 p-3.5 text-xs space-y-1.5">
                                <p className="font-semibold text-ink">{tenantName}</p>
                                {tenantEmail && (
                                    <p className="flex items-center gap-1.5 text-mute">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        <span>{tenantEmail}</span>
                                    </p>
                                )}
                                <p className="text-[11px] text-mute pt-1">
                                    By default, Xpacy will match and link the registered user account associated with this tenant&apos;s email address.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="link-user-id"
                                    className="flex items-center gap-1.5 text-xs font-semibold text-ink"
                                >
                                    <Hash className="h-3.5 w-3.5 text-mute" />
                                    Specific User ID{" "}
                                    <span className="font-normal text-mute">(optional)</span>
                                </label>
                                <input
                                    id="link-user-id"
                                    type="text"
                                    disabled={isPending}
                                    value={customUserId}
                                    onChange={(e) => setCustomUserId(e.target.value)}
                                    placeholder="Leave blank to match automatically by email"
                                    className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs font-mono text-ink placeholder:font-sans placeholder:text-mute focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => setOpen(false)}
                                    className="rounded-lg border border-line bg-card px-4 py-2 text-xs font-semibold text-mute transition-colors hover:bg-soft hover:text-ink cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isPending ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Link2 className="h-3.5 w-3.5" />
                                    )}
                                    <span>
                                        {isPending ? "Linking..." : "Link User Account"}
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

