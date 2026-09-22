"use client"
import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams } from "next/navigation"

import { handleSignup, handlePropertyOwnerSignup } from '@/app/_lib/action';
import FormInput from "./FormInput"
import SpinnerMini from "./SpinnerMini";
import toast from "react-hot-toast"
import { useUser } from "../_context/UserContext"
import ResendOwnerEmail from "./ResendOwnerEmail";
import ReCAPTCHA from "react-google-recaptcha"

export default function SignupForm({ cities, role = "user" }) {
    const searchParams = useSearchParams();
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
                if (role !== "property-owner") setUserData(response.user);
                reset();
                setCaptchaValue(null);
                recaptchaRef.current?.reset();
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
        <form className="space-y-6 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                <FormInput register={register} errors={errors} label={"First Name"} id={"firstname"}>
                    <input
                        {...register("firstname", { required: "Please enter your first name" })}
                        type="text"
                        name="firstname"
                        id="firstname"
                        placeholder="Enter your first name"
                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.firstname ? "border-error" : "border-primary-200"}`}
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
                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lastname ? "border-error" : "border-primary-200"}`}
                    />
                    {errors.lastname && <span className="-mt-2 text-xs text-error">{errors.lastname.message}</span>}
                </FormInput>
            </div>

            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
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
                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.email ? "border-error" : "border-primary-200"}`}
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
                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.phoneNumber ? "border-error" : "border-primary-200"}`}
                    />
                    {errors.phoneNumber && <span className="-mt-2 text-xs text-error">{errors.phoneNumber.message}</span>}
                </FormInput>
            </div>

            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
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
                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.password ? "border-error" : "border-primary-200"}`}
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
                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.confirmPassword ? "border-error" : "border-primary-200"}`}
                    />
                    {errors.confirmPassword && <span className="-mt-2 text-xs text-error">{errors.confirmPassword.message}</span>}
                </FormInput>
            </div>

            {/* <div className=" flex flex-col space-y-2 font-mono">
                <label htmlFor={"location"} className="text-sm text-black">Choose a location</label>
                <SelectCity cities={cities} register={register} errors={errors} />
            </div>*/}

            <div className="flex flex-col gap-1 font-mono -mt-2">
                <div className="flex items-center gap-1">
                    <input
                        type="checkbox"
                        id="terms"
                        className="w-6 h-6"
                        {...register("terms", { required: "You must agree to the Terms & Conditions" })}
                    />
                    <label htmlFor="terms" className="text-base text-black">
                        I agree to Xpacy’s Terms & Conditions and Privacy Policy.
                    </label>
                </div>
                {errors.terms && <span className="text-xs text-error">{errors.terms.message}</span>}
            </div>

            <div className="flex justify-start w-full my-4">
                <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                    onChange={setCaptchaValue}
                />
            </div>

            <button
                type="submit"
                disabled={pending}
                className="bg-primary text-white cursor-pointer px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md disabled:bg-gray-900 disabled:cursor-not-allowed"
            >
                <span>Sign Up</span>
                <span>{pending && <SpinnerMini />}</span>
            </button>

            {role === "property-owner" && <ResendOwnerEmail />}
        </form>
    )
}