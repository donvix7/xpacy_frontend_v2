"use client"
import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"

import { handleSignup, handlePropertyOwnerSignup } from '@/app/_lib/action';
import FormInput from "./FormInput"
import SpinnerMini from "./SpinnerMini";
import toast from "react-hot-toast"
import { useUser } from "../_context/UserContext"
import ResendOwnerEmail from "./ResendOwnerEmail";
import ReCAPTCHA from "react-google-recaptcha"

export default function SignupForm({ cities, role = "user" }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { setUserData } = useUser()
    const referralCode = searchParams.get("referralCode")
    const [pending, setPending] = useState(false);
    const [captchaValue, setCaptchaValue] = useState(null);
    const recaptchaRef = useRef(null);
    const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm()

    async function onSubmit(data) {
        if (!captchaValue) {
            toast.error("Please verify that you are not a robot.");
            return;
        }

        const registerPayload = {
            email: String(data.email || "").trim(),
            password: data.password,
            firstName: String(data.firstName || "").trim(),
            lastName: String(data.lastName || "").trim(),
            ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
        };

        setPending(true);
        try {
            let response;
            if (role === "property-owner") {
                response = await handlePropertyOwnerSignup(registerPayload, referralCode);
            } else {
                response = await handleSignup(registerPayload, referralCode);
            }

            if (response.success) {
                toast.success(response.message);
                setUserData({ ...(response.user || {}), email: response.user?.email || registerPayload.email });
                reset();
                setCaptchaValue(null);
                recaptchaRef.current?.reset();
                router.push("/auth/verify-email");
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            toast.error(err?.message || "Something went wrong. Please try again.");
        } finally {
            setPending(false);
        }
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
                <FormInput register={register} errors={errors} label={"First Name *"} id={"firstName"}>
                    <input
                        {...register("firstName", { required: "Please enter your first name" })}
                        type="text"
                        name="firstName"
                        id="firstName"
                        placeholder="John"
                        className={`xp-field ${errors.firstName ? "xp-field-error" : ""}`}
                    />
                    {errors.firstName && <span className="-mt-2 text-xs text-error">{errors.firstName.message}</span>}
                </FormInput>
                <FormInput register={register} errors={errors} label={"Last Name *"} id={"lastName"}>
                    <input
                        {...register("lastName", { required: "Please enter your last name" })}
                        type="text"
                        name="lastName"
                        id="lastName"
                        placeholder="Doe"
                        className={`xp-field ${errors.lastName ? "xp-field-error" : ""}`}
                    />
                    {errors.lastName && <span className="-mt-2 text-xs text-error">{errors.lastName.message}</span>}
                </FormInput>
            </div>

            <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
                <FormInput register={register} errors={errors} label={"Email address *"} id={"email"}>
                    <input
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /\S+@\S+\.\S+/,
                                message: "Provide a valid email address",
                            },
                        })}
                        type="email"
                        name="email"
                        id="email"
                        placeholder="john@example.com"
                        className={`xp-field ${errors.email ? "xp-field-error" : ""}`}
                    />
                    {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
                </FormInput>
                <FormInput register={register} errors={errors} label={"Phone Number (Optional)"} id={"phone"}>
                    <input
                        {...register("phone", {
                            pattern: {
                                value: /^\+?[0-9\s\-()]{7,20}$/,
                                message: "Provide a valid phone number (e.g. +1234567890)",
                            },
                        })}
                        type="tel"
                        name="phone"
                        id="phone"
                        placeholder="+1234567890"
                        className={`xp-field ${errors.phone ? "xp-field-error" : ""}`}
                    />
                    {errors.phone && <span className="-mt-2 text-xs text-error">{errors.phone.message}</span>}
                </FormInput>
            </div>

            <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
                <FormInput register={register} errors={errors} label={"Password"} id={"password"}>
                    <input
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 8,
                                message: "Password needs to be 8 characters",
                            },
                        })}
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Enter your password"
                        className={`xp-field ${errors.password ? "xp-field-error" : ""}`}
                    />
                    {errors.password && <span className="-mt-2 text-xs text-error">{errors.password.message}</span>}
                </FormInput>
                <FormInput register={register} errors={errors} label={"Confirm Password"} id={"confirmPassword"}>
                    <input
                        {...register("confirmPassword", {
                            required: "This field is required",
                            validate: (value) => value === getValues().password || "Passwords needs to match",
                        })}
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        className={`xp-field ${errors.confirmPassword ? "xp-field-error" : ""}`}
                    />
                    {errors.confirmPassword && <span className="-mt-2 text-xs text-error">{errors.confirmPassword.message}</span>}
                </FormInput>
            </div>

            {/* <div className=" flex flex-col space-y-2 font-mono">
                <label htmlFor={"location"} className="text-sm text-black">Choose a location</label>
                <SelectCity cities={cities} register={register} errors={errors} />
            </div>*/}

            <div className="flex flex-col gap-1 font-mono">
                <div className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        id="terms"
                        className="mt-0.5 h-4 w-4 shrink-0 accent-side"
                        {...register("terms", { required: "You must agree to the Terms & Conditions" })}
                    />
                    <label htmlFor="terms" className="text-[13.5px] leading-snug text-mute">
                        I agree to Xpacy’s Terms & Conditions and Privacy Policy.
                    </label>
                </div>
                {errors.terms && <span className="text-xs text-error">{errors.terms.message}</span>}
            </div>

            <div className="flex w-full justify-start">
                <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                    onChange={setCaptchaValue}
                />
            </div>

            <button
                type="submit"
                disabled={pending}
                className="xp-btn xp-btn-fill w-full py-3.5 font-mono text-[15px] disabled:cursor-not-allowed disabled:opacity-60"
            >
                <span>Sign Up</span>
                <span>{pending && <SpinnerMini />}</span>
            </button>

            {role === "property-owner" && <ResendOwnerEmail />}
        </form>
    )
}
