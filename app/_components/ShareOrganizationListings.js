"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Link2, Share2, Sparkles, X } from "lucide-react";

export default function ShareOrganizationListings({ organizationId, inHeader = false }) {
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("info"); // "success" | "error" | "info"
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);

    const listingsPath = `/listings?organizationId=${encodeURIComponent(organizationId)}`;
    const getListingsUrl = () =>
        typeof window !== "undefined" ? `${window.location.origin}${listingsPath}` : listingsPath;

    /* ------------------------------------------------------------------ */
    /* Lock scroll & close on Escape when modal is open                    */
    /* ------------------------------------------------------------------ */
    useEffect(() => {
        if (!isOpen) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKey = (e) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", onKey);

        return () => {
            document.body.style.overflow = original;
            window.removeEventListener("keydown", onKey);
        };
    }, [isOpen]);

    /* Auto-dismiss the success "copied" checkmark after 2s */
    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(t);
    }, [copied]);

    const copyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(getListingsUrl());
            setCopied(true);
            setMessageType("success");
            setMessage("Invite link copied — you can now send it to your guest.");
        } catch {
            setMessageType("error");
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
            setSharing(true);
            try {
                await navigator.share(shareData);
                setMessageType("success");
                setMessage("Invite link shared.");
            } catch (error) {
                if (error?.name !== "AbortError") {
                    setMessageType("error");
                    setMessage("Sharing was unavailable. Copy the link to send it manually.");
                }
            } finally {
                setSharing(false);
            }
            return;
        }

        const subject = encodeURIComponent("Explore our property listings");
        const body = encodeURIComponent(`View properties listed by our organization: ${url}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    /* ------------------------------------------------------------------ */
    /* The invite panel (shared between inline & modal)                    */
    /* ------------------------------------------------------------------ */
    const invitePanel = (
        <section className="overflow-hidden rounded-2xl  bg-white shadow-xl shadow-primary/5">
            {/* ---- Header ---- */}
            <div className="relative overflow-hidden bg-primary-900 px-6 py-6 sm:px-8 sm:py-7">
                

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        
                        <div>
                            <h2 className="font-sans text-lg font-bold leading-tight text-white sm:text-xl">
                                Invite people to explore your listings
                            </h2>
                            <p className="mt-1 max-w-md font-mono text-xs text-white/80 sm:text-sm">
                                Share a link that opens the public listings page, filtered to your organization.
                            </p>
                        </div>
                    </div>

                  
                </div>
            </div>

            {/* ---- Body ---- */}
            <div className="px-6 py-6 sm:px-8 sm:py-7">
                {/* Steps */}
                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        { n: 1, title: "Preview", body: "Check the organization’s public listings page." },
                        { n: 2, title: "Send the link", body: "Copy it or use your device’s share options." },
                        { n: 3, title: "They explore", body: "The link opens listings filtered to this organization." },
                    ].map((step) => (
                        <div
                            key={step.n}
                            className="group relative rounded-xl border border-primary-100 bg-primary-50/50 p-4 transition-colors hover:border-primary-200 hover:bg-primary-50"
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-sans text-xs font-bold text-white">
                                    {step.n}
                                </span>
                                <span className="font-sans text-sm font-bold text-primary">
                                    {step.title}
                                </span>
                            </div>
                            <p className="font-mono text-xs leading-relaxed text-gray-600">
                                {step.body}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Link preview + actions */}
                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/60 p-3 sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                            <Link2 size={15} className="shrink-0 text-gray-400" />
                            <code className="min-w-0 flex-1 truncate font-mono text-xs text-gray-700">
                                {getListingsUrl()}
                            </code>
                        </div>

                        <div className="flex shrink-0 gap-2">
                            <button
                                type="button"
                                onClick={copyInviteLink}
                                aria-label="Copy invite link"
                                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-mono text-sm font-semibold transition-all sm:flex-initial ${
                                    copied
                                        ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                                        : "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary/30"
                                }`}
                            >
                                {copied ? <Check size={15} /> : <Copy size={15} />}
                                <span className="sm:hidden">{copied ? "Copied" : "Copy"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={shareInviteLink}
                                disabled={sharing}
                                aria-label="Share listings link"
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm font-semibold text-gray-700 transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary disabled:opacity-60 sm:flex-initial"
                            >
                                <Share2 size={15} />
                                <span className="sm:hidden">{sharing ? "Sharing…" : "Share"}</span>
                            </button>
                        </div>
                    </div>

                    {message && (
                        <p
                            role="status"
                            className={`mt-3 flex items-start gap-1.5 font-mono text-xs ${
                                messageType === "success"
                                    ? "text-green-700"
                                    : messageType === "error"
                                    ? "text-red-600"
                                    : "text-gray-600"
                            }`}
                        >
                            {messageType === "success" && <Check size={14} className="mt-0.5 shrink-0" />}
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );

    /* ------------------------------------------------------------------ */
    /* Header trigger + modal                                              */
    /* ------------------------------------------------------------------ */
    if (inHeader) {
        return (
            <>
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-900 px-3.5 py-2.5 font-sans text-sm font-semibold text-white transition-all  hover:bg-primary-700 "
                >
                    <Share2
                        size={16}
                        className="transition-transform group-hover:rotate-12"
                    />
                    <span className="hidden sm:inline">Share Listings</span>
                    <span className="sm:hidden">Share</span>
                </button>

                {isOpen && (
                    <div
                        className="fixed inset-0 z-[11000] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_180ms_ease-out]"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) setIsOpen(false);
                        }}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Share organization listings"
                            className="relative w-full max-w-2xl animate-[scaleIn_200ms_ease-out]"
                        >
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close sharing dialog"
                                className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm transition-all hover:rotate-90 hover:bg-white/25"
                            >
                                <X size={18} />
                            </button>
                            {invitePanel}
                        </div>
                    </div>
                )}
            </>
        );
    }

    return invitePanel;
}
