"use client"
import { useState, useMemo } from "react";
import DateFilter from "./DateFilter";
import ExportButton from "./ExportButton";
import ServicesSummary from "./ServicesSummary";
import { checkDateInRange } from "@/app/_lib/utils";
import DashboardGridItem from "./DashboardGridItems";

export default function ServicesOverviewWrapper({ services, serviceProviders, showFilters = true }) {
    const [filterRange, setFilterRange] = useState("all_time");
    

    const filteredServices = useMemo(() => {
        if (!filterRange || filterRange === "all_time") return services;
        return services.filter(s => {
            const dateStr = s.createdAt || s.created_at || s.date || s.booking_date; 
            return checkDateInRange(dateStr, filterRange); 
        });
    }, [services, filterRange]);

    return (
        <div className="flex flex-col gap-4">
            {showFilters && (
                  <div className="flex justify-between items-center gap-2">
                                <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Services</h1>
                                <div className="flex gap-2">
                
                                <DateFilter />
                                <ExportButton 
                                    data={services} 
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
            <ServicesSummary services={filteredServices} serviceProviders={serviceProviders} showHeading={showFilters} />
            </DashboardGridItem>
        </div>
    )
}
