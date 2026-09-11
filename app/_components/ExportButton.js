"use client"
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import FilterMenu from "./FilterMenu";
import ExportOptionsMenu from "./ExportOptionsMenu";
import toast from "react-hot-toast";

export default function ExportButton({ data, filename = "export", options = [] }) {
    
    const handleExport = (selectedWithFormats) => {
        try {
            if (!data || !data.length) {
                toast.error("No data available to export for the selected filters.");
                return;
            }

            const wb = XLSX.utils.book_new();
            const isCSV = selectedWithFormats[0]?.format === "CSV";
            
            if (isCSV) {
                // CSV only supports one sheet
                const ws = XLSX.utils.json_to_sheet(data);
                XLSX.utils.book_append_sheet(wb, ws, "Data");
                XLSX.writeFile(wb, `${filename}.csv`);
                toast.success("File exported successfully as CSV");
            } else {
                selectedWithFormats.forEach(opt => {
                    const ws = XLSX.utils.json_to_sheet(data);
                    // Ensure sheet name is within 31 char limit and unique
                    const sheetName = opt.label.substring(0, 31).replace(/[\\/?*\[\]]/g, '');
                    XLSX.utils.book_append_sheet(wb, ws, sheetName);
                });
                XLSX.writeFile(wb, `${filename}.xlsx`);
                toast.success("File exported successfully as Excel");
            }
        } catch (error) {
            console.error("Export process failed:", error);
            toast.error("Failed to export file. Please try again.");
        }
    }

    // Default options if none provided
    const defaultOptions = options.length > 0 ? options : [
        { id: "all", label: "All Data" }
    ];

    return (
        <div className="relative">
            <FilterMenu>
                <FilterMenu.Open name="export-menu">
                    <button 
                        className="flex items-center gap-2 px-6 py-3 text-xs sm:text-sm bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-xl transform hover:-translate-y-0.5 duration-200 font-medium font-mono border border-primary-200"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Export Data</span>
                    </button>
                </FilterMenu.Open>
                <FilterMenu.Window name="export-menu" top="top-[110%]" right="right-0">
                    <ExportOptionsMenu 
                        options={defaultOptions} 
                        onExport={handleExport}
                    />
                </FilterMenu.Window>
            </FilterMenu>
        </div>
    )
}
