import ServiceRequestDetails from "@/app/_components/ServiceRequestDetails";
import BackBtn from "@/app/_components/BackBtn";
import Logo from "@/app/_components/Logo";
import { getServiceRequestById } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
    const { serviceId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    
    const service = await getServiceRequestById(token, serviceId);

    if (!service) {
        notFound();
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-white">
            {/* Header Navigation */}
            <nav className="flex items-center px-[7%] py-6 bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="w-1/3">
                    <BackBtn />
                </div>
                <div className="w-1/3 flex justify-center">
                    <Logo />
                </div>
                <div className="w-1/3 flex justify-end">
                    {/* Placeholder for trailing items if any */}
                </div>
            </nav>

            {/* Content Area */}
            <main className="flex-1 max-w-[900px] mx-auto w-full py-12 px-6">
                <ServiceRequestDetails service={service} />
            </main>
        </div>
    );
}
