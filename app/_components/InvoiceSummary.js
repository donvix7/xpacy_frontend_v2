import { IoCardOutline } from "react-icons/io5";
import { formatCurrency } from "../_lib/utils";
import { FaHandshake, FaTag, FaUsers } from "react-icons/fa6";
import { getAllInvoices, getUserInvoices } from "../_lib/data-services";
import { FaHome } from "react-icons/fa";
import { Home } from "lucide-react";


export default async function InvoiceSummary() {

    const [invoice] = await Promise.all([
        getAllInvoices()
    ])
    console.log(invoice)

    const totalPayments = invoice?.total_paid || 0;
    const totalServices = invoice?.totals_by_reasons?.services || 0;
    const totalShortlets = invoice?.totals_by_reasons?.shortlets || 0;
    const totalRent = invoice?.totals_by_reasons?.rent || 0;
    const totalUnpaid = invoice?.total_unpaid || 0;
    const totalPurchases = invoice?.purchases || 0;

    const items = [
        { 
            title: "Total Paid", 
            count: formatCurrency(totalPayments),
            color: "bg-green-50 border-green-100",
            bgColor:"bg-green-50",
            icon: <IoCardOutline className="text-green-500" size={20} /> 
        },
        { 
            title: "Total Services", 
            count: formatCurrency(totalServices),
            color: "bg-blue-50 border-blue-100",
            bgColor:"bg-blue-50",
            icon: <FaUsers className="text-blue-500" size={20} /> 
        },
        { 
            title: "Total Shortlets", 
            count: formatCurrency(totalShortlets),
            color: "bg-purple-50 border-purple-100",
            bgColor:"bg-purple-50",
            icon: <Home className="text-purple-500" size={20} /> 
        },
        { 
            title: "Total Rent", 
            count: formatCurrency(totalRent),
            color: "bg-orange-50 border-orange-100",
            bgColor:"bg-orange-50",
            icon: <FaTag className="text-orange-500" size={20} /> 
        },
        { 
            title: "Total Unpaid", 
            count: formatCurrency(totalUnpaid),
            color: "bg-red-50 border-red-100",
            bgColor:"bg-red-50",
            icon: <FaHandshake className="text-red-500" size={20} /> 
        },
    ];
    
    return (
        <div className="p-6 flex flex-col gap-4 border border-primary-200 rounded-lg">
            <p className="lg:text-md text-base">Summary</p>
            <div className="flex flex-col gap-4">
                     {/* Main Hero Card */}
                     <div className="flex flex-col border border-primary-200 rounded-lg px-6 py-7 relative overflow-hidden bg-white mb-4">
                        <div className="flex gap-2 items-center lg:w-[256px] w-full" >
                            <span className="w-12 h-12 text-primary-300 bg-yellow-200 rounded-full flex items-center justify-center text-2xl "><FaUsers /></span>
                            <span className="font-mono text-primary-900 uppercase">Total Invoices</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">{invoice.length}</p>
                        <div className="w-[220px] h-[220px] rounded-full absolute lg:-right-[7%] -right-[70%] lg:-top-1 -top-10 bg-primary-700 z-10"></div>
                        <div className="w-[220px] h-[220px] rounded-full absolute lg:right-[4%] -right-[65%] top-2 bg-[#73A0BE]"></div>
                    </div>

                    {/* Grid Items */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {items.map((item, index) => (
                <div key={index} className="bg-white rounded-xl border border-primary-200  p-6 duration-300 flex justify-between ">
                    <div className="flex flex-col gap-2 justify-between">
                        <p className="text-gray-600 text-sm capitalize">{item.title}</p>
                        <p className="text-2xl font-bold mt-1">{item.count.toLocaleString()}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${item.color}`}>
                        {item.icon}
                    </div>
                </div>
            ))}
        </div>
                </div>
        </div>
    )
}