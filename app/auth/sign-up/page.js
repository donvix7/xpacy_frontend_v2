
import Link from "next/link";


import SignupForm from "@/app/_components/SignupForm";
import AuthCarousel from "@/app/_components/AuthCarousel";
import Logo from "@/app/_components/Logo";
import { getCities, getBanners } from "@/app/_lib/data-services";

export default async function Page(){
        const cities = await  getCities()
    return(
        <div className="flex flex-col md:flex-row min-h-dvh px-6 ">
            <div className="w-full md:flex-1 py-16 flex md:justify-center flex-col md:flex-row">
                <div className="flex flex-col gap-12">
                    <div className="self-center">
                        <Logo />
                    </div>
                    <div className="space-y-11">
                        <div className="space-y-2 text-center">
                            <h1 className="text-4xl text-primary font-bold">Sign Up</h1>
                            <p className="text-base text-black font-mono">Enter your email address and password to sign up.</p>
                        </div>
                        <SignupForm cities={cities}/>
                        <p className="text-base text-black font-mono -mt-6">Already have an account?  <Link href={"/auth/log-in"} className="text-primary text-base font-bold">Log In</Link></p>
                    </div>
                </div>
            </div>
            <div className="w-1/2 hidden md:block">
                <AuthCarousel position="top-30" />
            </div>
        </div>
    )
}