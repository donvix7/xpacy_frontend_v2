import { cookies } from "next/headers";
import {
    getPropertyOwnerProperties,
    getManagedProperties,
    getPropertyOwnerServices,
    getBookedServices,
    getPropertyOwnerBookings,
    getAdminBooking,
    getPropertyOwnerInvoices,
    getInvoiceList,
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
import ExportButton from "@/app/_components/ExportButton";
import { MdWarning } from "react-icons/md";
import { FaBuilding, FaChartPie, FaFileContract, FaMoneyBillWave } from "react-icons/fa6";
import { formatCurrency } from "@/app/_lib/utils";
import { getReportAmount, getReportPaidAmount, getReportStatus, toReportArray } from "@/app/_lib/report-utils";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

const chartBox = "bg-card text-ink p-3 sm:p-6 rounded-lg border border-line shadow-sm min-h-[320px] min-w-0";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getPropertyOwnerProperties(token, { limit: 10000 }),
        getManagedProperties(10000),
        getPropertyOwnerServices(token),
        getBookedServices(token),
        getPropertyOwnerBookings(token),
        getAdminBooking(token),
        getPropertyOwnerInvoices(token),
        getInvoiceList(),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const rawOwnerProperties = results[0].status === "fulfilled" ? results[0].value : [];
    const rawManagedProperties = results[1].status === "fulfilled" ? results[1].value : [];
    const ownerProps = toReportArray(rawOwnerProperties);
    const managedProps = toReportArray(rawManagedProperties);
    const propertyMap = new Map();
    [...managedProps, ...ownerProps].forEach((p) => {
        const id = p?.id || p?._id || p?.property_id;
        if (id && !propertyMap.has(id)) propertyMap.set(id, p);
        else if (!id) propertyMap.set(Math.random(), p);
    });
    const properties = Array.from(propertyMap.values());

    const rawServices1 = results[2].status === "fulfilled" ? results[2].value : [];
    const rawServices2 = results[3].status === "fulfilled" ? results[3].value : [];
    const servList1 = toReportArray(rawServices1);
    const servList2 = toReportArray(rawServices2);
    const serviceMap = new Map();
    [...servList1, ...servList2].forEach((s) => {
        const id = s?.id || s?._id || s?.service_id;
        if (id && !serviceMap.has(id)) serviceMap.set(id, s);
        else if (!id) serviceMap.set(Math.random(), s);
    });
    const myServices = Array.from(serviceMap.values());

    const rawBookings1 = results[4].status === "fulfilled" ? results[4].value : [];
    const rawBookings2 = results[5].status === "fulfilled" ? results[5].value : [];
    const bookList1 = toReportArray(rawBookings1);
    const bookList2 = toReportArray(rawBookings2);
    const bookingMap = new Map();
    [...bookList1, ...bookList2].forEach((b) => {
        const id = b?.id || b?._id || b?.booking_id;
        if (id && !bookingMap.has(id)) bookingMap.set(id, b);
        else if (!id) bookingMap.set(Math.random(), b);
    });
    const myBookings = Array.from(bookingMap.values());

    const rawInvoices1 = results[6].status === "fulfilled" ? results[6].value : [];
    const rawInvoices2 = results[7].status === "fulfilled" ? results[7].value : [];
    const invList1 = toReportArray(rawInvoices1);
    const invList2 = toReportArray(rawInvoices2);
    const invoiceMap = new Map();
    [...invList1, ...invList2].forEach((inv) => {
        const id = inv?.id || inv?._id || inv?.invoice_id;
        if (id && !invoiceMap.has(id)) invoiceMap.set(id, inv);
        else if (!id) invoiceMap.set(Math.random(), inv);
    });
    const myInvoices = Array.from(invoiceMap.values());

    const occupiedCount = properties.filter(p => ["occupied", "rented", "leased"].includes(getReportStatus(p, ["availability_status", "occupancy_status", "status"]))).length;
    const occupancyRate = properties.length > 0 ? Math.round((occupiedCount / properties.length) * 100) : 0;

    const activeLeases = myBookings.filter(b => ["active", "confirmed"].includes(getReportStatus(b, ["booking_status", "status"])));

    const totalCollected = myInvoices.filter(inv => ["paid", "completed", "successful", "success"].includes(getReportStatus(inv, ["payment_status", "invoice_status", "status"]))).reduce((sum, inv) => sum + getReportPaidAmount(inv), 0);
    const totalOutstanding = myInvoices.filter(inv => ["pending", "overdue", "partial", "partially-paid", "unpaid"].includes(getReportStatus(inv, ["payment_status", "invoice_status", "status"]))).reduce((sum, inv) => sum + getReportAmount(inv), 0);

    
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
        value: formatCurrency(totalCollected),
        color: "bg-green-100", 
        icon: <FaMoneyBillWave className="w-5 h-5 text-green-700" /> 
    },
    { 
        label: "Outstanding", 
        value: formatCurrency(totalOutstanding),
        color: "bg-red-100", 
        icon: <MdWarning className="w-5 h-5 text-red-700" /> 
    },
];

    return (
        <div className="space-y-8 p-2">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            <div className="flex items-center justify-between mb-8">
                <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Reports & Analytics</p>
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

            <SummaryCards cards={summaryCards} title="Report Overview" />

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

                <DashboardGridItem title="Monthly Report Summary">
                    <div className="bg-card text-ink p-6 rounded-lg border border-line shadow-sm h-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 border border-line bg-soft/50 rounded-lg">
                                <p className="text-sm text-mute mb-1">Properties Managed</p>
                                <p className="text-2xl font-bold text-primary">{properties.length}</p>
                            </div>
                            <div className="text-center p-4 border border-line bg-soft/50 rounded-lg">
                                <p className="text-sm text-mute mb-1">Service Requests</p>
                                <p className="text-2xl font-bold text-[#73A0BE]">{myServices.length}</p>
                            </div>
                            <div className="text-center p-4 border border-line bg-soft/50 rounded-lg">
                                <p className="text-sm text-mute mb-1">Leases Active</p>
                                <p className="text-2xl font-bold text-green-600">{activeLeases.length}</p>
                            </div>
                        </div>
                    </div>
                </DashboardGridItem>
            </div>
        </div>
    );
}
