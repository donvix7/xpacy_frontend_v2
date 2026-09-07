import { format, isPast } from "date-fns";
import DataTable from "./DataTable";
import StatusChips from "./StatusChips";
import { parseBookingDate } from "../_lib/utils";

const tableHeadings = [
    { heading: "Property" },
    { heading: "Inspection Date" },
    { heading: "Status", center: true },
];

const inspectionStatus = (inspection) => {
    if (inspection.status || inspection.booking_status) return inspection.status || inspection.booking_status;
    const date = parseBookingDate(inspection.start_date);
    if (date && isPast(date)) return "completed";
    return "upcoming";
};

export default function InspectionsTable({ inspections }) {
    const data = Array.isArray(inspections) ? inspections : [];

    if (data.length <= 0) return null;

    const renderRow = (inspection) => {
        const date = parseBookingDate(inspection.start_date);

        return (
            <tr key={inspection.id || inspection._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-0 text-sm font-mono text-gray-700">
                <td className="p-4 font-semibold text-gray-900">
                    {inspection.property?.property_name || inspection.property_name || "N/A"}
                </td>
                <td className="p-4">{date ? format(date, "MMM dd, yyyy") : "N/A"}</td>
                <td className="p-4 text-center">
                    <div className="flex justify-center">
                        <StatusChips status={inspectionStatus(inspection)} />
                    </div>
                </td>
            </tr>
        );
    }

    const renderMobileCard = (inspection) => {
        const date = parseBookingDate(inspection.start_date);

        return (
            <div key={inspection.id || inspection._id} className="py-6 flex flex-col gap-4 border-b border-gray-100 bg-white last:border-0 font-mono">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-bold text-gray-800">{inspection.property?.property_name || inspection.property_name || "N/A"}</h3>
                        <p className="text-xs text-gray-500">{date ? format(date, "MMM dd, yyyy") : "N/A"}</p>
                    </div>
                    <StatusChips status={inspectionStatus(inspection)} />
                </div>
            </div>
        );
    }

    return (
        <DataTable
            headers={tableHeadings}
            data={data}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            showPagination={false}
            className="p-0! border-none shadow-none"
        />
    );
}