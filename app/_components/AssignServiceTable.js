"use client";

import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import StatusChips from "./StatusChips";
import Link from "next/link";
import { format } from "date-fns";
import { useParams } from "next/navigation";

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
            console.log(serviceId, providerID)
        } catch (error) {
            console.error(error);
        }

    }

    return (
        <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
            {/* Search Bar */}
            <div className="p-6 pb-2">
                <div className="relative w-[340px]">
                    <input 
                        type="text" 
                        placeholder="Search property, type, name or status"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto ">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="text-gray-400 font-mono text-sm border-b border-gray-50">
                            <th className="px-6 py-4 font-bold">Service Type</th>
                            <th className="px-6 py-4 font-bold">Property Address</th>
                            <th className="px-6 py-4 font-bold">Tenant/Owner</th>
                            <th className="px-6 py-4 font-bold">Date/Time</th>
                            <th className="px-6 py-4 font-bold text-center">Status</th>
                            <th className="px-6 py-4 font-bold">Assigned Provider</th>
                            <th className="px-6 py-4 font-bold"></th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service, index) => {
                                const dateStr = service.scheduled_date ? format(new Date(service.scheduled_date), "dd/MM/yy") : "N/A";
                                const timeStr = service.scheduled_time || "N/A";
                                const provider = service.serviceProvider || service.assigned_provider;

                                return (
                                    <tr key={service._id || index} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-6 border-t border-gray-50">{service.service_type || "N/A"}</td>
                                        <td className="px-6 py-6 border-t border-gray-50 text-gray-600 max-w-[200px] truncate">{service.address || "N/A"}</td>
                                        <td className="px-6 py-6 border-t border-gray-50">{service.user?.firstname} {service.user?.lastname}</td>
                                        <td className="px-6 py-6 border-t border-gray-50">
                                            <div className="flex flex-col">
                                                <span>{dateStr}</span>
                                                <span className="text-gray-400">{timeStr}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-t border-gray-50">
                                            <div className="flex justify-center">
                                                <StatusChips status={service.service_status || "Pending"} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-t border-gray-50">{provider || "Unassigned"}</td>
                                        <td className="px-6 py-6 border-t border-gray-50 text-right">
                                            <button 
                                                onClick={() => {
                                                    handleAssignServiceProvider(service.id);
                                                    
                                                }}
                                                className="font-bold text-primary-900 hover:text-primary transition-colors"
                                            >
                                                {provider ? "Re-assign" : "Assign"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-20 text-center text-gray-400">
                                    No service requests found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
