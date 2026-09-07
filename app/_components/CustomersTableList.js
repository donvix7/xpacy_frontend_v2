import Image from "next/image";
import EmptyState from "@/app/_components/EmptyState";
import { Mail, Phone, User } from "lucide-react";
import DataTable from "./DataTable";

const tableHeadings = [
    { heading: "Customer Name" },
    { heading: "Email" },
    { heading: "Phone" },
    { heading: "Status", center: true }
];

export default function CustomersTableList({ customers }) {
    if (!customers?.length) return <EmptyState message={"You don't have any customers yet."} />

    const renderRow = (customer) => (
        <tr key={customer.id} className="text-gray-700 text-sm font-mono border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        {customer.image ? (
                            <Image 
                                src={customer.image} 
                                alt={customer.firstname || "Customer"} 
                                className="object-cover rounded-full" 
                                width={40} 
                                height={40}
                                unoptimized
                            />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                    <div className="font-semibold text-gray-900 truncate">
                        {customer.firstname} {customer.lastname}
                    </div>
                </div>
            </td>
            <td className="p-4">
                <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                </div>
            </td>
            <td className="p-4">
                <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    <span>{customer.phone || 'N/A'}</span>
                </div>
            </td>
            <td className="p-4 text-center">
                <div className="flex justify-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                        Active
                    </span>
                </div>
            </td>
        </tr>
    );

    const renderMobileCard = (customer) => (
        <div key={customer.id} className="flex flex-col gap-4 p-4 border-b border-gray-100 bg-white last:border-0 font-mono">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                    {customer.image ? (
                         <Image 
                            src={customer.image} 
                            alt={customer.firstname || "Customer"} 
                            className="object-cover rounded-full" 
                            width={48} 
                            height={48}
                            unoptimized
                        />
                    ) : (
                        <User size={24} />
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-sm text-gray-900">{customer.firstname} {customer.lastname}</h3>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit">Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 bg-gray-50 p-3 rounded-lg text-xs">
                <div className="flex items-center gap-3 text-gray-600">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{customer.phone || 'N/A'}</span>
                </div>
            </div>
        </div>
    );

    return (
        <DataTable
            title="My Customers"
            headers={tableHeadings}
            data={customers}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            showPagination={false}
        />
    );
}
