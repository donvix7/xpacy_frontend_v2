"use client"
import { useState, useMemo } from "react";
import DateFilter from "./DateFilter";
import ExportButton from "./ExportButton";
import ServicesSummary from "./ServicesSummary";
import { checkDateInRange } from "@/app/_lib/utils";
import DashboardGridItem from "./DashboardGridItems";

export default function ServicesOverviewWrapper({ services = [], serviceProviders = [], showFilters = true }) {
    const [filterRange, setFilterRange] = useState("all_time");
    const serviceList = Array.isArray(services) ? services.filter(Boolean) : [];
    const providerList = Array.isArray(serviceProviders) ? serviceProviders.filter(Boolean) : [];

    const filteredServices = useMemo(() => {
        if (!filterRange || filterRange === "all_time") return serviceList;
        return serviceList.filter(s => {
            const dateStr = s.createdAt || s.created_at || s.date || s.booking_date; 
            return checkDateInRange(dateStr, filterRange); 
        });
    }, [serviceList, filterRange]);

    return (
        <div className="flex flex-col gap-4">
            {showFilters && (
                  <div className="flex justify-between items-center gap-2">
                                <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Services</p>
                                <div className="flex gap-2">
                
                                <DateFilter />
                                <ExportButton 
                                    data={serviceList}
                                    filename="property_summary" 
                                    options={[
                                        { id: "all", label: "All data" },
                                        { id: "summary", label: "Summary" },
                                        { id: "overview", label: "properties overview" }
                                    ]}
                                />
                                </div>
                
                            </div>
            )}
            <DashboardGridItem title="Services Summary">
            <ServicesSummary services={filteredServices} serviceProviders={providerList} showHeading={showFilters} />
            </DashboardGridItem>
        </div>
    )
}
