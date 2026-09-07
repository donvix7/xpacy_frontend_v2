import Link from "next/link";
import EmptyState from "@/app/_components/EmptyState";
import { format } from "date-fns";
import StatusChips from "./StatusChips";
import SearchInput from "./SearchInput";
import DashboardFilter from "./DashboardFilter";
import DataTable from "./DataTable";

const tableHeadings = [
    { heading: "Service Type" },
    { heading: "Property Address" },
    { heading: "Initiated By" },
    { heading: "Date/Time", center: true },
    { heading: "Service Status", center: true },
    { heading: "" }
];

export default function PropertyOwnerServicesTable({ services, pagination, showFilters = true }) {
    if (!services?.length) return <EmptyState message={"No services found."} cta={"Request Service"} ctaLink={"/dashboard/property-owner/services/request"} />

    const renderRow = (service) => {
        const date = service.created_at || service.createdAt || service.date_added;
        const formattedDate = date ? format(new Date(date), "MMM dd, yyyy HH:mm") : "N/A";
        const propertyAddress = service.property ? `${service.property.property_name}, ${service.property.city}` : service.property_name || "N/A";
        const initiator = service.user ? `${service.user.firstname} ${service.user.lastname || ''}` : "N/A";

        return (
            <tr key={service.id || service._id} className="text-neutrals-900 text-sm font-mono border-b border-primary-100 hover:bg-gray-50/50 transition-colors last:border-0">
                <td className="p-4 font-semibold text-gray-900">
                    {service.service_type || service.type || "Service"}
                </td>
                <td className="p-4 text-gray-600">
                    {propertyAddress}
                </td>
                <td className="p-4 text-gray-600">
                    {initiator}
                </td>
                <td className="p-4 text-center text-gray-600 text-xs">
                    {formattedDate}
                </td>
                <td className="p-4 text-center">
                    <div className="flex justify-center">
                        <StatusChips status={service.service_status || service.status || 'pending'} />
                    </div>
                </td>
                <td className="p-4 relative text-center">
                    <div className="flex justify-center">
                        {/* Action menu if any */}
                    </div>
                </td>
            </tr>
        );
    };

    const renderMobileCard = (service) => {
        const date = service.created_at || service.createdAt || service.date_added;
        const formattedDate = date ? format(new Date(date), "MMM dd, yyyy HH:mm") : "N/A";
        const propertyAddress = service.property ? `${service.property.property_name}, ${service.property.city}` : service.property_name || "N/A";
        const initiator = service.user ? `${service.user.firstname} ${service.user.lastname || ''}` : "N/A";

        return (
            <div key={service.id || service._id} className="flex flex-col gap-4 p-4 border-b border-primary-100 bg-white last:border-0 font-mono">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-sm text-gray-900">{service.service_type || service.type || "Service"}</h3>
                        <p className="text-xs text-gray-500">{propertyAddress}</p>
                    </div>
                    <StatusChips status={service.service_status || service.status || 'pending'} />
                </div>
                
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg text-xs">
                    <div className="flex flex-col">
                        <span className="text-gray-400 uppercase font-bold text-[9px] mb-1">Initiated By</span>
                        <span className="text-gray-900 font-medium">{initiator}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-gray-400 uppercase font-bold text-[9px] mb-1">Date/Time</span>
                        <span className="text-gray-900 text-right">{formattedDate}</span>
                    </div>
                </div>
            </div>
        );
    };

    const headerActions = showFilters ? (
        <div className="flex items-center gap-2 shrink-0">
            <SearchInput />
            <DashboardFilter />
        </div>
    ) : null;

    return (
        <DataTable
            title="Service Requests"
            headers={tableHeadings}
            data={services}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            headerActions={headerActions}
            showPagination={!!pagination}
            pagination={pagination}
        />
    );
}
