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

import { handleUserLogin, handleAdminLogin, handlePropertyOwnerLogin } from "../_lib/action";
import FormInput from "./FormInput";
import Logo from "./Logo";
import SpinnerMini from "./SpinnerMini";

// Role configuration is defined inside the component to prevent
// hydration mismatches from module-scope JSX instantiation.
export default function LoginForm({ role: initialRole = "user", customRedirectUrl }) {
  const ROLES = {
    user: {
      label: "User",
      shortLabel: "User",
      icon: <FaUser className="w-4 h-4" />,
      loginHandler: handleUserLogin,
      signUpPath: "/auth/sign-up",
      defaultRedirect: "/dashboard/user",
    },
    admin: {
      label: "Admin",
      shortLabel: "Admin",
      icon: <FaUserShield className="w-4 h-4" />,
      loginHandler: handleAdminLogin,
      signUpPath: "/auth/sign-up",
      defaultRedirect: "/dashboard/admin",
    },
    "property-owner": {
      label: "Property Owner",
      shortLabel: "Owner",
      icon: <FaBuilding className="w-4 h-4" />,
      loginHandler: handlePropertyOwnerLogin,
      signUpPath: "/property-owner/sign-up",
      defaultRedirect: "/dashboard/property-owner",
    },
    "property-manager": {
      label: "Property Manager",
      shortLabel: "Manager",
      icon: <FaHome className="w-4 h-4" />,
      loginHandler: handlePropertyOwnerLogin,
      signUpPath: "/auth/sign-up",
      defaultRedirect: "/dashboard/property-manager",
    },
    "facility-manager": {
      label: "Facility Manager",
      shortLabel: "Facility",
      icon: <FaHardHat className="w-4 h-4" />,
      loginHandler: handlePropertyOwnerLogin,
      signUpPath: "/auth/sign-up",
      defaultRedirect: "/dashboard/facility-manager",
    },
  };

  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [pending, startTransition] = useTransition();

  const [captchaValue, setCaptchaValue] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const router = useRouter();

  const roleConfig = ROLES[selectedRole] || ROLES.user;
  const redirectUrl = customRedirectUrl ?? searchParams.get("redirectUrl") ?? roleConfig.defaultRedirect;

  const roleOptions = Object.keys(ROLES).map((key) => ({
    value: key,
    label: ROLES[key].label,
    shortLabel: ROLES[key].shortLabel,
    icon: ROLES[key].icon,
  }));

  async function onSubmit(data) {
    if (!captchaValue) {
      toast.error("Please verify that you are not a robot.");
      return;
    }

    const handler = roleConfig.loginHandler;
    const redirectPath = roleConfig.defaultRedirect;

    startTransition(async () => {
      try {
        const response = await handler(data, redirectPath);
        if (response.success) {
          toast.success(response.message);
          if (redirectPath) {
            router.push(redirectPath);
          }
        } else {
          toast.error(response.message);
        }
        reset();
      } catch (error) {
        toast.error("An error occurred during login. Please try again.");
      }
    });
  }

  const handleRoleChange = (roleValue) => {
    router.push(`/${roleValue}/log-in`)
  };

  return (
    <div className="flex-1 py-8 md:py-12 flex flex-col items-center justify-center md:px-6 w-full">
      <div className="flex flex-col gap-8 w-full max-w-[500px]">
        <div className="self-center">
          <Logo />
        </div>

        <div className="space-y-8">
          {/* Role Selector Toggle */}
          <div>
            <div className="flex flex-wrap items-stretch justify-center gap-2 p-1.5 bg-[#FCFEFF] border-2 border-primary-100 rounded-2xl">
              {roleOptions.map((role) => {
                const isActive = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleChange(role.value)}
                    title={role.label}
                    aria-pressed={isActive}
                    className={`relative flex flex-col items-center gap-1.5 min-w-[86px] flex-1 px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-white "
                        : "text-gray-500 hover:bg-primary-50 hover:text-primary"
                    }`}
                  >
                    <span className={`text-xl ${isActive ? "text-white" : "text-gray-400"}`}>
                      {role.icon}
                    </span>
                    <span className="text-xs font-semibold">{role.shortLabel}</span>
                    {isActive && (
                      <span className="rounded-full bg-white flex items-center justify-center">
                        <FaCheck className="w-2.5 h-2.5 text-primary" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-center text-sm font-mono text-gray-500">
              Login as: <span className="font-semibold text-primary">{roleConfig.label}</span>
            </p>
          </div>

          <div className="space-y-3 text-center flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl text-primary font-bold">
              Welcome back!
            </h1>
            <div className="flex items-center gap-2 text-lg md:text-xl font-mono text-gray-500 font-semibold uppercase">
              {roleConfig.icon}
              <span>{roleConfig.label}</span>
            </div>
            <p className="text-base text-black font-mono text-center">
              Enter your email address and password to log in.
            </p>
          </div>

          <form className="space-y-6 flex flex-col w-full" onSubmit={handleSubmit(onSubmit)}>
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
                className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none w-full ${
                  errors.email ? "border-error" : "border-primary-200"
                }`}
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
                className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none w-full ${
                  errors.password ? "border-error" : "border-primary-200"
                }`}
              />
              {errors.password && (
                <span className="-mt-2 text-xs text-error">{errors.password.message}</span>
              )}
            </FormInput>

            <div className="flex-1 flex justify-between items-center w-full">
              <div className="flex items-center gap-1 font-mono -mt-2">
                <input type="checkbox" id="checkbox" className="w-5 h-5 accent-primary" />
                <label htmlFor="checkbox" className="text-base text-black">
                  Remember me
                </label>
              </div>
              <Link href="/auth/forgot-password" className="font-mono text-base text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            <div className="flex justify-start w-full my-4">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                onChange={setCaptchaValue}
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="bg-primary text-white w-full cursor-pointer px-5 py-3.5 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-xl hover:shadow-lg transition-all duration-200 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <span>Log In</span>
              <span>{pending && <SpinnerMini />}</span>
            </button>
          </form>

          <p className="text-base text-black font-mono -mt-4 text-center">
            Don&apos;t have an account?{" "}
            <Link href={roleConfig.signUpPath} className="text-primary text-base font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}