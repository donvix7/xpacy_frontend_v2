import PropertiesTableList from "@/app/_components/PropertiesTableList";
import {
    getManagedProperties,
    getMyProperties,
    getMyRentedProperties,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import { FaHandshake, FaTag } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";

export default async function Page() {
    const results = await Promise.allSettled([
        getMyProperties(),
        getManagedProperties(),
        getMyRentedProperties(),
    ]);

    const unwrap = (result) =>
        result.status === "fulfilled" && Array.isArray(result.value)
            ? result.value
            : [];

    const ownedProperties = unwrap(results[0]);
    const managedProperties = unwrap(results[1]);
    const rentedProperties = unwrap(results[2]);

    const counts = {
        owned: ownedProperties.length,
        managed: managedProperties.length,
        rented: rentedProperties.length,
    };

    const summaryCards = [
        {
            title: "Owned",
            count: counts.owned,
            icon: <FaHome className="text-blue-500" size={20} />,
            color: "bg-blue-50 border-blue-100",
            bgColor: "bg-blue-50",
        },
        {
            title: "Managed",
            count: counts.managed,
            icon: <FaHandshake className="text-green-500" size={20} />,
            color: "bg-green-50 border-green-100",
            bgColor: "bg-green-50",
        },
        {
            title: "Rented",
            count: counts.rented,
            icon: <FaTag className="text-orange-500" size={20} />,
            color: "bg-orange-50 border-orange-100",
            bgColor: "bg-orange-50",
        },
    ];

    return (
        <div className="p-2 space-y-6">
            <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">
                My Properties
            </p>

            <DashboardGridItem title="Properties Summary">
                <SummaryCards cards={summaryCards} />
            </DashboardGridItem>

            <DashboardGridItem title="My Properties List">
                <PropertiesTableList properties={ownedProperties} />
            </DashboardGridItem>

            <DashboardGridItem title="Managed Properties List">
                <PropertiesTableList properties={managedProperties} />
            </DashboardGridItem>

            <DashboardGridItem title="Rented Properties List">
                <PropertiesTableList properties={rentedProperties} />
            </DashboardGridItem>
        </div>
    );
}
