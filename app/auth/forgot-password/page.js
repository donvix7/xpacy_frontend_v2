"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import Logo from "@/app/_components/Logo";
import FormInput from "@/app/_components/FormInput";

export default function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Simulate API call
            console.log("Requesting password reset for:", data.email);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setIsSent(true);
            toast.success("Reset link sent to your email!");
            reset();
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 flex flex-col gap-8">
                <div className="self-center">
                    <Logo />
                </div>

                {!isSent ? (
                    <>
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                            <p className="text-gray-500 text-sm">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                            <FormInput register={register} errors={errors} label={"Email address"} id={"email"}>
                                <input 
                                    {...register("email", {
                                        required: "Email is required", 
                                        pattern: {
                                            value: /\S+@\S+\.\S+/,
                                            message: "Provide a valid email address",
                                        }
                                    })} 
                                    type="email" 
                                    placeholder="Enter your email address" 
                                    className={`w-full rounded-lg border bg-gray-50 px-4 py-3 focus:outline-none focus:border-primary ${errors.email ? "border-red-500" : "border-gray-200"}`} 
                                />
                                {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
                            </FormInput>

                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading && <FaSpinner className="animate-spin" />}
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-2xl">
                            ✓
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
                            <p className="text-gray-500 text-sm">
                                We have sent a password reset link to your email address.
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsSent(false)} 
                            className="text-primary font-medium hover:underline text-sm"
                        >
                            Click to resend
                        </button>
                    </div>
                )}

                <div className="text-center">
                    <Link href="/auth/log-in" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors">
                        <FaArrowLeft size={12} /> Back to Log In
                    </Link>
                </div>
            </div>
        </div>
    );
}
