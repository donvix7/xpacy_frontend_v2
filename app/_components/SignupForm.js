"use client"
import Link from "next/link"
import { useTransition, useState } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams } from "next/navigation"

import { handleSignup, handlePropertyOwnerSignup } from '@/app/_lib/action';
import FormInput from "./FormInput"
import SelectCity from "./SelectCity";
import SpinnerMini from "./SpinnerMini";
import toast from "react-hot-toast"
import { useUser } from "../_context/UserContext"
import ResendOwnerEmail from "./ResendOwnerEmail";
import ReCAPTCHA from "react-google-recaptcha"

export default function SignupForm({ cities, role = "user" }) {
    const searchParams = useSearchParams();
    const { userData, setUserData } = useUser()
    const referralCode = searchParams.get("referralCode")
    const [pending, startTransition] = useTransition();
    const [captchaValue, setCaptchaValue] = useState(null);
    const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm()
    async function onSubmit(data) {
        if (!captchaValue) {
            toast.error("Please verify that you are not a robot.");
            return;
        }
        startTransition(async () => {
             let response;
            if (role === "property-owner") {
                response = await handlePropertyOwnerSignup(data, referralCode);
            } else {
                response = await handleSignup(data, referralCode);
            }
            
            if (response.success) {
                toast.success(response.message)
                if (role !== "property-owner") setUserData(response.user) // Only set user context for regular users for now
                reset();
            };
            if (!response.success) toast.error(response.message);
        });
    }
    return (
        <form className="space-y-6 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                <FormInput label={"First Name"} id={"firstname"} >
                    <input {...register("firstname", {
                        required: "Please enter your first name"
                    })} type={"text"} name={"firstname"} id={"firstname"} placeholder={"Enter your first name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.firstname ? "border-error" : "border-primary-200"}`} />
                    {errors.firstname && <span className="-mt-2 text-xs text-error">{errors.firstname.message}</span>}
                </FormInput>
                <FormInput label={"Last Name"} id={"lastname"} >
                    <input {...register("lastname", {
                        required: "Please enter your lastname"
                    })} type={"text"} name={"lastname"} id={"lastname"} placeholder={"Enter your last name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lastname ? "border-error" : "border-primary-200"}`} />
                    {errors.lastname && <span className="-mt-2 text-xs text-error">{errors.lastname.message}</span>}
                </FormInput>
            </div>
            <FormInput register={register} errors={errors} label={"Email address"} id={"email"} >
                <input {...register("email", {
                    required: "Email is required", pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Provide a valid email address",
                    }
                })} type={"email"} name={"email"} id={"email"} placeholder={"Enter your email address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.email ? "border-error" : "border-primary-200"}`} />
                {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
            </FormInput>
            <FormInput label={"Password"} id={"pasword"} >
                <input {...register("password", {
                    required: "Password is required", minLength: {
                        value: 8,
                        message: "Password needs to be 8 characters"
                    }
                })} type={"password"} name={"password"} id={"password"} placeholder={"Enter your password"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.password ? "border-error" : "border-primary-200"}`} />
                {errors.password && <span className="-mt-2 text-xs text-error">{errors.password.message}</span>}
            </FormInput>
            <FormInput label={"Confirm Password"} id={"confirmPasword"} >
                <input {...register("confirmPassword", {
                    required: "This field is required",
                    validate: (value) => value === getValues().password || "Passwords needs to match",
                })} type={"password"} name={"confirmPassword"} id={"confirmPassword"} placeholder={"Confirm your password"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.confirmPassword ? "border-error" : "border-primary-200"}`} />
                {errors.confirmPassword && <span className="-mt-2 text-xs text-error">{errors.confirmPassword.message}</span>}
            </FormInput>
            <div className=" flex flex-col space-y-2 font-mono">
                <label htmlFor={"location"} className="text-sm text-black">Choose a location</label>
                <SelectCity cities={cities} register={register} errors={errors} />
            </div>
            <div className="flex items-center gap-1 font-mono -mt-2">
                <input type="checkbox" id="checkbox" className="w-6 h-6" />
                <label htmlFor="checkbox" className="text-base text-black">I agree to Xpacy’s Terms & Conditions and Privacy Policy.</label>
            </div>
            <div className="flex justify-start w-full my-4">
                <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                    onChange={setCaptchaValue}
                />
            </div>
            <button type="submit" disabled={pending} className="bg-primary text-white  cursor-pointer  px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md disabled:bg-gray-900 disabled:cursor-not-allowed"> <span>Sign Up</span> <span>{pending && <SpinnerMini />}</span> </button>
            {role === "property-owner" && <ResendOwnerEmail />}
        </form>
    )
}