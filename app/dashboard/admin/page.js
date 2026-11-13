import Link from "next/link";
import { cookies } from "next/headers";
import { getAdminProperties, getAdminServices, getPropertyOwner, getAllAdmin, getAllUsers, getAdminBooking, getUserNotifications, getAdminProfile, getAllInvoices } from "@/app/_lib/data-services";
import { getOrganizationIdFromProperty } from "@/app/_lib/data-services";
import SummaryCards from "@/app/_components/SummaryCards";
import OverviewPanel from "@/app/_components/OverviewPanel";
import AdminPropertyList from "@/app/_components/AdminPropertyList";
import AdminServiceList from "@/app/_components/AdminServiceList";
import AdminBookingList from "@/app/_components/AdminBookingList";
import AdminNotificationList from "@/app/_components/AdminNotificationList";
import {
    ArrowUpRight,
    BellRing,
    Building2,
    CalendarClock,
    CircleAlert,
    Plus,
    ReceiptText,
    Wrench,
} from "lucide-react";

const sumAmount = (invoices) => invoices.reduce((sum, invoice) => sum + (parseFloat(invoice?.amount) || 0), 0);

function ViewAll({ href, label = "View all" }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-ink px-3 py-1.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-soft"
        >
            {label}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
    );
}

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getAdminProfile(token),
        getAdminProperties(token),
        getAdminServices(token),
        getPropertyOwner(token),
        getAllAdmin(token),
        getAllUsers(token),
        getAdminBooking(token),
        getAllInvoices(token),
        getUserNotifications(token),
    ]);

    const profile = results[0].status === "fulfilled" ? results[0].value : null;
    const propertiesData = results[1].status === "fulfilled" ? results[1].value : { properties: [], pagination: {} };
    const services = results[2].status === "fulfilled" ? results[2].value : [];
    const propertyOwners = results[3].status === "fulfilled" ? results[3].value : [];
    const admins = results[4].status === "fulfilled" ? results[4].value : [];
    const users = results[5].status === "fulfilled" ? results[5].value : [];
    const bookings = results[6].status === "fulfilled" ? results[6].value : [];
    const invoices = results[7].status === "fulfilled" ? results[7].value : [];
    const notifications = results[8].status === "fulfilled" ? results[8].value : [];

    const properties = (propertiesData?.properties || []).filter((property) => !getOrganizationIdFromProperty(property));
    const totalProperties = properties.length;
    const allUsers = Array.isArray(users) ? users : [];
    const allBookings = Array.isArray(bookings) ? bookings : [];
    const allInvoices = Array.isArray(invoices) ? invoices : [];
    const allServices = Array.isArray(services) ? services : [];
    const allOwners = Array.isArray(propertyOwners) ? propertyOwners : [];
    const allAdmins = Array.isArray(admins) ? admins : [];
    const allNotifications = Array.isArray(notifications) ? notifications : [];

    const pendingServices = allServices.filter((service) => (service.status || "").toLowerCase() === "pending");
    const totalRevenue = Math.round(sumAmount(allInvoices));

    const invoiceStatus = (invoice) => String(invoice?.status || invoice?.payment_status || "").toLowerCase();
    const paidInvoices = allInvoices.filter((invoice) => invoiceStatus(invoice) === "paid");
    const unpaidInvoices = allInvoices.filter((invoice) => invoiceStatus(invoice) === "unpaid");
    const incompleteInvoices = allInvoices.filter((invoice) => invoiceStatus(invoice) === "incomplete");
    const cancelledInvoices = allInvoices.filter((invoice) => invoiceStatus(invoice) === "cancelled");
    const openInvoices = [...unpaidInvoices, ...incompleteInvoices];
    const openInvoiceValue = Math.round(sumAmount(openInvoices));

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const newUsers = allUsers.filter((user) => {
        const created = new Date(user?.createdAt || user?.created_at || user?.date_joined);
        return !Number.isNaN(created.getTime()) && now - created.getTime() <= thirtyDays;
    }).length;
    const upcomingBookings = allBookings.filter((booking) => {
        const start = new Date(booking?.start_date || booking?.createdAt);
        return !Number.isNaN(start.getTime()) && start.getTime() >= now;
    });

    const today = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date());

    const firstName = profile?.username?.split(" ")[0] || "Admin";

    const summaryCards = [
        {
            label: "Total Properties",
            value: totalProperties,
            accent: "bg-blue-500",
            meta: pendingServices.length
                ? `${pendingServices.length} pending service request${pendingServices.length === 1 ? "" : "s"}`
                : "All service requests handled",
        },
        {
            label: "Total Users",
            value: allUsers.length,
            accent: "bg-violet-500",
            meta: `${allAdmins.length} admin${allAdmins.length === 1 ? "" : "s"} in the console`,
        },
        {
            label: "Property Owners",
            value: allOwners.length,
            accent: "bg-sky-500",
            meta: "Owner accounts on the platform",
        },
        {
            label: "Total Bookings",
            value: allBookings.length,
            accent: "bg-amber-500",
            meta: upcomingBookings.length
                ? `${upcomingBookings.length} upcoming`
                : "No upcoming check-ins",
        },
        {
            label: "Total Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            accent: "bg-emerald-500",
            meta: `$${openInvoiceValue.toLocaleString()} still outstanding`,
        },
    ];

    const heroStats = [
        { label: "Pending services", value: pendingServices.length, hint: "Awaiting action" },
        { label: "Open invoices", value: openInvoices.length, hint: `$${openInvoiceValue.toLocaleString()} outstanding` },
        { label: "New users", value: newUsers, hint: "Joined in 30 days" },
        { label: "Notifications", value: allNotifications.length, hint: "Latest activity" },
    ];

    const attentionItems = [
        {
            label: "Service requests awaiting action",
            value: pendingServices.length,
            hint: "Assign providers or close tickets",
            href: "/dashboard/admin/services",
            dot: "bg-amber-500",
        },
        {
            label: "Invoices still open",
            value: openInvoices.length,
            hint: `$${openInvoiceValue.toLocaleString()} outstanding`,
            href: "/dashboard/admin/payments",
            dot: "bg-rose-500",
        },
        {
            label: "New user accounts",
            value: newUsers,
            hint: "Registered in the last 30 days",
            href: "/dashboard/admin/users",
            dot: "bg-violet-500",
        },
        {
            label: "Platform notifications",
            value: allNotifications.length,
            hint: "Recent account and payment activity",
            href: "/dashboard/admin/notifications",
            dot: "bg-blue-500",
        },
    ];

    const billingSegments = [
        { label: "Paid", count: paidInvoices.length, color: "bg-emerald-500" },
        { label: "Unpaid", count: unpaidInvoices.length, color: "bg-rose-500" },
        { label: "Incomplete", count: incompleteInvoices.length, color: "bg-amber-500" },
        { label: "Cancelled", count: cancelledInvoices.length, color: "bg-slate-400" },
    ];
    const invoiceCount = Math.max(allInvoices.length, 1);

    const propertyList = properties.slice(0, 6);
    const slicedServices = allServices.slice(0, 6);
    const slicedNotifications = allNotifications.slice(0, 4);
    const slicedBookings = allBookings.slice(0, 6);

    return (
        <div className="p-2 flex flex-col gap-5">
            {/* Hero band */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
               
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                Admin console · {today}
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                Welcome back, {firstName}
                            </h1>
                            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                                Here is the pulse of the portfolio: approvals, service tickets and revenue health in one place.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href="/dashboard/admin/services"
                                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <Wrench className="h-4 w-4" aria-hidden="true" />
                                Manage services
                            </Link>
                            <Link
                                href="/admin/add-new-property"
                                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                            >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                Add property
                            </Link>
                        </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {heroStats.map((stat) => (
                            <div key={stat.label} className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4">
                                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">{stat.label}</dt>
                                <dd className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.5px] text-white tabular-nums sm:text-[26px]">
                                    {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                                </dd>
                                <p className="mt-1.5 truncate text-[11.5px] text-side-mute">{stat.hint}</p>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            <SummaryCards cards={summaryCards} title={null} />

            {/* Sectional grid */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <OverviewPanel
                    className="xl:col-span-8"
                    title="Property portfolio"
                    subtitle={`${totalProperties} propert${totalProperties === 1 ? "y" : "ies"} under management`}
                    icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
                    tone="slate"
                    action={<ViewAll href="/dashboard/admin/properties" />}
                    contentClassName="p-3 sm:p-4"
                >
                    <AdminPropertyList properties={propertyList} />
                </OverviewPanel>

                <OverviewPanel
                    className="xl:col-span-4"
                    title="Needs your attention"
                    subtitle="Items waiting on a decision"
                    icon={<CircleAlert className="h-5 w-5" aria-hidden="true" />}
                    tone="slate"
                >
                    <ul className="flex flex-col divide-y divide-line">
                        {attentionItems.map((item, index) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={`group flex items-center gap-3 py-3 transition-colors hover:text-side-active ${
                                        index === 0 ? "pt-0" : ""
                                    } ${index === attentionItems.length - 1 ? "pb-0" : ""}`}
                                >
                                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`} aria-hidden="true" />
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-baseline justify-between gap-2">
                                            <span className="truncate text-[13.5px] font-medium text-ink group-hover:text-side-active">{item.label}</span>
                                            <span className="text-[17px] font-semibold leading-none text-ink tabular-nums">{item.value}</span>
                                        </span>
                                        <span className="mt-1 block truncate text-[12px] text-mute">{item.hint}</span>
                                    </span>
                                    <ArrowUpRight className="h-4 w-4 shrink-0 text-mute transition-transform group-hover:-translate-y-0.5 group-hover:text-side-active" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </OverviewPanel>

                <OverviewPanel
                    className="xl:col-span-8"
                    title="Service requests"
                    subtitle="Latest maintenance tickets across the portfolio"
                    icon={<Wrench className="h-5 w-5" aria-hidden="true" />}
                    tone="slate"
                    action={<ViewAll href="/dashboard/admin/services" />}
                    contentClassName="p-3 sm:p-4"
                >
                    <AdminServiceList services={slicedServices} embedded />
                </OverviewPanel>

                <OverviewPanel
                    className="xl:col-span-4"
                    title="Billing snapshot"
                    subtitle="Invoice status across all accounts"
                    icon={<ReceiptText className="h-5 w-5" aria-hidden="true" />}
                    tone="slate"
                    action={<ViewAll href="/dashboard/admin/payments" />}
                >
                    <div className="flex flex-col gap-5">
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-mute">Revenue recorded</p>
                            <p className="mt-1 text-[30px] font-semibold leading-none tracking-[-1px] text-ink tabular-nums">
                                ${totalRevenue.toLocaleString()}
                            </p>
                            <p className="mt-2 text-[12.5px] leading-snug text-mute">
                                <span className="font-semibold text-ink">${openInvoiceValue.toLocaleString()}</span> outstanding across {openInvoices.length} open invoice{openInvoices.length === 1 ? "" : "s"}.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            {billingSegments.map((segment) => {
                                const percent = Math.round((segment.count / invoiceCount) * 100);
                                return (
                                    <div key={segment.label} className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between gap-2 text-[12.5px]">
                                            <span className="flex items-center gap-2 text-mute">
                                                <span className={`h-2 w-2 rounded-sm ${segment.color}`} aria-hidden="true" />
                                                {segment.label}
                                            </span>
                                            <span className="font-medium text-ink tabular-nums">
                                                {segment.count} · {percent}%
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-soft">
                                            <div className={`h-full rounded-full ${segment.color}`} style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </OverviewPanel>

                <OverviewPanel
                    className="xl:col-span-8"
                    title="Recent bookings"
                    subtitle="Newest reservations and their payment status"
                    icon={<CalendarClock className="h-5 w-5" aria-hidden="true" />}
                    tone="slate"
                    action={<ViewAll href="/dashboard/admin/bookings" />}
                    contentClassName="p-3 sm:p-4"
                >
                    <AdminBookingList bookings={slicedBookings} />
                </OverviewPanel>

                <OverviewPanel
                    className="xl:col-span-4"
                    title="Notifications"
                    subtitle="Latest platform activity"
                    icon={<BellRing className="h-5 w-5" aria-hidden="true" />}
                    tone="slate"
                    action={<ViewAll href="/dashboard/admin/notifications" />}
                >
                    <AdminNotificationList notifications={slicedNotifications} />
                </OverviewPanel>
            </div>
        </div>
    );
}
