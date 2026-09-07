"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { resendPropertyOwnerRegistrationEmail } from "../_lib/action";
import SpinnerMini from "./SpinnerMini";

export default function ResendOwnerEmail() {
    const [isOpen, setIsOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    async function onSubmit(data) {
        startTransition(async () => {
            const response = await resendPropertyOwnerRegistrationEmail(data.email);
            if (response.success) {
                toast.success(response.message);
                reset();
                setIsOpen(false);
            } else {
                toast.error(response.message);
            }
        });
    }

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)} 
                className="text-primary text-sm font-semibold underline mt-4 hover:text-primary-800 transition-colors"
            >
                Didn&apos;t receive code or email? Resend
            </button>
        );
    }

    return (
        <div className="mt-6 p-4 border border-primary-100 rounded-lg bg-primary-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800">Resend Registration Email</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 text-xs hover:text-gray-700">Cancel</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                <div>
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
                        className={`w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 ${errors.email ? "border-red-500" : "border-gray-300"}`} 
                    />
                    {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
                </div>
                <button 
                    type="submit" 
                    disabled={pending} 
                    className="bg-primary text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    <span>Resend Email</span>
                    {pending && <SpinnerMini />}
                </button>
            </form>
        </div>
    );
}
