import { cookies } from "next/headers";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import { getBookedServices } from "@/app/_lib/data-services";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import StatusChips from "@/app/_components/StatusChips";
import Link from "next/link";

const tableHeadings = [
    { heading: "Service Type" },
    { heading: "Property" },
    { heading: "Date" },
    { heading: "Status", center: true },
    { heading: "" }
];

export default async function BookedServiceList({ services }) {
    let bookedServices = services;
    if (!bookedServices) {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");
        bookedServices = await getBookedServices(token);
    }
    
    if (!bookedServices || bookedServices.length <= 0) return <EmptyState message={"Oops!... You have no booked services yet."} cta={"Book A Service"} link={"/book-service"} />

    const renderRow = (service) => (
        <tr key={service._id || service.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0 text-sm font-mono">
            <td className="p-4">{service.service_type}</td>
            <td className="p-4">{service.address}</td>
            <td className="p-4">{new Date(service.scheduled_date).toLocaleDateString()}</td>
            <td className="p-4 text-center">
                <div className="flex justify-center">
                    <StatusChips status={service.service_status} />
                </div>
            </td>
          
        </tr>
    );

    const renderMobileCard = (service) => (
        <div key={service._id || service.id} className="py-6 flex flex-col gap-4 border-b border-gray-100 bg-white last:border-0 font-mono">
            <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-gray-900">{new Date(service.scheduled_date).toLocaleDateString()}</p>
                
            </div>
            
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-gray-800">{service.service_type}</h3>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status:</span>
                    <StatusChips status={service.service_status} />
                </div>
            </div>

            <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg text-sm">
                <div className="flex flex-col gap-1">
                    <p className="text-neutral-500 text-[10px] uppercase font-bold">Property address</p>
                    <p className="text-gray-700">{service.address}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 p-2">
            <MobileDashboardHeader/>
        <DataTable
            headers={tableHeadings}
            data={bookedServices}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            showPagination={false}
            className="p-0! border-none shadow-none"
        />
        </div>
    );
}
