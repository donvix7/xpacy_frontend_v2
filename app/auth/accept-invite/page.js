import AcceptInviteForm from "@/app/_components/AcceptInviteForm";
import AuthCarousel from "@/app/_components/AuthCarousel";
import Logo from "@/app/_components/Logo";
import { getCities, getPropertyOwnerInfo } from "@/app/_lib/data-services";

export default async function Page({ searchParams }) {
    const params = await searchParams;
    const token = params?.token || null;
    const initialEmail = params?.email || null;
    const initialName = params?.name || null;

    let ownerInfo = null;
    if (token) {
        ownerInfo = await getPropertyOwnerInfo(token);
    }

    const cities = await getCities();

    return (
        <div className="flex flex-col md:flex-row min-h-dvh px-6">
            <div className="w-full md:flex-1 py-16 flex md:justify-center flex-col md:flex-row">
                <div className="flex flex-col gap-12">
                    <div className="self-center">
                        <Logo />
                    </div>
                    <div className="space-y-11">
                        <div className="space-y-2 text-center">
                            <h1 className="text-4xl text-primary font-bold">Accept Your Invitation</h1>
                            <p className="text-base text-black font-mono">
                                {token
                                    ? "Set your password to activate your property owner account."
                                    : "Create your property owner account to get started."}
                            </p>
                        </div>
                        <AcceptInviteForm
                            token={token}
                            initialEmail={ownerInfo?.email || initialEmail}
                            initialName={ownerInfo ? `${ownerInfo.first_name || ""} ${ownerInfo.last_name || ""}`.trim() : initialName}
                            cities={cities}
                        />
                    </div>
                </div>
            </div>
            <div className="w-1/2 hidden md:block">
                <AuthCarousel position="top-30" />
            </div>
        </div>
    )
}