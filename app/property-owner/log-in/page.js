
import AuthCarousel from "@/app/_components/AuthCarousel";
import LoginForm from "@/app/_components/LoginForm";
export default function Page() {

    return (
        <div className="flex min-h-dvh">
            <LoginForm role={"property-owner"}/>
            <div className="w-1/2 hidden md:block">
                <AuthCarousel />
            </div>
        </div>
    )
}