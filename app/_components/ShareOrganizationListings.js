"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";

export default function ShareOrganizationListings({ organizationId, inHeader = false }) {
    const [message, setMessage] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const listingsPath = `/listings?organizationId=${encodeURIComponent(organizationId)}`;
    const getListingsUrl = () => `${window.location.origin}${listingsPath}`;

    const copyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(getListingsUrl());
            setMessage("Invite link copied. You can now send it to your guest.");
        } catch {
            setMessage("Could not copy the link. Open the listings page and copy its address.");
        }
    };

    const shareInviteLink = async () => {
        const url = getListingsUrl();
        const shareData = {
            title: "Explore our property listings",
            text: "View properties listed by our organization.",
            url,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                setMessage("Invite link shared.");
            } catch (error) {
                if (error?.name !== "AbortError") setMessage("Sharing was unavailable. Copy the link to send it manually.");
            }
            return;
        }

        const subject = encodeURIComponent("Explore our property listings");
        const body = encodeURIComponent(`View properties listed by our organization: ${url}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const invitePanel = (
        <section className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                    <p className="text-lg font-semibold text-gray-900">Invite people to explore your listings</p>
                    <p className="mt-1 text-sm text-gray-600">
                        Share a link to the listings page for your current organization. Visitors will see properties associated with that organization.
                    </p>
                </div>
                <Link
                    href={listingsPath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-primary-200 px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50"
                >
                    Preview listings <ExternalLink size={16} />
                </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-primary-50 p-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary-700">1. Preview</span>
                    <p className="mt-1 text-sm text-gray-700">Check the organization’s public listings page.</p>
                </div>
                <div className="rounded-xl bg-primary-50 p-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary-700">2. Send the link</span>
                    <p className="mt-1 text-sm text-gray-700">Copy it or use your device’s share options.</p>
                </div>
                <div className="rounded-xl bg-primary-50 p-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary-700">3. They explore</span>
                    <p className="mt-1 text-sm text-gray-700">The link opens listings filtered to this organization.</p>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                <code className="min-w-0 truncate text-xs text-gray-600">{listingsPath}</code>
                <div className="flex shrink-0 gap-2">
                    <button
                        type="button"
                        onClick={copyInviteLink}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                        {message.startsWith("Invite link copied") ? <Check size={16} /> : <Copy size={16} />}
                        Copy invite link
                    </button>
                    <button
                        type="button"
                        onClick={shareInviteLink}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Share2 size={16} /> Share
                    </button>
                </div>
            </div>
            {message && <p role="status" className="mt-2 text-sm text-gray-600">{message}</p>}
        </section>
    );

    if (inHeader) {
        return (
            <>
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                    <Share2 size={16} />
                    <span className="hidden sm:inline">Share Listings</span>
                    <span className="sm:hidden">Share</span>
                </button>
                {isOpen && (
                    <div
                        className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/50 p-4"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) setIsOpen(false);
                        }}
                    >
                        <div role="dialog" aria-modal="true" aria-label="Share organization listings" className="w-full max-w-3xl">
                            <div className="mb-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow"
                                >
                                    Close
                                </button>
                            </div>
                            {invitePanel}
                        </div>
                    </div>
                )}
            </>
        );
    }

    return invitePanel;
}
