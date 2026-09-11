"use client"
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FaCalendarAlt } from "react-icons/fa";

export default function DateFilter({ onFilterChange, value }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const selectedFilter = value !== undefined ? value : (searchParams.get('range') || "all_time");

    const handleChange = (e) => {
        const val = e.target.value;
        
        if (onFilterChange) {
            onFilterChange(val);
        } else {
            const params = new URLSearchParams(searchParams);
            if (val && val !== 'all_time') {
                params.set('range', val);
            } else {
                params.delete('range');
            }
            replace(`${pathname}?${params.toString()}`);
        }
    }

    return (
        <div className="flex items-center gap-2 px-3 py-2 border border-primary-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
            <select
                value={selectedFilter}
                onChange={handleChange}
                className="bg-transparent text-xs sm:text-sm text-gray-700 focus:outline-none cursor-pointer pr-2"
            >
                <option value="all_time">All Time</option>
                <option value="today">Today</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="this_year">This Year</option>
            </select>
        </div>
    )
}
