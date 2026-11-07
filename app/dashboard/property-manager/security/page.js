import { getManagedProperties } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import EmptyState from "@/app/_components/EmptyState";
import { FaBuilding, FaUserShield } from "react-icons/fa6";
import { FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";

export default async function Page() {
  const response = await getManagedProperties(10000);
  const properties = Array.isArray(response?.[0]) ? response[0] : Array.isArray(response) ? response : [];
  const cards = [
    { label: "Managed Properties", value: properties.length, color: "bg-blue-100", icon: <FaBuilding className="w-5 h-5 text-blue-700" /> },
    { label: "Secured", value: properties.length, color: "bg-green-100", icon: <FaShieldAlt className="w-5 h-5 text-green-700" /> },
    { label: "Incidents", value: 0, color: "bg-red-100", icon: <FaExclamationTriangle className="w-5 h-5 text-red-700" /> },
    { label: "Active Guards", value: 0, color: "bg-purple-100", icon: <FaUserShield className="w-5 h-5 text-purple-700" /> },
  ];

  return (
    <div className="space-y-8 p-2">
      <h1 className="text-[28px] font-bold text-primary lg:text-4xl">Security</h1>
      <SummaryCards cards={cards} />
      <DashboardGridItem title="Security Overview">
        <EmptyState message="Security management tools will appear here for properties assigned to you." />
      </DashboardGridItem>
    </div>
  );
}
