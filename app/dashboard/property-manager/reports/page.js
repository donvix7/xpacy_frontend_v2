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
import ServiceGrowthChart from "@/app/_components/ServiceGrowthChart";
import RevenueOverviewChart from "@/app/_components/RevenueOverviewChart";
import ServicesByTypeChart from "@/app/_components/ServicesByTypeChart";
import ExportButton from "@/app/_components/ExportButton";
import { MdWarning } from "react-icons/md";
import { FaBuilding, FaChartPie, FaFileContract, FaMoneyBillWave } from "react-icons/fa6";

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

    const occupiedCount = properties.filter(p => (p.availability_status || "").toLowerCase() === "occupied").length;
    const occupancyRate = properties.length > 0 ? Math.round((occupiedCount / properties.length) * 100) : 0;

    const activeLeases = myBookings.filter(b => (b.status || "").toLowerCase() === "active" || (b.status || "").toLowerCase() === "confirmed");
    const pendingLeases = myBookings.filter(b => (b.status || "").toLowerCase() === "pending");

    const totalCollected = myInvoices.filter(inv => (inv.status || "").toLowerCase() === "paid").reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    const totalOutstanding = myInvoices.filter(inv => (inv.status || "").toLowerCase() === "pending").reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

    
const summaryCards = [
    { 
        label: "Total Properties", 
        value: properties.length, 
        color: "bg-primary-100", 
        icon: <FaBuilding className="w-5 h-5 text-primary-700" /> 
    },
    { 
        label: "Occupancy Rate", 
        value: `${occupancyRate}%`, 
        color: "bg-blue-100", 
        icon: <FaChartPie className="w-5 h-5 text-blue-700" /> 
    },
    { 
        label: "Active Leases", 
        value: activeLeases.length, 
        color: "bg-amber-100", 
        icon: <FaFileContract className="w-5 h-5 text-amber-700" /> 
    },
    { 
        label: "Collected", 
        value: `$${totalCollected.toLocaleString()}`, 
        color: "bg-green-100", 
        icon: <FaMoneyBillWave className="w-5 h-5 text-green-700" /> 
    },
    { 
        label: "Outstanding", 
        value: `$${totalOutstanding.toLocaleString()}`, 
        color: "bg-red-100", 
        icon: <MdWarning className="w-5 h-5 text-red-700" /> 
    },
];

    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Reports & Analytics</h1>
                <div className="flex gap-2">
                   
                    <ExportButton
                        data={myServices}
                        filename="services_report"
                        options={[
                            { id: "all", label: "All Services" },
                            { id: "summary", label: "Services Summary" },
                        ]}
                    />
                </div>
            </div>

            <DashboardGridItem title={"Report Overview"}>
                <SummaryCards cards={summaryCards} />
            </DashboardGridItem>

            <div className="flex flex-col gap-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title="Properties Distribution">
                        <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm flex items-center justify-center min-h-[350px]">
                            <PropertiesPieChart properties={properties} />
                        </div>
                    </DashboardGridItem>

                    <DashboardGridItem title="Service Requests by Category">
                        <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm flex items-center justify-center min-h-[350px]">
                            <ServicesByTypeChart services={myServices} />
                        </div>
                    </DashboardGridItem>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title="Service Request Growth (by Month)">
                        <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm min-h-[350px]">
                            <ServiceGrowthChart services={myServices} />
                        </div>
                    </DashboardGridItem>

                    <DashboardGridItem title="Monthly Revenue Overview">
                        <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm min-h-[350px]">
                            <RevenueOverviewChart payments={myInvoices} />
                        </div>
                    </DashboardGridItem>
                </div>

                <DashboardGridItem title="Monthly Report Summary">
                    <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 border border-primary-100 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Properties Managed</p>
                                <p className="text-2xl font-bold text-primary">{properties.length}</p>
                            </div>
                            <div className="text-center p-4 border border-primary-100 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Service Requests</p>
                                <p className="text-2xl font-bold text-[#73A0BE]">{myServices.length}</p>
                            </div>
                            <div className="text-center p-4 border border-primary-100 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Leases Active</p>
                                <p className="text-2xl font-bold text-green-600">{activeLeases.length}</p>
                            </div>
                        </div>
                    </div>
                </DashboardGridItem>
            </div>
        </div>
    );
}
