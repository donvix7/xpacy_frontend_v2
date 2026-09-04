import { cookies } from "next/headers";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
    getPropertyOwnerServices,
    getPropertyOwnerBookings,
    getPropertyOwnerInvoices,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
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
import { FaMoneyBillWave, FaUsers } from "react-icons/fa6";
import { BsStack, BsTools } from "react-icons/bs";
import { FiClock, FiPieChart } from "react-icons/fi";

const chartBox = "bg-white p-6 rounded-lg border border-primary-100 shadow-sm min-h-[350px]";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getPropertyOwnerProfile(token),
        getPropertyOwnerProperties(token, { limit: 10000 }),
        getPropertyOwnerServices(token),
        getPropertyOwnerBookings(token),
        getPropertyOwnerInvoices(token),
    ]);

    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const propertiesData = results[1].status === "fulfilled" ? results[1].value : [];
    const services = results[2].status === "fulfilled" ? results[2].value : [];
    const bookings = results[3].status === "fulfilled" ? results[3].value : [];
    const invoices = results[4].status === "fulfilled" ? results[4].value : [];

    const allProperties = Array.isArray(propertiesData?.[0]) ? propertiesData[0] : Array.isArray(propertiesData) ? propertiesData : [];
    const properties = allProperties.filter(p => p.property_owner_id === profile?.id);
    const myServices = Array.isArray(services) ? services : [];
    const myBookings = Array.isArray(bookings) ? bookings : [];
    const myInvoices = Array.isArray(invoices) ? invoices : [];

    const totalWorkOrders = myServices.length;
    const assignedOrders = myServices.filter(s => (s.status || "").toLowerCase() === "assigned").length;
    const acceptedOrders = myServices.filter(s => (s.status || "").toLowerCase() === "accepted").length;
    const inProgressOrders = myServices.filter(s => (s.status || "").toLowerCase() === "in-progress").length;
    const awaitingParts = myServices.filter(s => (s.status || "").toLowerCase() === "awaiting-parts").length;
    const completedOrders = myServices.filter(s => (s.status || "").toLowerCase() === "completed").length;
    const closedOrders = myServices.filter(s => (s.status || "").toLowerCase() === "closed").length;
    const pendingOrders = myServices.filter(s => (s.status || "").toLowerCase() === "pending").length;

    const completionRate = totalWorkOrders > 0 ? Math.round(((completedOrders + closedOrders) / totalWorkOrders) * 100) : 0;
    const totalMaintenanceCost = myServices.reduce((sum, s) => sum + (parseFloat(s.cost || s.amount) || 0), 0);

    const vendorIds = new Set(myServices.map(s => s.service_provider_id || s.provider_id).filter(Boolean));
    const uniqueVendors = vendorIds.size;

  
const summaryCards = [
    { 
        label: "Total Work Orders", 
        value: totalWorkOrders, 
        color: "bg-primary-100", 
        icon: <BsStack className="w-5 h-5 text-primary-700" />
    },
    { 
        label: "Completion Rate", 
        value: `${completionRate}%`, 
        color: "bg-green-100",
        icon: <FiPieChart className="w-5 h-5 text-green-700" />
    },
    { 
        label: "In Progress", 
        value: inProgressOrders, 
        color: "bg-amber-100", 
        icon: <FiClock className="w-5 h-5 text-amber-700" />
    },
    { 
        label: "Awaiting Parts", 
        value: awaitingParts, 
        color: "bg-yellow-100",
        icon: <BsTools className="w-5 h-5 text-yellow-700" />
    },
    { 
        label: "Maintenance Cost", 
        value: `$${totalMaintenanceCost.toLocaleString()}`, 
        color: "bg-slate-100", 
        icon: <FaMoneyBillWave className="w-5 h-5 text-slate-700" />
    },
    { 
        label: "Active Vendors", 
        value: uniqueVendors, 
        color: "bg-orange-100", 
        icon: <FaUsers className="w-5 h-5 text-orange-700" />
    },
];

    return (
        <div className="p-6 flex flex-col gap-8">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Reports & Analytics</h1>

            <SummaryCards cards={summaryCards} title="Overview" />

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
                <DashboardGridItem title="Work Order Status Breakdown">
                    <div className={chartBox}>
                        <div className="space-y-4">
                            {[
                                { label: "Assigned", count: assignedOrders, color: "bg-blue-500" },
                                { label: "Accepted", count: acceptedOrders, color: "bg-indigo-500" },
                                { label: "In Progress", count: inProgressOrders, color: "bg-[#73A0BE]" },
                                { label: "Awaiting Parts", count: awaitingParts, color: "bg-yellow-500" },
                                { label: "Completed", count: completedOrders, color: "bg-green-500" },
                                { label: "Closed", count: closedOrders, color: "bg-gray-500" },
                                { label: "Pending", count: pendingOrders, color: "bg-[#FBC0BC]" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <span className="text-sm text-gray-600 w-32">{item.label}</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${item.color}`}
                                            style={{ width: totalWorkOrders > 0 ? `${(item.count / totalWorkOrders) * 100}%` : "0%" }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </DashboardGridItem>

                <DashboardGridItem title="Bookings Status">
                    <div className={chartBox}>
                        <BookingsStatusChart bookings={myBookings} />
                    </div>
                </DashboardGridItem>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DashboardGridItem title="Monthly Revenue Overview">
                    <div className={chartBox}>
                        <RevenueOverviewChart payments={myInvoices} />
                    </div>
                </DashboardGridItem>

                <DashboardGridItem title="Revenue by Status">
                    <div className={chartBox}>
                        <InvoiceStatusChart invoices={myInvoices} currency />
                    </div>
                </DashboardGridItem>
            </div>
        </div>
    );
}