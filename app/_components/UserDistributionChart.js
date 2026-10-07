import DistributionDonutChart from "./DistributionDonutChart";

const UserDistributionChart = ({ stats = {} }) => {
  const data = [
    { name: "Property Owners", value: Number(stats.propertyOwners) || 0 },
    { name: "Residents", value: Number(stats.residents) || 0 },
    { name: "Service Providers", value: Number(stats.serviceProviders) || 0 },
    { name: "Admins", value: Number(stats.admins) || 0 },
    { name: "Other Users", value: Number(stats.otherUsers) || 0 },
  ];
  return <DistributionDonutChart data={data} emptyLabel="No user records available" />;
};

export default UserDistributionChart;
