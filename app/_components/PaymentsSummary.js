import { FaMoneyBillWave } from "react-icons/fa";
import { formatCurrency } from "@/app/_lib/utils";
import { BiBuildings } from "react-icons/bi";
import { AlertCircle, Timer } from "lucide-react";

export default function PaymentsSummary({ invoices = [], showHeading = true }) {
    const isPaid = (b) => ['paid', 'completed', 'active', 'confirmed', 'success', 'successful'].includes((b.payment_status || b.status || "").toLowerCase());
    const isPending = (b) => ['pending', 'processing'].includes((b.payment_status || b.status || "").toLowerCase());
    const isUnpaid = (b) => !isPaid(b) && !isPending(b);

    // Calculate counts and totals
    const counts = {
        totalRevenue: invoices
            .filter(isPaid)
            .reduce((acc, curr) => acc + Number(curr.total || 0), 0),
        paidCount: invoices.filter(isPaid).length,
        pendingCount: invoices.filter(isPending).length,
        unpaidCount: invoices.filter(isUnpaid).length,
    };


    const summaryItems = [
        {
            title: "Paid",
            count: counts.paidCount,
            icon: <FaMoneyBillWave />,
            color: "text-green-500",
            bgColor: "bg-green-50"
            
        },
        {
            title: "Pending",
            count: counts.pendingCount,
            icon: <Timer />,
            color: "text-yellow-500",
            bgColor: "bg-yellow-50"
        },
        {
            title: "Unpaid",
            count: counts.unpaidCount,
            icon: <AlertCircle />,
            color: "text-red-500",
            bgColor: "bg-red-50"
        }
    ];

    return (
      <div className="flex flex-col gap-4  bg-white">
                 
      
                  <div className="flex flex-col gap-4">
                      {/* Main Hero Card */}
                      <div className="flex flex-col border border-primary-200 rounded-lg px-6 py-7 relative overflow-hidden bg-white min-w-[250px] justify-center">
                          <div className="relative z-20 flex flex-col lg:items-start items-center lg:w-max">
                              <div className="flex gap-3 items-center">
                                  <span className="w-12 h-12 text-primary bg-primary-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl shadow-sm">
                                      <BiBuildings />
                                  </span>
                                  <span className="font-mono text-primary-900 font-bold uppercase tracking-wide text-sm">Payments</span>
                              </div>
                              <p className="text-center lg:text-left font-bold text-4xl font-mono mt-4 lg:ml-[60px] text-gray-800">₦ {' '}{counts.totalRevenue.toLocaleString()}</p>
                          </div>
      
                          {/* Decorative Background Circles */}
                          <div className="w-[220px] h-[220px] rounded-full absolute lg:-right-[10%] -right-[70%] lg:-top-4 -top-10 bg-primary-700 z-10 opacity-90 transition-transform duration-700 hover:scale-105"></div>
                          <div className="w-[220px] h-[220px] rounded-full absolute lg:right-[2%] -right-[65%] top-6 bg-[#73A0BE] z-0 opacity-70 transition-transform duration-700 hover:-translate-x-2"></div>
                      </div>
      
                      {/* Grid Items */}
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 md:gap-4">
                        {summaryItems.map((item, index) => (
                            <div key={index} className="bg-white rounded-xl border border-primary-200 p-4 md:p-6 duration-300 flex items-center justify-between transition-shadow min-w-[160px]">
                                <div className="flex flex-col gap-1 md:gap-2 min-w-0 flex-1">
                                    <p className="text-gray-600 text-xs sm:text-sm capitalize truncate">{item.title}</p>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5">{item.count.toLocaleString()}</p>
                                </div>
                                <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl flex-shrink-0 ml-2 sm:ml-3 ${item.color} ${item.bgColor}`}>
                                    {item.icon}
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
              </div>
    );
}
