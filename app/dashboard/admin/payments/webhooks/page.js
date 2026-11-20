import Link from "next/link";
import { ChevronLeft, ArrowUpRight, ShieldCheck, FileCode } from "lucide-react";
import HeroBand from "@/app/_components/HeroBand";
import NombaWebhookWorkflowClient from "@/app/_components/NombaWebhookWorkflowClient";

export const metadata = {
    title: "Nomba Webhooks & Workflow | Admin Dashboard",
    description: "Manage and test the Nomba payment gateway webhooks for wallet funding and subscriptions.",
};

export default function NombaWebhooksPage() {
    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const heroStats = [
        {
            label: "Provider",
            value: "Nomba MFB",
            hint: "Nombank / Kudi Core",
        },
        {
            label: "Endpoint Status",
            value: "Listening",
            hint: "200 OK Handlers",
        },
        {
            label: "Workflows",
            value: "3 Active",
            hint: "Wallet, Subscriptions, Dunning",
        },
        {
            label: "Signature",
            value: "HMAC SHA512",
            hint: "x-nomba-signature",
        },
    ];

    return (
        <div className="space-y-6 p-2 sm:p-4">
            {/* Back link */}
            <Link
                href="/dashboard/admin/payments"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-mute transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to subscription payments
            </Link>

            {/* Hero Header */}
            <HeroBand
                tagline={`Admin console · ${today}`}
                title="Nomba Webhooks & Automation"
                description="Live workflow engine processing Nomba inbound webhooks for dedicated virtual accounts, customer wallet funding, and recurring organization subscriptions."
                stats={heroStats}
                actions={
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/admin/wallet/settings"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                        >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Virtual accounts
                        </Link>
                    </div>
                }
            />

            {/* Interactive Client Hub */}
            <NombaWebhookWorkflowClient />
        </div>
    );
}

