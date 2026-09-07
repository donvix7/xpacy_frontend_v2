"use client"
import Logo from "@/app/_components/Logo"
import { useUser } from "@/app/_context/UserContext"
import Link from "next/link"
export default function Page(){
    const {userData} = useUser()
    return (
        <div className="py-[120px] flex flex-col items-center justify-center">
            <Logo/>
            <h1 className="mb-16 mt-6 text-4xl text-primary">Almost done!</h1>
            <p className="text-base font-mono mb-20">We have sent an email to <strong>{userData?.email}.</strong>
Kindly click the link in the email to complete your registration.</p>
            <p className="text-base font-mono">Already have an account? <Link href={"/auth/log-in"} className="font-bold font-mono text-base">Log In</Link></p>
        </div>
    )

}