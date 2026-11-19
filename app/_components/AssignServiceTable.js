"use client";

import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import StatusChips from "./StatusChips";
import DataTable from "./DataTable";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

const tableHeadings = [
    { heading: "Service Type" },
    { heading: "Property Address" },
    { heading: "Tenant/Owner" },
    { heading: "Date/Time" },
    { heading: "Status", center: true },
    { heading: "Assigned Provider" },
    { heading: "" },
];

export default function AssignServiceTable({ services = [] }) {
    const { id: providerID } = useParams();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredServices = services.filter(service => {
        const searchStr = searchTerm.toLowerCase();
        return (
            service.service_type?.toLowerCase().includes(searchStr) ||
            service.address?.toLowerCase().includes(searchStr) ||
            service.user?.firstname?.toLowerCase().includes(searchStr) ||
            service.user?.lastname?.toLowerCase().includes(searchStr) ||
            service.service_status?.toLowerCase().includes(searchStr)
        );
    });

    const handleAssignServiceProvider = async (serviceId) => {
        try {
            if (!confirm(`Assign service to provider?`)) return;
            toast.success("Assignment updated");
        } catch (error) {
            toast.error(error.message || "Failed to assign provider");
        }
    };

    const renderRow = (service, index) => {
        const dateStr = service.scheduled_date ? format(new Date(service.scheduled_date), "dd/MM/yy") : "N/A";
        const timeStr = service.scheduled_time || "N/A";
        const provider = service.serviceProvider || service.assigned_provider;
        const tenantName = [service.user?.firstname, service.user?.lastname].filter(Boolean).join(" ") || "N/A";

        return (
            <tr key={service._id || service.id || index} className="border-b border-line hover:bg-soft transition-colors text-[13px] font-mono last:border-0">
                <td className="p-4 font-semibold text-ink">{service.service_type || "N/A"}</td>
                <td className="p-4 text-mute max-w-[200px] truncate">{service.address || "N/A"}</td>
                <td className="p-4 text-ink">{tenantName}</td>
                <td className="p-4">
                    <div className="flex flex-col">
                        <span className="text-ink">{dateStr}</span>
                        <span className="text-mute text-xs">{timeStr}</span>
                    </div>
                </td>
                <td className="p-4 text-center">
                    <div className="flex justify-center">
                        <StatusChips status={service.service_status || "Pending"} />
                    </div>
                </td>
                <td className="p-4 text-ink">{provider || "Unassigned"}</td>
                <td className="p-4 text-right">
                    <button 
                        onClick={() => handleAssignServiceProvider(service._id || service.id)}
                        className="xp-btn xp-btn-fill px-3 py-1.5 text-xs font-mono"
                    >
                        {provider ? "Re-assign" : "Assign"}
                    </button>
                </td>
            </tr>
        );
    };

    const renderMobileCard = (service, index) => {
        const dateStr = service.scheduled_date ? format(new Date(service.scheduled_date), "dd/MM/yy") : "N/A";
        const timeStr = service.scheduled_time || "N/A";
        const provider = service.serviceProvider || service.assigned_provider;
        const tenantName = [service.user?.firstname, service.user?.lastname].filter(Boolean).join(" ") || "N/A";

        return (
            <article key={service._id || service.id || index} className="rounded-xl border border-line bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{service.service_type || "Service request"}</p>
                        <p className="mt-1 break-words text-xs text-mute">{service.address || "Address unavailable"}</p>
                    </div>
                    <button 
                        onClick={() => handleAssignServiceProvider(service._id || service.id)}
                        className="xp-btn xp-btn-fill px-3 py-1 text-xs font-mono shrink-0"
                    >
                        {provider ? "Re-assign" : "Assign"}
                    </button>
                </div>
                <dl className="mt-4 flex flex-col gap-y-3 border-t border-line pt-3 text-xs">
                    <div className="flex justify-between"><dt className="text-mute">Tenant / Owner</dt><dd className="break-words font-medium text-ink">{tenantName}</dd></div>
                    <div className="flex justify-between"><dt className="text-mute">Date / Time</dt><dd className="font-medium text-ink">{dateStr} · {timeStr}</dd></div>
                    <div className="flex justify-between"><dt className="text-mute">Status</dt><dd><StatusChips status={service.service_status || "Pending"} /></dd></div>
                    <div className="flex justify-between"><dt className="text-mute">Assigned provider</dt><dd className="break-words font-medium text-ink">{provider || "Unassigned"}</dd></div>
                </dl>
            </article>
        );
    };

    const headerSearch = (
        <div className="relative w-full md:w-[320px]">
            <input 
                type="text" 
                placeholder="Search property, type, name or status"
                className="w-full pl-9 pr-4 py-2 bg-card border border-line rounded-lg text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-mute"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mute text-base" />
        </div>
    );

    return (
        <DataTable
            headers={tableHeadings}
            data={filteredServices}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            headerActions={headerSearch}
            emptyMessage="No service requests found matching your search."
            showPagination={false}
            className="p-0 border-none shadow-none"
        />
    );
}
