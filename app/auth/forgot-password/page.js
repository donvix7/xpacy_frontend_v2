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
            confirm("Requesting password reset for:", data.email);
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
        <div className="xp-auth flex min-h-dvh w-full items-center justify-center bg-canvas px-4 py-10 md:px-6">
            <div className="xp-auth-card flex w-full max-w-md flex-col gap-8 p-6 sm:p-9">
                <div className="self-center">
                    <Logo />
                </div>

                {!isSent ? (
                    <>
                        <div className="flex flex-col gap-2 text-center">
                            <p className="font-sans text-[26px] font-bold leading-tight text-ink">Forgot Password?</p>
                            <p className="font-mono text-[14px] leading-relaxed text-mute">
                                Enter your email address and we&apos;ll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
                                    className={`xp-field ${errors.email ? "xp-field-error" : ""}`} 
                                />
                                {errors.email && <span className="text-xs text-error">{errors.email.message}</span>}
                            </FormInput>

                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="xp-btn xp-btn-fill w-full py-3.5 font-mono text-[15px] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isLoading && <FaSpinner className="animate-spin" />}
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex flex-col gap-6 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-up-bg text-2xl text-up">✓</div>
                        <div className="flex flex-col gap-2">
                            <p className="font-sans text-[26px] font-bold leading-tight text-ink">Check your email</p>
                            <p className="font-mono text-[14px] leading-relaxed text-mute">
                                We have sent a password reset link to your email address.
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsSent(false)} 
                            className="font-mono text-[14px] font-medium text-ink hover:underline"
                        >
                            Click to resend
                        </button>
                    </div>
                )}

                <div className="text-center">
                    <Link href="/auth/log-in" className="inline-flex items-center gap-2 font-mono text-[14px] text-mute transition-colors hover:text-ink">
                        <FaArrowLeft size={12} /> Back to Log In
                    </Link>
                </div>
            </div>
        </div>
    );
}
