
import AuthCarousel from "@/app/_components/AuthCarousel";
import LoginForm from "@/app/_components/LoginForm";
import { Suspense } from "react";
export default function Page() {

    return (
        <div className="xp-auth flex min-h-dvh w-full bg-canvas">
            <Suspense fallback={<div className="w-full md:w-1/2" />}><LoginForm role={"property-manager"}/></Suspense>
            <div className="relative hidden w-1/2 overflow-hidden p-3 md:block">
                <AuthCarousel />
            </div>
        </div>
    )
}
