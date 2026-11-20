import { cookies } from "next/headers";
import Link from "next/link";
import { Plus, Wrench } from "lucide-react";
import { getPropertyOwnerBookings, getPropertyOwnerServices, getPropertyOwnerProfile, getUserNotifications, getPropertyOwnerProperties, getPropertyOwnerInvoices } from "@/app/_lib/data-services";
import PropertiesOverviewWrapper from "@/app/_components/PropertiesOverviewWrapper";
import ServicesOverviewWrapper from "@/app/_components/ServicesOverviewWrapper";
import PaymentsOverviewWrapper from "@/app/_components/PaymentsOverviewWrapper";
import NotificationsSummary from "@/app/_components/NotificationsSummary";
import PropertiesTableList from "@/app/_components/PropertiesTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import { FaBuilding, FaFileContract, FaMoneyBillWave, FaWrench } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getPropertyOwnerProfile(token),
        getPropertyOwnerProperties(token, { limit: 10000 }),
        getPropertyOwnerServices(token),
        getPropertyOwnerBookings(token),
        getUserNotifications(token),
        getPropertyOwnerInvoices(token),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const propertiesData = results[1].status === "fulfilled" ? results[1].value : [];
    const services = results[2].status === "fulfilled" ? results[2].value : [];
    const bookings = results[3].status === "fulfilled" ? results[3].value : [];
    const notifications = results[4].status === "fulfilled" ? results[4].value : [];
    const invoices = results[5].status === "fulfilled" ? results[5].value : [];

    const allProperties = Array.isArray(propertiesData?.[0]) ? propertiesData[0] : Array.isArray(propertiesData) ? propertiesData : [];
    const matchedProperties = allProperties.filter(p => p.property_owner_id === profile?.id);
    const properties = matchedProperties.length > 0 ? matchedProperties : allProperties;
    const myServices = Array.isArray(services) ? services : [];
    const myBookings = Array.isArray(bookings) ? bookings : [];
    const myInvoices = Array.isArray(invoices) ? invoices : [];

    const occupiedCount = properties.filter(p => (p.availability_status || "").toLowerCase() === "occupied").length;
    const vacancyCount = properties.filter(p => ["vacant", "available", "active"].includes((p.availability_status || "").toLowerCase())).length;

    const activeLeases = myBookings.filter(b => (b.status || "").toLowerCase() === "active" || (b.status || "").toLowerCase() === "confirmed");
    const pendingLeases = myBookings.filter(b => (b.status || "").toLowerCase() === "pending");

    const pendingServices = myServices.filter(s => (s.status || "").toLowerCase() === "pending");
    const inProgressServices = myServices.filter(s => (s.status || "").toLowerCase() === "in-progress");

    const totalCollected = myInvoices.filter(inv => (inv.status || "").toLowerCase() === "paid").reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

    const firstName =
        profile?.first_name ||
        profile?.firstname ||
        profile?.name ||
        profile?.full_name ||
        "Manager";

    const formattedDate = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const heroStats = [
        {
            label: "Total Properties",
            value: properties.length,
            hint: `${occupiedCount} occupied · ${vacancyCount} vacant`,
        },
        {
            label: "Active Leases",
            value: activeLeases.length,
            hint: pendingLeases.length ? `${pendingLeases.length} pending approval` : "All confirmed",
        },
        {
            label: "Pending Services",
            value: pendingServices.length,
            hint: inProgressServices.length ? `${inProgressServices.length} in progress` : "Awaiting dispatch",
        },
        {
            label: "Collected Revenue",
            value: `$${totalCollected.toLocaleString()}`,
            hint: "Paid invoices to date",
        },
    ];

    const summaryCards = [
        { 
            label: "Total Properties", 
            value: properties.length, 
            color: "bg-primary-100", 
            icon: <FaBuilding className="w-5 h-5 text-primary-700" /> 
        },
        { 
            label: "Occupied Units", 
            value: occupiedCount, 
            color: "bg-blue-100", 
            icon: <FiUsers className="w-5 h-5 text-blue-700" /> 
        },
        { 
            label: "Active Leases", 
            value: activeLeases.length, 
            color: "bg-amber-100", 
            icon: <FaFileContract className="w-5 h-5 text-amber-700" /> 
        },
        { 
            label: "Pending Services", 
            value: pendingServices.length, 
            color: "bg-secondary-100", 
            icon: <FaWrench className="w-5 h-5 text-secondary-700" /> 
        },
        { 
            label: "Collected", 
            value: `$${totalCollected.toLocaleString()}`, 
            color: "bg-green-100", 
            icon: <FaMoneyBillWave className="w-5 h-5 text-green-700" /> 
        },
    ];

    return (
        <div className="space-y-8 p-4">
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
            {/* ---------- Hero summary ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Property manager console · {formattedDate}
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                Welcome back, {firstName}
                            </h1>
                            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                                Oversee assigned properties, track tenant leases, maintenance and service tickets in one place.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href="/dashboard/property-manager/services"
                                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <Wrench className="h-4 w-4" aria-hidden="true" />
                                Manage services
                            </Link>
                            <Link
                                href="/property-manager/invite-staff"
                                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                            >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                Invite staff
                            </Link>
                        </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {heroStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4"
                            >
                                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                                    {stat.label}
                                </dt>
                                <dd className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.5px] text-white tabular-nums sm:text-[26px]">
                                    {typeof stat.value === "number"
                                        ? stat.value.toLocaleString()
                                        : stat.value}
                                </dd>
                                <p className="mt-1.5 truncate text-[11.5px] text-side-mute">
                                    {stat.hint}
                                </p>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            <SummaryCards cards={summaryCards} title="Overview" />

            <div className="flex flex-col gap-8">
                <DashboardGridItem title="Recent Properties" viewAllLink="/dashboard/property-manager/properties">
                    <PropertiesOverviewWrapper properties={properties} showFilters={false} />
                </DashboardGridItem>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title="Recent Services" viewAllLink="/dashboard/property-manager/services">
                        <ServicesOverviewWrapper services={myServices} showFilters={false} />
                    </DashboardGridItem>

                    <DashboardGridItem title="Recent Bookings" viewAllLink="/dashboard/property-manager/bookings">
                        <PaymentsOverviewWrapper bookings={myBookings} showFilters={false} />
                    </DashboardGridItem>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DashboardGridItem title="Notifications" viewAllLink="/dashboard/property-manager/notifications">
                        <NotificationsSummary notifications={Array.isArray(notifications) ? notifications : []} />
                    </DashboardGridItem>

                    <DashboardGridItem title="Properties" viewAllLink="/dashboard/property-manager/properties">
                        <PropertiesTableList properties={properties} recent={true} />
                    </DashboardGridItem>
                </div>
            </div>
        </div>
    );
}
