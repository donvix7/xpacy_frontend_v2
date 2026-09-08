import DashboardGridItem from "@/app/_components/DashboardGridItems";
import NotificationList from "@/app/_components/NotificationList";
import SavedPropCardList from "@/app/_components/SavedProCardList";
import { getUserProfile } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import BookedServiceList from '../../../_components/BookedServicesList';
import PaymentList from '../../../_components/PaymentList';
import { SlOptionsVertical } from "react-icons/sl";
import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
export default async function Page() {
     const cookieStore = await cookies();
    const token = cookieStore.get("token")
    const profile = await getUserProfile(token);
    return (
        <div className="p-2 ">
            <MobileDashboardHeader/>
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold">Welcome {profile?.firstname},</h1>
            <div className="grid lg:grid-cols-[1fr_370px] grid-cols-1 grid-rows-[auto] gap-12 mt-8">
                {/* Saved properties */}
                <DashboardGridItem title={"Saved Properties"} viewAllLink={"/dashboard/user/saved-properties"}>
                    <SavedPropCardList/>
                </DashboardGridItem>
                {/* Notifications */}
                <DashboardGridItem title={"Notifications"} viewAllLink={"/dashboard/user/payments"}>
                    <NotificationList/>
                </DashboardGridItem>
                {/* Booked Services */}
                <DashboardGridItem title={"Booked Services"} viewAllLink={"/dashboard/user/booked-services"}>
                    <BookedServiceList/>
                </DashboardGridItem>
                {/* Payments */}
                <DashboardGridItem title={"Payments"} viewAllLink={"/dashboard/user/payments"}>
                    <PaymentList/>
                </DashboardGridItem>
            </div>
        </div>
    )
}
