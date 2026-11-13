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

        setPending(true);
        try {
            let response;
            if (role === "property-owner") {
                response = await handlePropertyOwnerSignup(data, referralCode);
            } else {
                response = await handleSignup(data, referralCode);
            }

            if (response.success) {
                toast.success(response.message);
                setUserData({ ...(response.user || {}), email: response.user?.email || data.email });
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
                <FormInput register={register} errors={errors} label={"First Name"} id={"firstname"}>
                    <input
                        {...register("firstname", { required: "Please enter your first name" })}
                        type="text"
                        name="firstname"
                        id="firstname"
                        placeholder="Enter your first name"
                        className={`xp-field ${errors.firstname ? "xp-field-error" : ""}`}
                    />
                    {errors.firstname && <span className="-mt-2 text-xs text-error">{errors.firstname.message}</span>}
                </FormInput>
                <FormInput register={register} errors={errors} label={"Last Name"} id={"lastname"}>
                    <input
                        {...register("lastname", { required: "Please enter your lastname" })}
                        type="text"
                        name="lastname"
                        id="lastname"
                        placeholder="Enter your last name"
                        className={`xp-field ${errors.lastname ? "xp-field-error" : ""}`}
                    />
                    {errors.lastname && <span className="-mt-2 text-xs text-error">{errors.lastname.message}</span>}
                </FormInput>
            </div>

            <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
                <FormInput register={register} errors={errors} label={"Email address"} id={"email"}>
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
                        placeholder="Enter your email address"
                        className={`xp-field ${errors.email ? "xp-field-error" : ""}`}
                    />
                    {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
                </FormInput>
                <FormInput register={register} errors={errors} label={"Phone Number"} id={"phoneNumber"}>
                    <input
                        {...register("phoneNumber", {
                            required: "Phone number is required",
                            pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Provide a valid phone number",
                            },
                        })}
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="Enter your phone number"
                        className={`xp-field ${errors.phoneNumber ? "xp-field-error" : ""}`}
                    />
                    {errors.phoneNumber && <span className="-mt-2 text-xs text-error">{errors.phoneNumber.message}</span>}
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
