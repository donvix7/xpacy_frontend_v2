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
        <div className="xp-auth flex min-h-dvh w-full flex-col bg-canvas md:flex-row">
            <div className="flex w-full flex-1 justify-center px-4 py-10 md:h-dvh md:overflow-y-auto md:px-6 md:py-14">
                <div className="xp-auth-card flex h-max w-full max-w-[560px] flex-col gap-7 p-6 sm:p-9">
                    <div className="self-center">
                        <Logo />
                    </div>
                    <div className="flex flex-col gap-2 text-center">
                        <h1 className="font-sans text-[28px] font-bold leading-tight text-ink">Accept Your Invitation</h1>
                        <p className="font-mono text-[14.5px] leading-relaxed text-mute">
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
            <div className="relative hidden w-1/2 overflow-hidden p-3 md:block">
                <AuthCarousel />
            </div>
        </div>
    )
}
