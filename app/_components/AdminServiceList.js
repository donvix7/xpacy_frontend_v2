"use client";

import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import StatusChips from "./StatusChips";
import ServiceOptionsMenu from "./ServiceOptionsMenu";
import EmptyState from "./EmptyState";
import { format } from "date-fns";

export default function AdminServiceList({ services = [] }) {
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

    if (!services || services.length <= 0) return <EmptyState message={"Oops!... You have no booked services yet."} cta={"Book A Service"} />;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Top Bar */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-primary-900 font-mono">Service Requests List</h3>
                
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative w-full md:w-[340px]">
                        <input 
                            type="text" 
                            placeholder="Search property, type or name"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    </div>

                    {/* Sort By */}
                    <div className="flex items-center gap-2 font-mono text-sm text-gray-500 whitespace-nowrap">
                        <span>Sort by:</span>
                        <select className="border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none">
                            <option>Default</option>
                            <option>Newest</option>
                            <option>Oldest</option>
                        </select>
                    </div>

                    {/* Filter Icon */}
                    <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                        <HiOutlineAdjustmentsHorizontal className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="text-gray-400 font-mono text-[10px] uppercase tracking-wider border-b border-gray-50">
                            <th className="px-6 py-4 font-bold">N/O</th>
                            <th className="px-6 py-4 font-bold">Service Type</th>
                            <th className="px-6 py-4 font-bold">Property Address</th>
                            <th className="px-6 py-4 font-bold">Tenant/Owner</th>
                            <th className="px-6 py-4 font-bold">Date/Time</th>
                            <th className="px-6 py-4 font-bold text-center">Status</th>
                            <th className="px-6 py-4 font-bold">Assigned Provider</th>
                            <th className="px-6 py-4 font-bold text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-[13px]">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service, index) => {
                                const dateStr = service.scheduled_date ? format(new Date(service.scheduled_date), "dd/MM/yy") : "N/A";
                                const timeStr = service.scheduled_time || "N/A";
                                const provider = service.serviceProvider || service.assigned_provider;

                                return (
                                    <tr key={service._id || index} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-6 border-t border-gray-50 font-bold">{index + 1}</td>
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
                                        <td className="px-6 py-6 border-t border-gray-50 text-right relative">
                                            <ServiceOptionsMenu id={service._id || service.id} hasProvider={!!provider} />
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-20 text-center text-gray-400">
                                    No service requests found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-6 border-t border-gray-50 flex items-center justify-center gap-2 font-mono text-sm">
                <button className="text-gray-400 hover:text-primary-900">&lt; Previous</button>
                <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded bg-primary-50 text-primary-900 font-bold">1</button>
                    <button className="w-8 h-8 rounded hover:bg-gray-100">2</button>
                    <button className="w-8 h-8 rounded hover:bg-gray-100">3</button>
                    <span className="mx-1">...</span>
                    <button className="w-8 h-8 rounded hover:bg-gray-100">7</button>
                </div>
                <button className="text-gray-400 hover:text-primary-900">Next &gt;</button>
            </div>
        </div>
    );
}