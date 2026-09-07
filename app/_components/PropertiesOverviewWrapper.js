"use client"
import { useState, useMemo } from "react";
import DateFilter from "./DateFilter";
import ExportButton from "./ExportButton";
import PropertiesSummary from "./PropertiesSummary";
import { checkDateInRange } from "@/app/_lib/utils";

export default function PropertiesOverviewWrapper({ properties, showFilters = true }) {
    const [filterRange, setFilterRange] = useState("all_time");

    const filteredProperties = useMemo(() => {
        if (!filterRange || filterRange === "all_time") return properties;
        return properties.filter(p => {
            const dateStr = p.createdAt || p.created_at || p.date_added; 
            return checkDateInRange(dateStr, filterRange);
        });
    }, [properties, filterRange]);

    return (
        <div className="flex flex-col gap-4">
            {showFilters && (
                <div className="flex justify-end gap-2 text-nowrap">
                    <DateFilter onFilterChange={setFilterRange} value={filterRange} />
                    <ExportButton 
                        data={filteredProperties} 
                        filename="property_summary" 
                        options={[
                            { id: "all", label: "All data" },
                            { id: "summary", label: "Summary" },
                            { id: "overview", label: "properties overview" }
                        ]}
                    />
                </div>
            )}
            <PropertiesSummary properties={filteredProperties} showHeading={showFilters} />
        </div>
    )
}
