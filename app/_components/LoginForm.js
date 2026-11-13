"use client";
import { useTransition, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  FaUser, 
  FaUserShield, 
  FaBuilding, 
  FaHome, 
  FaHardHat 
} from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";

import { handleUserLogin } from "../_lib/action";
import FormInput from "./FormInput";
import Logo from "./Logo";
import SpinnerMini from "./SpinnerMini";

// Role configuration is defined inside the component to prevent
// hydration mismatches from module-scope JSX instantiation.
export default function LoginForm({ role: initialRole = "user", customRedirectUrl }) {
  

  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [captchaValue, setCaptchaValue] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const router = useRouter();

  const requestedRedirectUrl = customRedirectUrl ?? searchParams.get("redirectUrl");
  const signUpPath = initialRole === "property-owner" ? "/auth/sign-up?role=property-owner" : "/auth/sign-up";

  async function onSubmit(data) {
    if (!captchaValue) {
      toast.error("Please verify that you are not a robot.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await handleUserLogin(data, requestedRedirectUrl);
        if (response.success) {
          toast.success(response.message);
          if (response.redirectTo) {
            router.push(response.redirectTo);
          }
        } else {
          toast.error(response.message);
        }
        reset();
      } catch (error) {
        toast.error(error?.message || "An error occurred during login. Please try again.");
      }
    });
  }

  return (
    <div className="flex w-full flex-1 items-center justify-center px-4 py-10 md:px-6 md:py-14">
      <div className="xp-auth-card flex w-full max-w-[460px] flex-col gap-7 p-6 sm:p-9">
        <div className="self-center">
          <Logo />
        </div>

        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-sans text-[28px] font-bold leading-tight text-ink">
            Welcome back!
          </h1>
          <p className="font-mono text-[14.5px] leading-relaxed text-mute">
            Enter your email address and password to log in.
          </p>
        </div>

        <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <FormInput register={register} errors={errors} label="Email address" id="email">
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
            {errors.email && (
              <span className="-mt-2 text-xs text-error">{errors.email.message}</span>
            )}
          </FormInput>

          <FormInput label="Password" id="password">
            <input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              className={`xp-field ${errors.password ? "xp-field-error" : ""}`}
            />
            {errors.password && (
              <span className="-mt-2 text-xs text-error">{errors.password.message}</span>
            )}
          </FormInput>

          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-mono">
              <input
                type="checkbox"
                id="checkbox"
                className="h-4 w-4 shrink-0 accent-side"
              />
              <label htmlFor="checkbox" className="text-[13.5px] text-mute">
                Remember me
              </label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="font-mono text-[13.5px] font-medium text-ink hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="flex w-full justify-start">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
              onChange={setCaptchaValue}
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="xp-btn xp-btn-fill w-full py-3.5 font-mono text-[15px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>Log In</span>
            <span>{pending && <SpinnerMini />}</span>
          </button>
        </form>

        <p className="text-center font-mono text-[14px] text-mute">
          Don&apos;t have an account?{" "}
          <Link href={signUpPath} className="font-bold text-ink hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
