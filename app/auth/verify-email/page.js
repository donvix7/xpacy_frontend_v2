"use client"
import Logo from "@/app/_components/Logo"
import { useUser } from "@/app/_context/UserContext"
import Link from "next/link"
export default function Page(){
    const {userData} = useUser()
    return (
        <div className="xp-auth flex min-h-dvh w-full items-center justify-center bg-canvas px-4 py-10 md:px-6">
            <div className="xp-auth-card flex w-full max-w-lg flex-col items-center gap-6 p-6 text-center sm:p-9">
                <Logo/>
                <p className="font-sans text-[30px] font-bold leading-tight text-ink">Almost done!</p>
                <p className="font-mono text-[14.5px] leading-relaxed text-mute">
                    We have sent an email to <strong className="text-ink">{userData?.email}.</strong>{" "}
                    Kindly click the link in the email to complete your registration.
                </p>
                <p className="font-mono text-[14px] text-mute">
                    Already have an account?{" "}
                    <Link href={"/auth/log-in"} className="font-bold text-ink hover:underline">Log In</Link>
                </p>
            </div>
        </div>
    )

}
