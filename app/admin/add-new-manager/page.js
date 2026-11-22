"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import AdminHeader from "@/app/_components/AdminHeader";
import FormInput from "@/app/_components/FormInput";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { invitePropertyManager } from "@/app/_lib/action";

const inputClass = (hasError) =>
    `rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink ${
        hasError ? "border-error" : "border-line"
    }`;

function AddNewManagerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawReturnTo = searchParams?.get("returnTo") || "";
    const backHref =
        rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
            ? rawReturnTo
            : "/dashboard/admin/users";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isPending) return;

        const nextErrors = {};
        if (!name.trim()) nextErrors.name = "Manager name is required";
        if (!email.trim()) nextErrors.email = "Email address is required";
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        const fd = new FormData();
        fd.set("name", name.trim());
        fd.set("email", email.trim());
        if (message.trim()) fd.set("message", message.trim());

        setIsPending(true);
        toast.promise(invitePropertyManager(fd), {
            loading: "Sending manager invitation...",
            success: (res) => {
                setIsPending(false);
                if (res?.success === false) {
                    throw new Error(res?.message || "Failed to invite manager.");
                }
                setName("");
                setEmail("");
                setMessage("");
                router.refresh();
                setTimeout(() => router.push(backHref), 600);
                return res?.message || "Property manager invited successfully!";
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to invite manager.";
            },
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader title="Add Property Manager" backHref={backHref} />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        Invite Property Manager
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        Send an invitation to add a new property manager to your organization.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                >
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Manager Information
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Full Name *" id="name">
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                                    }}
                                    placeholder="e.g. Amina Bello"
                                    className={inputClass(errors.name)}
                                />
                                {errors.name && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.name}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="Email Address *" id="email">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                                    }}
                                    placeholder="manager@company.com"
                                    className={inputClass(errors.email)}
                                />
                                {errors.email && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.email}
                                    </span>
                                )}
                            </FormInput>
                        </div>

                        <FormInput label="Personal Message (Optional)" id="message">
                            <textarea
                                id="message"
                                rows={3}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Add a welcome note to include in the invitation email..."
                                className={`${inputClass(false)} resize-y`}
                            />
                        </FormInput>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-line pt-6">
                        <Link
                            href={backHref}
                            className="w-full sm:w-auto text-center rounded-lg border border-line px-6 py-3 font-mono text-sm font-medium text-ink hover:bg-canvas transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-mono text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer"
                        >
                            {isPending ? (
                                <SpinnerMini />
                            ) : (
                                <UserPlus className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span>{isPending ? "Sending..." : "Send Invitation"}</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default function AddNewManagerPage() {
    return (
        <Suspense fallback={null}>
            <AddNewManagerContent />
        </Suspense>
    );
}
