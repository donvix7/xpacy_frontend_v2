
import AuthCarousel from "@/app/_components/AuthCarousel";
import LoginForm from "@/app/_components/LoginForm";
import { Suspense } from "react";
export default function Page() {

    return (
        <div className="flex min-h-dvh">
            <Suspense fallback={<div className="w-full md:w-1/2" />}><LoginForm role={"facility-manager"}/></Suspense>
            <div className="w-1/2 hidden md:block">
                <AuthCarousel />
            </div>
        </div>
    )
}
