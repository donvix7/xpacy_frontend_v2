
import Link from "next/link";


import SignupForm from "@/app/_components/SignupForm";
import AuthCarousel from "@/app/_components/AuthCarousel";
import Logo from "@/app/_components/Logo";
import { getCities } from "@/app/_lib/data-services";
import { Suspense } from "react";

export default async function Page({ searchParams }) {
        const params = (await searchParams) || {};
        const role = params.role === "property-owner" ? "property-owner" : "user";
        const cities = await  getCities()
    return(
        <div className="xp-auth flex min-h-dvh w-full flex-col bg-canvas md:flex-row">
            <div className="flex w-full flex-1 justify-center px-4 py-10 md:h-dvh md:overflow-y-auto md:px-6 md:py-14">
                <div className="xp-auth-card flex h-max w-full max-w-[640px] flex-col gap-7 p-6 sm:p-9">
                    <div className="self-center">
                        <Logo />
                    </div>
                    <div className="flex flex-col gap-2 text-center">
                        <h1 className="font-sans text-[28px] font-bold leading-tight text-ink">Sign Up</h1>
                        <p className="font-mono text-[14.5px] leading-relaxed text-mute">Enter your details to create your account.</p>
                    </div>

                    <Suspense fallback={<div className="h-96" />}><SignupForm cities={cities} role={role} /></Suspense>
                    <p className="text-center font-mono text-[14px] text-mute">Already have an account?  <Link href={"/auth/log-in"} className="font-bold text-ink hover:underline">Log In</Link></p>
                </div>
            </div>
            <div className="relative hidden w-1/2 overflow-hidden p-3 md:block">
                <AuthCarousel />
            </div>
        </div>
    )
}
