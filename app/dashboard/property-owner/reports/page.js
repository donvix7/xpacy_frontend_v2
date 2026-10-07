import { cookies } from "next/headers";
import {
    getPropertyOwnerProperties,
    getPropertyOwnerServices,
    getPropertyOwnerBookings,
    getPropertyOwnerInvoices,
} from "@/app/_lib/data-services";
import SummaryCards from "@/app/_components/SummaryCards";
import PropertiesPieChart from "@/app/_components/PropertiesPieChart";
import PropertyStatusChart from "@/app/_components/PropertyStatusChart";
import ServiceGrowthChart from "@/app/_components/ServiceGrowthChart";
import RevenueOverviewChart from "@/app/_components/RevenueOverviewChart";
import ServicesByTypeChart from "@/app/_components/ServicesByTypeChart";
import ServiceStatusChart from "@/app/_components/ServiceStatusChart";
import BookingsStatusChart from "@/app/_components/BookingsStatusChart";
import BookingsTrendChart from "@/app/_components/BookingsTrendChart";
import InvoiceStatusChart from "@/app/_components/InvoiceStatusChart";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import { FaArrowDown, FaChartLine, FaClock, FaDollarSign, FaReceipt } from "react-icons/fa6";
import { FaTools } from "react-icons/fa";
import { formatCurrency } from "@/app/_lib/utils";
import { getReportAmount, getReportPaidAmount, getReportStatus, toReportArray } from "@/app/_lib/report-utils";

const chartBox = "bg-white p-3 sm:p-6 rounded-lg border border-primary-100 shadow-sm min-h-[320px] min-w-0";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getPropertyOwnerProperties(token, { limit: 10000 }),
        getPropertyOwnerServices(token),
        getPropertyOwnerBookings(token),
        getPropertyOwnerInvoices(token),
    ]);

    const propertiesData = results[0].status === "fulfilled" ? results[0].value : [];
    const services = results[1].status === "fulfilled" ? results[1].value : [];
    const bookings = results[2].status === "fulfilled" ? results[2].value : [];
    const invoices = results[3].status === "fulfilled" ? results[3].value : [];

    const properties = toReportArray(Array.isArray(propertiesData?.[0]) ? propertiesData[0] : propertiesData);
    const myServices = toReportArray(services);
    const myBookings = toReportArray(bookings);
    const myInvoices = toReportArray(invoices);

    const occupiedCount = properties.filter(p => ["occupied", "rented", "leased"].includes(getReportStatus(p, ["availability_status", "occupancy_status", "status"]))).length;
    const occupancyRate = properties.length > 0 ? Math.round((occupiedCount / properties.length) * 100) : 0;

    const paidInvoices = myInvoices.filter(inv => ["paid", "completed", "successful", "success"].includes(getReportStatus(inv, ["payment_status", "invoice_status", "status"])));
    const outstandingInvoices = myInvoices.filter(inv => ["pending", "overdue", "partial", "partially-paid", "unpaid"].includes(getReportStatus(inv, ["payment_status", "invoice_status", "status"])));
    const collected = paidInvoices.reduce((sum, inv) => sum + getReportPaidAmount(inv), 0);
    const outstanding = outstandingInvoices.reduce((sum, inv) => sum + getReportAmount(inv), 0);

    const maintenanceServices = myServices.filter(s =>
        ["maintenance", "repair", "plumbing", "electrical", "cleaning", "hvac", "painting", "general"].includes(
            (s.service_type || s.category || "").toLowerCase()
        )
    );
    const maintenanceCost = maintenanceServices.reduce((sum, s) => sum + getReportAmount({ amount: s.cost ?? s.amount }), 0);

    const serviceChargeInvoices = myInvoices.filter(inv => (inv.reason || inv.type || "").toLowerCase().includes("service charge"));
    const serviceChargeCollected = serviceChargeInvoices.filter(inv => ["paid", "completed", "successful", "success"].includes(getReportStatus(inv, ["payment_status", "invoice_status", "status"]))).reduce((sum, inv) => sum + getReportPaidAmount(inv), 0);

    const totalRevenue = collected;
    const netIncome = collected - maintenanceCost;

    
const summaryCards = [
    {
        title: "Occupancy Rate",
        count: `${occupancyRate}%`,
        icon: <FaChartLine className="text-blue-700" size={20} />,
        color: "bg-blue-100 border-blue-100",
        bgColor: "bg-blue-100-700"
    },
    {
        title: "Revenue Collected",
        count: formatCurrency(collected),
        icon: <FaDollarSign className="text-gray-700" size={20} />,
        color: "bg-gray-100 border-gray-700",
        bgColor: "bg-gray-100"
    },
    {
        title: "Outstanding Rent",
        count: formatCurrency(outstanding),
        icon: <FaClock className="text-red-600" size={20} />,
        color: "bg-red-100 border-red-200",
        bgColor: "bg-red-100"
    },
    {
        title: "Maintenance Costs",
        count: formatCurrency(maintenanceCost),
        icon: <FaTools className="text-gray-700" size={20} />,
        color: "bg-indigo-100 border-indigo-100",
        bgColor: "bg-indigo-100"
    },
    {
        title: "Service Charges",
        count: formatCurrency(serviceChargeCollected),
        icon: <FaReceipt className="text-gray-700" size={20} />,
        color: "bg-pink-100 border-pink-100",
        bgColor: "bg-pink-100"
    },
    {
        title: "Net Income",
        count: formatCurrency(netIncome),
        icon: <FaArrowDown className="text-green-700" size={20} />,
        color: "bg-green-100 border-green-200",
        bgColor: "bg-green-100"
    }
];

    return (
        <div className="p-2 flex flex-col gap-8">
            <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Reports & Analytics</p>

            <SummaryCards cards={summaryCards} title="Financial Overview" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DashboardGridItem title="Properties Distribution">
                    <div className={`${chartBox} flex items-center justify-center`}>
                        <PropertiesPieChart properties={properties} />
                    </div>
                </DashboardGridItem>

                <DashboardGridItem title="Property Status Distribution">
                    <div className={chartBox}>
                        <PropertyStatusChart properties={properties} />
                    </div>
                </DashboardGridItem>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DashboardGridItem title="Service Requests by Category">
                    <div className={chartBox}>
                        <ServicesByTypeChart services={myServices} />
                    </div>
                </DashboardGridItem>

                <DashboardGridItem title="Service Status Breakdown">
                    <div className={chartBox}>
                        <ServiceStatusChart services={myServices} />
                    </div>
                </DashboardGridItem>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DashboardGridItem title="Service Request Growth (by Month)">
                    <div className={chartBox}>
                        <ServiceGrowthChart services={myServices} />
                    </div>
                </DashboardGridItem>

                <DashboardGridItem title="Bookings Trend (by Month)">
                    <div className={chartBox}>
                        <BookingsTrendChart bookings={myBookings} />
                    </div>
                </DashboardGridItem>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DashboardGridItem title="Bookings Status">
                    <div className={chartBox}>
                        <BookingsStatusChart bookings={myBookings} />
                    </div>
                </DashboardGridItem>

                <DashboardGridItem title="Revenue by Status">
                    <div className={chartBox}>
                        <InvoiceStatusChart invoices={myInvoices} currency />
                    </div>
                </DashboardGridItem>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DashboardGridItem title="Monthly Revenue Overview">
                    <div className={chartBox}>
                        <RevenueOverviewChart payments={myInvoices} />
                    </div>
                </DashboardGridItem>

                <DashboardGridItem title="Financial Summary">
                    <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm h-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 border border-primary-100 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
                            </div>
                            <div className="text-center p-4 border border-primary-100 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(maintenanceCost)}</p>
                            </div>
                            <div className="text-center p-4 border border-primary-100 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Net Income</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(netIncome)}</p>
                            </div>
                        </div>
                    </div>
                </DashboardGridItem>
            </div>
        </div>
    );
}
