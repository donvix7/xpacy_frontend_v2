"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserPlus, Send, X, Loader2 } from "lucide-react";
import {
    assignStaffToMaintenance,
    commentOnMaintenanceRequest,
} from "@/app/_lib/action";

function memberDisplayName(m) {
    const u = m?.user || m?.profile || m || {};
    const full = [
        u.firstName || u.firstname || u.first_name,
        u.lastName || u.lastname || u.last_name,
    ]
        .filter(Boolean)
        .join(" ");
    return full || u.name || u.email || "Team Member";
}

export function AssignStaffButton({
    maintenanceId,
    propertyId = null,
    availableMembers = [],
    currentAssigneeId = "",
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [staffId, setStaffId] = useState(currentAssigneeId || "");

    const members = Array.isArray(availableMembers) ? availableMembers : [];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!staffId.trim()) {
            toast.error("Please select or enter a staff member.");
            return;
        }
        setIsPending(true);
        toast.promise(
            assignStaffToMaintenance(
                maintenanceId,
                { assignedTo: staffId.trim() },
                propertyId
            ),
            {
                loading: "Assigning staff...",
                success: (res) => {
                    setIsPending(false);
                    if (!res?.success) {
                        throw new Error(
                            res?.message || "Failed to assign staff."
                        );
                    }
                    setOpen(false);
                    router.refresh();
                    return res?.message || "Staff assigned successfully!";
                },
                error: (err) => {
                    setIsPending(false);
                    return err?.message || "Failed to assign staff.";
                },
            }
        );
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 cursor-pointer"
            >
                <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                Assign Staff
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
                                        Assign Staff Member
                                    </h3>
                                    <p className="text-xs text-mute">
                                        Select a team member to handle this maintenance request.
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
                                        htmlFor="maintenance-staff-select"
                                        className="block text-xs font-semibold text-ink"
                                    >
                                        Staff Member *
                                    </label>
                                    <select
                                        id="maintenance-staff-select"
                                        disabled={isPending}
                                        value={staffId}
                                        onChange={(e) => setStaffId(e.target.value)}
                                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                                    >
                                        <option value="">Choose a staff member...</option>
                                        {members.map((m, idx) => {
                                            const uid = String(
                                                m?.userId || m?.user?.id || m?.id || ""
                                            );
                                            const email =
                                                m?.user?.email || m?.email || "";
                                            if (!uid) return null;
                                            return (
                                                <option key={`${uid}-${idx}`} value={uid}>
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
                                        htmlFor="maintenance-staff-id"
                                        className="block text-xs font-semibold text-ink"
                                    >
                                        Staff User ID *
                                    </label>
                                    <input
                                        id="maintenance-staff-id"
                                        type="text"
                                        disabled={isPending}
                                        value={staffId}
                                        onChange={(e) => setStaffId(e.target.value)}
                                        placeholder="Enter staff user UUID"
                                        className="w-full rounded-lg border border-line bg-card px-3.5 py-2.5 text-xs font-mono text-ink placeholder:font-sans placeholder:text-mute focus:border-primary focus:outline-none"
                                    />
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
                                        {isPending ? "Assigning..." : "Assign Staff"}
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

export function AddMaintenanceCommentForm({
    maintenanceId,
    propertyId = null,
}) {
    const router = useRouter();
    const [comment, setComment] = useState("");
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim() || isPending) return;

        setIsPending(true);
        toast.promise(
            commentOnMaintenanceRequest(
                maintenanceId,
                { content: comment.trim() },
                propertyId
            ),
            {
                loading: "Posting comment...",
                success: (res) => {
                    setIsPending(false);
                    if (!res?.success) {
                        throw new Error(
                            res?.message || "Failed to post comment."
                        );
                    }
                    setComment("");
                    router.refresh();
                    return res?.message || "Comment posted!";
                },
                error: (err) => {
                    setIsPending(false);
                    return err?.message || "Failed to post comment.";
                },
            }
        );
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col gap-3 border-t border-line pt-4"
        >
            <textarea
                rows={3}
                disabled={isPending}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a status update, technician note, or comment..."
                className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-mute focus:border-primary focus:outline-none resize-y"
            />
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending || !comment.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                    {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>{isPending ? "Posting..." : "Post Comment"}</span>
                </button>
            </div>
        </form>
    );
}

