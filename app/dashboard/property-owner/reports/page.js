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
    const vacancyCount = properties.filter(p => ["vacant", "available", "active"].includes((p.availability_status || "").toLowerCase())).length;
    const occupancyRate = properties.length > 0 ? Math.round((occupiedCount / properties.length) * 100) : 0;

    const totalRevenue = myInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    const paidInvoices = myInvoices.filter(inv => (inv.status || "").toLowerCase() === "paid");
    const pendingInvoices = myInvoices.filter(inv => (inv.status || "").toLowerCase() === "pending");
    const collected = paidInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    const outstanding = pendingInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

    const maintenanceServices = myServices.filter(s =>
        ["maintenance", "repair", "plumbing", "electrical", "cleaning", "hvac", "painting", "general"].includes(
            (s.service_type || s.category || "").toLowerCase()
        )
    );
    const maintenanceCost = maintenanceServices.reduce((sum, s) => sum + (parseFloat(s.cost || s.amount) || 0), 0);

    const serviceChargeInvoices = myInvoices.filter(inv => (inv.reason || inv.type || "").toLowerCase().includes("service charge"));
    const serviceChargeCollected = serviceChargeInvoices.filter(inv => (inv.status || "").toLowerCase() === "paid").reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

    const netIncome = collected - maintenanceCost;

    const summaryCards = [
        { label: "Occupancy Rate", value: `${occupancyRate}%`, color: "bg-primary-700", icon: <span className="text-white text-lg font-bold">{occupancyRate}</span> },
        { label: "Revenue Collected", value: `$${collected.toLocaleString()}`, color: "bg-[#73A0BE]", icon: <span className="text-white text-lg font-bold">$</span> },
        { label: "Outstanding Rent", value: `$${outstanding.toLocaleString()}`, color: "bg-red-100", icon: <span className="text-red-600 text-lg font-bold">$</span> },
        { label: "Maintenance Costs", value: `$${maintenanceCost.toLocaleString()}`, color: "bg-[#C7D9E5]", icon: <span className="text-white text-lg font-bold">$</span> },
        { label: "Service Charges", value: `$${serviceChargeCollected.toLocaleString()}`, color: "bg-[#FBC0BC]", icon: <span className="text-white text-lg font-bold">$</span> },
        { label: "Net Income", value: `$${netIncome.toLocaleString()}`, color: "bg-green-100", icon: <span className="text-green-600 text-lg font-bold">$</span> },
    ];

    return (
        <div className="p-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Reports & Analytics</h1>

            <div className="mb-10">
                <SummaryCards cards={summaryCards} />
            </div>

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

                <DashboardGridItem title="Financial Summary">
                    <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 border border-primary-100 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold text-primary">${totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-4 border border-primary-100 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                                <p className="text-2xl font-bold text-red-600">${maintenanceCost.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-4 border border-primary-100 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Net Income</p>
                                <p className="text-2xl font-bold text-green-600">${netIncome.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </DashboardGridItem>
            </div>
        </div>
    );
}
