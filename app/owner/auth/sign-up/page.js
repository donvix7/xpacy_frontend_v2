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
                <h3 className="text-xl font-bold text-red-600 mb-4">Invalid Link</h3>
                <p className="text-gray-600 mb-6">This registration link is missing a valid token.</p>
                <Link href="/" className="text-primary hover:underline">Return Home</Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Create Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors pr-12"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors pr-12"
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
                className="bg-primary text-white p-4 rounded-lg font-bold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 mt-2"
            >
                {isLoading && <FaSpinner className="animate-spin" />}
                {isLoading ? "Setting up..." : "Complete Setup"}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
                Already have an account? <Link href="/property-owner/log-in" className="text-primary font-bold hover:underline">Log in</Link>
            </p>
        </form>
    );
}

export default function Page() {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
             {/* Left Text / Branding Side (Optional, matching typical auth layouts) */}
             <div className="bg-primary-900 hidden lg:flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-md text-center">
                     <h1 className="text-4xl font-bold mb-6">Welcome to Xpacy</h1>
                     <p className="text-primary-100 text-lg">
                        Complete your property owner account setup to start managing your listings and services.
                     </p>
                </div>
                {/* Decorative circles/elements if needed */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/pattern.png')] bg-cover"></div>
             </div>

            {/* Right Form Side */}
            <div className="flex flex-col justify-center items-center p-6 lg:p-12 bg-white">
                <div className="w-full max-w-md flex flex-col gap-8">
                     <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Finalize Your Account</h2>
                        <p className="text-gray-500">Set a secure password to access your dashboard.</p>
                    </div>

                    <Suspense fallback={<div className="flex justify-center p-8"><FaSpinner className="animate-spin text-primary text-2xl"/></div>}>
                        <SignUpForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
