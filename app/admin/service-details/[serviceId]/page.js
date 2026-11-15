import ServiceRequestDetails from "@/app/_components/ServiceRequestDetails";
import AdminHeader from "@/app/_components/AdminHeader";
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
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            {/* Header Navigation */}
            <AdminHeader title="Service Details" backHref="/dashboard/admin/services" />

            {/* Content Area */}
            <main className="flex-1 max-w-4xl mx-auto w-full py-8 px-4 sm:px-6">
                <ServiceRequestDetails service={service} />
            </main>
        </div>
    );
}
