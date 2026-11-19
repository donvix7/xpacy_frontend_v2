"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Phone, Calendar, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-gray-50";

const labelClass = "block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500";

const BANKS = [
    { code: "058", name: "GTBank" },
    { code: "044", name: "Access Bank" },
    { code: "011", name: "First Bank of Nigeria" },
    { code: "033", name: "UBA" },
    { code: "057", name: "Zenith Bank" },
    { code: "232", name: "Sterling Bank" },
    { code: "076", name: "Polaris Bank" },
    { code: "082", name: "Keystone Bank" },
    { code: "214", name: "FCMB" },
    { code: "221", name: "Stanbic IBTC" },
    { code: "101", name: "Providus Bank" },
    { code: "999992", name: "OPay" },
    { code: "999991", name: "PalmPay" },
    { code: "999993", name: "Moniepoint" },
    { code: "999994", name: "Kuda" },
];

export default function CreateVirtualAccountForm({
    onCreate,
    defaultFirstName = "",
    defaultLastName = "",
    defaultPhone = "",
    defaultEmail = "",
}) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const payload = {
            firstName: String(formData.get("firstName") || "").trim(),
            lastName: String(formData.get("lastName") || "").trim(),
            phone: String(formData.get("phone") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            bvn: String(formData.get("bvn") || "").trim(),
            dateOfBirth: String(formData.get("dateOfBirth") || "").trim(),
            bankCode: String(formData.get("bankCode") || "").trim(),
        };

        // Basic client-side validation
        if (!payload.firstName || !payload.lastName) {
            setError("First and last name are required.");
            return;
        }
        if (!payload.phone && !payload.email) {
            setError("A phone number or email is required.");
            return;
        }
        if (!payload.bvn || payload.bvn.length !== 11) {
            setError("BVN must be 11 digits.");
            return;
        }
        if (!payload.bankCode) {
            setError("Select your preferred bank.");
            return;
        }

        startTransition(async () => {
            try {
                const result = await onCreate(payload);
                if (result?.success === false || result?.error) {
                    const msg =
                        result?.message ||
                        result?.error ||
                        "Could not create virtual account.";
                    setError(msg);
                    toast.error(msg);
                    return;
                }
                toast.success("Virtual account created.");
                router.refresh();
            } catch (err) {
                const msg =
                    err?.message || "Could not create virtual account.";
                setError(msg);
                toast.error(msg);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="firstName" className={labelClass}>
                        First name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        className={`${inputClass} mt-1.5`}
                        defaultValue={defaultFirstName}
                        placeholder="John"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="lastName" className={labelClass}>
                        Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        className={`${inputClass} mt-1.5`}
                        defaultValue={defaultLastName}
                        placeholder="Doe"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="phone" className={labelClass}>
                        Phone
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className={`${inputClass} mt-1.5`}
                        defaultValue={defaultPhone}
                        placeholder="+234 801 234 5678"
                    />
                </div>
                <div>
                    <label htmlFor="email" className={labelClass}>
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className={`${inputClass} mt-1.5`}
                        defaultValue={defaultEmail}
                        placeholder="john@example.com"
                    />
                </div>
                <div>
                    <label htmlFor="bvn" className={labelClass}>
                        BVN <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="bvn"
                        name="bvn"
                        type="text"
                        inputMode="numeric"
                        maxLength={11}
                        pattern="[0-9]{11}"
                        className={`${inputClass} mt-1.5 font-mono`}
                        placeholder="12345678901"
                        required
                    />
                    <p className="mt-1 text-[10.5px] text-gray-500">
                        11-digit Bank Verification Number
                    </p>
                </div>
                <div>
                    <label htmlFor="dateOfBirth" className={labelClass}>
                        Date of birth
                    </label>
                    <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        className={`${inputClass} mt-1.5`}
                    />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="bankCode" className={labelClass}>
                        Preferred bank <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="bankCode"
                        name="bankCode"
                        className={`${inputClass} mt-1.5`}
                        defaultValue=""
                        required
                    >
                        <option value="" disabled>
                            Select a bank
                        </option>
                        {BANKS.map((bank) => (
                            <option key={bank.code} value={bank.code}>
                                {bank.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50/60 px-3.5 py-3">
                <p className="flex items-start gap-2 text-[11px] text-gray-600">
                    <ShieldCheck
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                        aria-hidden="true"
                    />
                    Your BVN is used only for identity verification. It is
                    encrypted and never shared.
                </p>
            </div>

            <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {pending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                    </>
                ) : (
                    "Create virtual account"
                )}
            </button>
        </form>
    );
}