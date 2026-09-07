import { IoCardOutline } from "react-icons/io5";
import { formatCurrency } from "../_lib/utils";


export default function InvoiceSummary(invoices) {
    const totalPayments = invoices?.invoices?.total_paid || 0;
    const totalServices = invoices?.invoices?.totals_by_reasons?.services || 0;
    const totalShortlets = invoices?.invoices?.totals_by_reasons?.shortlets || 0;
    const totalRent = invoices?.invoices?.totals_by_reasons?.rent || 0;
    const totalUnpaid = invoices?.invoices?.total_unpaid || 0;
    const totalPurchases = invoices?.purchases || 0;
    
    

    return (
        <div className="p-6 flex flex-col gap-4 border border-primary-200 rounded-lg">
            <p className="lg:text-md text-base">Summary</p>
            <div className="flex flex-col gap-4">
                {/* Total payments card */}
                <div className="flex flex-col border border-primary-200 rounded-lg  px-6 py-7 relative overflow-hidden">
                    <div className="flex gap-2 items-center lg:w-[256px] w-full" >
                        <span className="w-12 h-12 text-primary bg-[#C3E5C4] rounded-full flex items-center justify-center text-2xl "><IoCardOutline /></span>
                        <span className="font-mono text-primary-900">TOTAL PAYMENTS</span>
                    </div>
                    <p className="text-center font-bold text-2xl font-mono w-[256px]">{formatCurrency(totalPayments)}</p>
                    <div className="w-[220px] h-[220px] rounded-full absolute lg:-right-[7%] -right-[70%] lg:-top-1 -top-10 bg-[#477899] z-10"></div>
                    <div className="w-[220px] h-[220px] rounded-full absolute lg:right-[4%] -right-[65%] top-2 bg-[#73A0BE]"></div>
                </div>
                {/*  */}
                <div className="flex flex-col lg:flex-row items-center justify-between  gap-4 lg:gap-0">
                    {/* Rent */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg bg-white border border-primary-100 lg:w-[322px] w-full">
                        <p className="font-mono text-[#477899] text-base">Rent</p>
                        <p className="text-center font-bold text-lg font-mono">{formatCurrency(totalRent)}</p>
                    </div>
                    {/* Shortlets */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg bg-white border border-primary-100 lg:w-[322px] w-full">
                        <p className="font-mono text-[#477899] text-base">Shortlets</p>
                        <p className="text-center font-bold text-lg font-mono">{formatCurrency(totalShortlets)}</p>
                    </div>
                    {/* Purchases */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg bg-white border border-primary-100 lg:w-[322px] w-full">
                        <p className="font-mono text-[#477899] text-base">Purchases</p>
                        <p className="text-center font-bold text-lg font-mono">{formatCurrency(totalPurchases)}</p>
                    </div>
                    {/* Unpaid */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg bg-white border border-primary-100 lg:w-[322px] w-full">
                        <p className="font-mono text-[#477899] text-base">Unpaid</p>
                        <p className="text-center font-bold text-lg font-mono">{formatCurrency(totalUnpaid)}</p>
                    </div>
                    {/* Services */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg bg-white border border-primary-100 lg:w-[322px] w-full">
                        <p className="font-mono text-[#477899] text-base">Services</p>
                        <p className="text-center font-bold text-lg font-mono">{formatCurrency(totalServices)}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}