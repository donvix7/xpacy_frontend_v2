"use client"
import { useState, useMemo } from "react";
import DateFilter from "./DateFilter";
import ExportButton from "./ExportButton";
import PaymentsSummary from "./PaymentsSummary";
import { checkDateInRange, toRecordArray } from "@/app/_lib/utils";
import DashboardGridItem from "./DashboardGridItems";

export default function  PaymentsOverviewWrapper({ bookings = [], invoices = [], showFilters = true }) {
    const [filterRange, setFilterRange] = useState("all_time");
    const bookingList = toRecordArray(bookings);

    const filteredBookings = useMemo(() => {
        if (!filterRange || filterRange === "all_time") return bookingList;
        return bookingList.filter(b => {
             const dateStr = b.createdAt || b.created_at || b.payment_date || b.issuedDate || b.date; 
            return checkDateInRange(dateStr, filterRange); 
        });
    }, [bookingList, filterRange]);

    return (
        <div className="flex flex-col gap-4">
            
             <DashboardGridItem title={"Bookings Overview"}>
            <PaymentsSummary invoices={filteredBookings} showHeading={showFilters} />
            </DashboardGridItem>
        </div>
    )
}
