"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { handleCompleteOwnerRegistration } from "@/app/_lib/action";

// Component to handle the search params logic
function SignUpForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
             toast.error("Password must be at least 8 characters");
             return;
        }

        setIsLoading(true);

        try {
            const response = await handleCompleteOwnerRegistration(formData, token);
            
            if (response?.success) {
                toast.success(response.message || "Account setup complete!");
                router.push("/property-owner/log-in");
            } else {
                toast.error(response?.message || "An error occurred during registration.");
            }
            
        } catch (error) {
            console.error(error);
            toast.error("Failed to complete setup. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
             <div className="text-center">
                <p className="mb-4 font-sans text-xl font-bold text-error">Invalid Link</p>
                <p className="mb-6 font-mono text-[14.5px] text-mute">This registration link is missing a valid token.</p>
                <Link href="/" className="font-mono text-[14px] font-medium text-ink hover:underline">Return Home</Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <label className="font-mono text-[13px] font-medium text-mute">Create Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="xp-field pr-12"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-mute transition-colors hover:text-ink"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="font-mono text-[13px] font-medium text-mute">Confirm Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="xp-field pr-12"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                </div>
            </div>

            <button
                type="button" // preventing default for now until connected
                onClick={handleSubmit}
                disabled={isLoading}
                className="xp-btn xp-btn-fill mt-2 w-full py-3.5 font-mono text-[15px] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isLoading && <FaSpinner className="animate-spin" />}
                {isLoading ? "Setting up..." : "Complete Setup"}
            </button>
            
            <p className="mt-2 text-center font-mono text-[14px] text-mute">
                Already have an account? <Link href="/property-owner/log-in" className="font-bold text-ink hover:underline">Log in</Link>
            </p>
        </form>
    );
}

export default function Page() {
    return (
        <div className="xp-auth grid min-h-dvh grid-cols-1 bg-canvas lg:grid-cols-2">
             {/* Left Text / Branding Side */}
             <div className="relative hidden flex-col justify-center overflow-hidden bg-side p-12 text-white lg:flex">
                <div className="relative z-10 max-w-md">
                     <span className="mb-6 inline-block w-max rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.18em] text-white/80">
                        Xpacy
                     </span>
                     <p className="mb-6 font-sans text-4xl font-bold">Welcome to Xpacy</p>
                     <p className="font-mono text-[15px] leading-relaxed text-side-mute">
                        Complete your property owner account setup to start managing your listings and services.
                     </p>
                </div>
                <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-side-active/30 blur-2xl" />
                <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-side-2/80 blur-2xl" />
             </div>

            {/* Right Form Side */}
            <div className="flex flex-col items-center justify-center px-4 py-10 md:px-6 md:py-12">
                <div className="xp-auth-card flex w-full max-w-md flex-col gap-8 p-6 sm:p-9">
                     <div className="flex flex-col gap-2 text-center lg:text-left">
                        <p className="font-sans text-[28px] font-bold leading-tight text-ink">Finalize Your Account</p>
                        <p className="font-mono text-[14.5px] leading-relaxed text-mute">Set a secure password to access your dashboard.</p>
                    </div>

                    <Suspense fallback={<div className="flex justify-center p-8"><FaSpinner className="animate-spin text-2xl text-ink"/></div>}>
                        <SignUpForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
