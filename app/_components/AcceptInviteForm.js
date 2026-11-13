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
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
                <FormInput label={"First Name"} id={"firstname"} >
                    <input disabled={!!token} {...register("firstname", {
                        required: "Please enter your first name"
                    })} type={"text"} name={"firstname"} id={"firstname"} placeholder={"Enter your first name"} className={`xp-field ${errors.firstname ? "xp-field-error" : ""}`} />
                    {errors.firstname && <span className="-mt-2 text-xs text-error">{errors.firstname.message}</span>}
                </FormInput>
                <FormInput label={"Last Name"} id={"lastname"} >
                    <input disabled={!!token} {...register("lastname", {
                        required: "Please enter your lastname"
                    })} type={"text"} name={"lastname"} id={"lastname"} placeholder={"Enter your last name"} className={`xp-field ${errors.lastname ? "xp-field-error" : ""}`} />
                    {errors.lastname && <span className="-mt-2 text-xs text-error">{errors.lastname.message}</span>}
                </FormInput>
            </div>
            <FormInput label={"Email address"} id={"email"} >
                <input disabled={!!token} {...register("email", {
                    required: "Email is required", pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Provide a valid email address",
                    }
                })} type={"email"} name={"email"} id={"email"} placeholder={"Enter your email address"} className={`xp-field ${errors.email ? "xp-field-error" : ""}`} />
                {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
            </FormInput>
            {!token && (
                <FormInput label={"Phone number"} id={"phone"} >
                    <input {...register("phone", {
                        required: "Please enter your phone number"
                    })} type={"phone"} name={"phone"} id={"phone"} placeholder={"Enter your phone number"} className={`xp-field ${errors.phone ? "xp-field-error" : ""}`} />
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
                    })} type={showPassword ? "text" : "password"} name={"password"} id={"password"} placeholder={"Enter your password"} className={`xp-field pr-12 ${errors.password ? "xp-field-error" : ""}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-mute transition-colors hover:text-ink">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                {errors.password && <span className="-mt-2 text-xs text-error">{errors.password.message}</span>}
            </FormInput>
            <FormInput label={"Confirm Password"} id={"confirmPassword"} >
                <input {...register("confirmPassword", {
                    required: "This field is required",
                    validate: (value) => value === getValues().password || "Passwords needs to match",
                })} type={showPassword ? "text" : "password"} name={"confirmPassword"} id={"confirmPassword"} placeholder={"Confirm your password"} className={`xp-field ${errors.confirmPassword ? "xp-field-error" : ""}`} />
                {errors.confirmPassword && <span className="-mt-2 text-xs text-error">{errors.confirmPassword.message}</span>}
            </FormInput>
            {!token && (
                <FormInput label={"Choose a location"} id={"location"} >
                    <SelectCity cities={cities} register={register} errors={errors} />
                </FormInput>
            )}
            <div className="flex items-start gap-2 font-mono">
                <input type="checkbox" id="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-side" />
                <label htmlFor="checkbox" className="text-[13.5px] leading-snug text-mute">I agree to Xpacy&apos;s Terms &amp; Conditions and Privacy Policy.</label>
            </div>
            <div className="flex w-full justify-start">
                <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                    onChange={setCaptchaValue}
                />
            </div>
            <button type="submit" disabled={pending} className="xp-btn xp-btn-fill w-full py-3.5 font-mono text-[15px] disabled:cursor-not-allowed disabled:opacity-60">
                <span>{token ? "Complete Setup" : "Accept Invitation"}</span>
                <span>{pending && <SpinnerMini />}</span>
            </button>
            <p className="text-center font-mono text-[14px] text-mute">Already have an account?  <Link href={"/property-owner/log-in"} className="font-bold text-ink hover:underline">Log In</Link></p>
        </form>
    );
}
