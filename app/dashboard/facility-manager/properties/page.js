import PropertiesTableList from "@/app/_components/PropertiesTableList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import { getManagedProperties } from "@/app/_lib/data-services";
import { FaHandshake } from "react-icons/fa6";

export default async function Page() {
  const response = await getManagedProperties(10000);
  const properties = Array.isArray(response?.[0])
    ? response[0]
    : Array.isArray(response)
      ? response
      : [];

  const summaryCards = [
    {
      title: "Managed Properties",
      count: properties.length,
      icon: <FaHandshake className="text-green-500" size={20} />,
      color: "bg-green-50 border-green-100",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6 p-2">
      <h1 className="mb-8 text-[28px] font-bold capitalize text-primary lg:text-4xl">
        Managed Properties
      </h1>
      <DashboardGridItem title="Properties Summary">
        <SummaryCards cards={summaryCards} />
      </DashboardGridItem>
      <DashboardGridItem title="Managed Properties List">
        <PropertiesTableList properties={properties} />
      </DashboardGridItem>
    </div>
  );
}
