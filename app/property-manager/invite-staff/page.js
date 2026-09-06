import InviteStaffForm from "@/app/_components/InviteStaffForm";
import BackBtn from "@/app/_components/BackBtn";
import Logo from "@/app/_components/Logo";

export default function Page() {
    return (
        <div className="flex-1 flex flex-col gap-4.5">
            {/* Navigation */}
            <nav className="flex pl-[7%] py-6 border-b border-primary-100">
                <div className="w-1/2 flex items-center justify-between">
                    <BackBtn />
                    <Logo />
                </div>
            </nav>
            {/* Form */}
            <div className="flex flex-col items-center justify-center">
                <InviteStaffForm />
            </div>
        </div>
    )
}