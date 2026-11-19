"use client";

import { useState } from "react";
import Image from "next/image";
import { IoSearch } from "react-icons/io5";
import UserOptionsMenu from "./UserOptionsMenu";
import DataTable from "./DataTable";

const tableHeadings = [
    { heading: "N/O" },
    { heading: "Provider's Name" },
    { heading: "Contact Info" },
    { heading: "Service Type" },
    { heading: "Location" },
    { heading: "Completed Services", center: true },
    { heading: "" },
];

export default function AdminServiceProvidersList({ providers = [] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredProviders = providers.filter(provider => {
        const searchStr = searchTerm.toLowerCase();
        const name = `${provider.company_name || ""} ${provider.name || ""} ${provider.firstname || ""} ${provider.lastname || ""}`.toLowerCase();
        return (
            name.includes(searchStr) ||
            provider.service_type?.toLowerCase().includes(searchStr) ||
            provider.city?.toLowerCase().includes(searchStr) ||
            provider.state?.toLowerCase().includes(searchStr) ||
            provider.email?.toLowerCase().includes(searchStr)
        );
    });

    const renderRow = (provider, index) => {
        const name = provider.company_name || provider.name || `${provider.firstname || ""} ${provider.lastname || ""}`.trim() || "N/A";

        return (
            <tr key={provider._id || provider.id || index} className="border-b border-line hover:bg-soft transition-colors text-[13px] font-mono last:border-0">
                <td className="p-4 font-bold text-ink">{index + 1}</td>
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 relative shrink-0">
                            <Image 
                                src={provider.display_picture ? `https://app.xpacy.com/src/upload/display_img/${provider.display_picture}` : "/avatar.png"} 
                                alt="provider" 
                                className="object-cover rounded-full" 
                                unoptimized 
                                fill 
                            />
                        </div>
                        <span className="font-semibold text-ink">{name}</span>
                    </div>
                </td>
                <td className="p-4">
                    <div className="flex flex-col">
                        <span className="text-ink">{provider.phone || "N/A"}</span>
                        <span className="text-mute text-xs">{provider.email || "N/A"}</span>
                    </div>
                </td>
                <td className="p-4 capitalize text-ink">{provider.service_type || provider.specialization || "N/A"}</td>
                <td className="p-4">
                    <div className="flex flex-col">
                        <span className="text-ink">{provider.city || "N/A"}</span>
                        <span className="text-mute text-xs">{provider.state || ""}</span>
                    </div>
                </td>
                <td className="p-4 text-center font-bold text-ink">
                    {provider.completed_services || 0}
                </td>
                <td className="p-4 text-right relative">
                    <UserOptionsMenu id={provider._id || provider.id} role={provider?.user_role || "provider"} />
                </td>
            </tr>
        );
    };

    const renderMobileCard = (provider, index) => {
        const name = provider.company_name || provider.name || `${provider.firstname || ""} ${provider.lastname || ""}`.trim() || "N/A";

        return (
            <article key={provider._id || provider.id || index} className="rounded-xl border border-line bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-soft">
                        <Image
                            src={provider.display_picture ? `https://app.xpacy.com/src/upload/display_img/${provider.display_picture}` : "/avatar.png"}
                            alt=""
                            className="object-cover"
                            unoptimized
                            fill
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <p className="break-words font-semibold text-ink">{name}</p>
                            <UserOptionsMenu id={provider._id || provider.id} role={provider?.user_role || "provider"} />
                        </div>
                        <p className="mt-1 break-all text-xs text-mute">{provider.email || "No email"}</p>
                    </div>
                </div>
                <dl className="mt-4 flex flex-col gap-y-3 border-t border-line pt-3 text-xs">
                    <div className="flex justify-between"><dt className="text-mute">Phone</dt><dd className="break-words font-medium text-ink">{provider.phone || "N/A"}</dd></div>
                    <div className="flex justify-between"><dt className="text-mute">Service type</dt><dd className="break-words font-medium capitalize text-ink">{provider.service_type || provider.specialization || "N/A"}</dd></div>
                    <div className="flex justify-between"><dt className="text-mute">Location</dt><dd className="break-words font-medium text-ink">{[provider.city, provider.state].filter(Boolean).join(", ") || "N/A"}</dd></div>
                    <div className="flex justify-between"><dt className="text-mute">Completed services</dt><dd className="font-semibold text-ink">{provider.completed_services || 0}</dd></div>
                </dl>
            </article>
        );
    };

    const headerSearch = (
        <div className="relative w-full md:w-[320px]">
            <input 
                type="text" 
                placeholder="Search provider, type or city"
                className="w-full pl-9 pr-4 py-2 bg-card border border-line rounded-lg text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-mute"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mute text-base" />
        </div>
    );

    return (
        <div className="rounded-2xl border border-line bg-card p-5 sm:p-6 shadow-sm overflow-hidden">
            <DataTable
                title="Service Providers"
                headers={tableHeadings}
                data={filteredProviders}
                renderRow={renderRow}
                renderMobileCard={renderMobileCard}
                headerActions={headerSearch}
                emptyMessage="No service providers found matching your search."
                showPagination={false}
                className="p-0 border-none shadow-none"
            />
        </div>
    );
}
