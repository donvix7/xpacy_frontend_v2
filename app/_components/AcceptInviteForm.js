"use client"
import Link from "next/link"
import { useTransition, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { FaEye, FaEyeSlash } from "react-icons/fa"

import { handleCompleteOwnerRegistration, handlePropertyOwnerSignup } from '@/app/_lib/action';
import FormInput from "./FormInput"
import SelectCity from "./SelectCity";
import SpinnerMini from "./SpinnerMini";
import toast from "react-hot-toast"
import ReCAPTCHA from "react-google-recaptcha"

export default function AcceptInviteForm({ token, initialEmail, initialName, cities }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [captchaValue, setCaptchaValue] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm({
        defaultValues: {
            firstname: initialName?.split(" ")[0] || "",
            lastname: initialName?.split(" ").slice(1).join(" ") || "",
            email: initialEmail || "",
            phone: "",
            password: "",
            confirmPassword: "",
            state: "",
        }
    })

    async function onSubmit(data) {
        if (!captchaValue) {
            toast.error("Please verify that you are not a robot.");
            return;
        }

        startTransition(async () => {
            let response;

            if (token) {
                if (data.password !== data.confirmPassword) {
                    toast.error("Passwords do not match");
                    return;
                }
                response = await handleCompleteOwnerRegistration(data, token);
            } else {
                response = await handlePropertyOwnerSignup(data);
            }

            if (response.success) {
                toast.success(response.message)
                reset();
                router.push(token ? "/property-owner/log-in" : "/auth/verify-email");
            } else {
                toast.error(response.message);
            }
        });
    }

    return (
        <form className="space-y-6 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                <FormInput label={"First Name"} id={"firstname"} >
                    <input disabled={!!token} {...register("firstname", {
                        required: "Please enter your first name"
                    })} type={"text"} name={"firstname"} id={"firstname"} placeholder={"Enter your first name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.firstname ? "border-error" : "border-primary-200"}`} />
                    {errors.firstname && <span className="-mt-2 text-xs text-error">{errors.firstname.message}</span>}
                </FormInput>
                <FormInput label={"Last Name"} id={"lastname"} >
                    <input disabled={!!token} {...register("lastname", {
                        required: "Please enter your lastname"
                    })} type={"text"} name={"lastname"} id={"lastname"} placeholder={"Enter your last name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lastname ? "border-error" : "border-primary-200"}`} />
                    {errors.lastname && <span className="-mt-2 text-xs text-error">{errors.lastname.message}</span>}
                </FormInput>
            </div>
            <FormInput label={"Email address"} id={"email"} >
                <input disabled={!!token} {...register("email", {
                    required: "Email is required", pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Provide a valid email address",
                    }
                })} type={"email"} name={"email"} id={"email"} placeholder={"Enter your email address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.email ? "border-error" : "border-primary-200"}`} />
                {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
            </FormInput>
            {!token && (
                <FormInput label={"Phone number"} id={"phone"} >
                    <input {...register("phone", {
                        required: "Please enter your phone number"
                    })} type={"phone"} name={"phone"} id={"phone"} placeholder={"Enter your phone number"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.phone ? "border-error" : "border-primary-200"}`} />
                    {errors.phone && <span className="-mt-2 text-xs text-error">{errors.phone.message}</span>}
                </FormInput>
            )}
            <FormInput label={token ? "Create Password" : "Password"} id={"password"} >
                <div className="relative">
                    <input {...register("password", {
                        required: "Password is required", minLength: {
                            value: 8,
                            message: "Password needs to be 8 characters"
                        }
                    })} type={showPassword ? "text" : "password"} name={"password"} id={"password"} placeholder={"Enter your password"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none w-full ${errors.password ? "border-error" : "border-primary-200"}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                {errors.password && <span className="-mt-2 text-xs text-error">{errors.password.message}</span>}
            </FormInput>
            <FormInput label={"Confirm Password"} id={"confirmPassword"} >
                <input {...register("confirmPassword", {
                    required: "This field is required",
                    validate: (value) => value === getValues().password || "Passwords needs to match",
                })} type={showPassword ? "text" : "password"} name={"confirmPassword"} id={"confirmPassword"} placeholder={"Confirm your password"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.confirmPassword ? "border-error" : "border-primary-200"}`} />
                {errors.confirmPassword && <span className="-mt-2 text-xs text-error">{errors.confirmPassword.message}</span>}
            </FormInput>
            {!token && (
                <div className="flex flex-col space-y-2 font-mono">
                    <label htmlFor={"location"} className="text-sm text-black">Choose a location</label>
                    <SelectCity cities={cities} register={register} errors={errors} />
                </div>
            )}
            <div className="flex items-center gap-1 font-mono -mt-2">
                <input type="checkbox" id="checkbox" className="w-6 h-6" />
                <label htmlFor="checkbox" className="text-base text-black">I agree to Xpacy&apos;s Terms &amp; Conditions and Privacy Policy.</label>
            </div>
            <div className="flex justify-start w-full my-4">
                <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                    onChange={setCaptchaValue}
                />
            </div>
            <button type="submit" disabled={pending} className="bg-primary text-white cursor-pointer px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md disabled:bg-gray-900 disabled:cursor-not-allowed">
                <span>{token ? "Complete Setup" : "Accept Invitation"}</span>
                <span>{pending && <SpinnerMini />}</span>
            </button>
            <p className="text-base text-black font-mono -mt-6">Already have an account?  <Link href={"/property-owner/log-in"} className="text-primary text-base font-bold">Log In</Link></p>
        </form>
    );
}