import DashboardGridItem from "@/app/_components/DashboardGridItems";
import NotificationList from "@/app/_components/NotificationList";
import SavedPropCardList from "@/app/_components/SavedProCardList";
import {
    getBookingList,
    getInvoiceList,
    getSavedProperties,
    getUserNotifications,
    getUserProfile,
} from "@/app/_lib/data-services";
import BookedServiceList from "@/app/_components/BookedServicesList";
import PaymentList from "@/app/_components/PaymentList";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import SummaryCards from "@/app/_components/SummaryCards";
import { cookies } from "next/headers";
import {
    TbBell,
    TbBuildingSkyscraper,
    TbCalendarCheck,
    TbClockDollar,
    TbHeart,
} from "react-icons/tb";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const [
        bookingList,
        invoiceList,
        savedPropertiesRes,
        notifications,
        profile,
    ] = await Promise.all([
        getBookingList(),
        getInvoiceList(),
        getSavedProperties(),
        getUserNotifications(),
        getUserProfile(),
    ]);

    const savedProperties = savedPropertiesRes?.data ?? [];
    const invoices = invoiceList ?? [];
    const pendingPayments = invoices.filter(
        (inv) => inv?.status?.toLowerCase() === "pending"
    );

    const summaryCards = [
        {
            label: "Total Properties",
            value: savedProperties.length,
            color: "bg-primary-100",
            icon: <TbBuildingSkyscraper className="w-5 h-5 text-primary-700" />,
        },
        {
            label: "Pending Payments",
            value: pendingPayments.length,
            color: "bg-amber-100",
            icon: <TbClockDollar className="w-5 h-5 text-amber-700" />,
        },
        {
            label: "Saved Properties",
            value: savedProperties.length,
            color: "bg-blue-100",
            icon: <TbHeart className="w-5 h-5 text-blue-700" />,
        },
        {
            label: "Total Bookings",
            value: bookingList?.length ?? 0,
            color: "bg-slate-100",
            icon: <TbCalendarCheck className="w-5 h-5 text-slate-700" />,
        },
        {
            label: "Total Notifications",
            value: notifications?.length ?? 0,
            color: "bg-emerald-100",
            icon: <TbBell className="w-5 h-5 text-emerald-700" />,
        },
    ];

    return (
        <div className="p-2">
            <MobileDashboardHeader />
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold">
                Welcome {profile?.firstName},
            </h1>

            <SummaryCards cards={summaryCards} />

            <div className="grid lg:grid-cols-[1fr_370px] grid-cols-1 grid-rows-[auto] gap-12 mt-8">
                <DashboardGridItem
                    title="Saved Properties"
                    viewAllLink="/dashboard/user/saved-properties"
                >
                    <SavedPropCardList />
                </DashboardGridItem>

                <DashboardGridItem
                    title="Notifications"
                    viewAllLink="/dashboard/user/notifications"
                >
                    <NotificationList />
                </DashboardGridItem>

                <DashboardGridItem
                    title="Booked Services"
                    viewAllLink="/dashboard/user/booked-services"
                >
                    <BookedServiceList />
                </DashboardGridItem>

                <DashboardGridItem
                    title="Payments"
                    viewAllLink="/dashboard/user/payments"
                >
                    <PaymentList />
                </DashboardGridItem>
            </div>
        </div>
    );
}