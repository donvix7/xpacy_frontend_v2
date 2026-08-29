"use client"
import { useState, useMemo } from "react";
import DateFilter from "./DateFilter";
import ExportButton from "./ExportButton";
import PaymentsSummary from "./PaymentsSummary";
import { checkDateInRange } from "@/app/_lib/utils";
import DashboardGridItem from "./DashboardGridItems";

export default function  PaymentsOverviewWrapper({ bookings = [], invoices = [], showFilters = true }) {
    const [filterRange, setFilterRange] = useState("all_time");

    const filteredBookings = useMemo(() => {
        if (!filterRange || filterRange === "all_time") return bookings;
        return bookings.filter(b => {
             const dateStr = b.createdAt || b.created_at || b.payment_date || b.issuedDate || b.date; 
            return checkDateInRange(dateStr, filterRange); 
        });
    }, [bookings, filterRange]);

    return (
        <div className="flex flex-col gap-4">
            
            <DashboardGridItem >
            <PaymentsSummary invoices={filteredBookings} showHeading={showFilters} />
            </DashboardGridItem>
        </div>
    )
}
