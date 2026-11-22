"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export default function FundWalletForm({ currency = "NGN" }) {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSelectPreset = (val) => {
        setAmount(String(val));
    };

    const numAmount = Number(amount);
    const isValid = Number.isFinite(numAmount) && numAmount >= 100;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid) return;

        startTransition(async () => {
            try {
                toast.loading("Initializing secure Nomba checkout…", { id: "nomba-checkout" });

                // Simulate session creation or redirect to gateway
                await new Promise((resolve) => setTimeout(resolve, 1200));

                toast.success(
                    `Nomba checkout session initialized for ₦${numAmount.toLocaleString()}!`,
                    { id: "nomba-checkout" }
                );

                // Note: When live backend endpoint is ready, window.location.href = session.checkoutUrl;
            } catch (err) {
                toast.error(err?.message || "Failed to initialize payment", {
                    id: "nomba-checkout",
                });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-[11.5px] font-bold uppercase tracking-wider text-mute">
                    Deposit Amount ({currency})
                </label>
                <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[16px] font-bold text-mute">
                        ₦
                    </span>
                    <input
                        type="number"
                        min="100"
                        step="100"
                        placeholder="e.g. 10,000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full rounded-xl border border-line bg-soft py-2.5 pl-8 pr-4 font-mono text-[16px] font-bold text-ink focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                    />
                </div>
            </div>

            {/* Quick preset chips */}
            <div>
                <p className="text-[11px] font-medium text-mute">Quick Presets</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {PRESET_AMOUNTS.map((val) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => handleSelectPreset(val)}
                            className={`rounded-lg border px-2.5 py-1 font-mono text-[11.5px] font-medium transition-colors ${
                                amount === String(val)
                                    ? "border-primary bg-primary text-white"
                                    : "border-line bg-soft text-ink hover:bg-line/40"
                            }`}
                        >
                            ₦{val.toLocaleString()}
                        </button>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={!isValid || isPending}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[13.5px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting to Nomba…
                    </>
                ) : (
                    <>
                        Pay with Nomba
                        <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </button>
        </form>
    );
}

