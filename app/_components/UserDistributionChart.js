import DistributionDonutChart from "./DistributionDonutChart";

const UserDistributionChart = ({ stats = {} }) => {
  const data = [
    {
      name: "Organization Owners",
      value: Number(stats.organizationOwners ?? stats.propertyOwners) || 0,
    },
    {
      name: "Facility Managers",
      value: Number(stats.facilityManagers) || 0,
    },
    {
      name: "Property Managers",
      value: Number(stats.propertyManagers) || 0,
    },
    {
      name: "Regular Users",
      value: Number(stats.regularUsers) || 0,
    },
    {
      name: "Tenants / Residents",
      value: Number(stats.residents) || 0,
    },
    {
      name: "Service Providers",
      value: Number(stats.serviceProviders) || 0,
    },
    {
      name: "Admins",
      value: Number(stats.admins) || 0,
    },
    {
      name: "Other Users",
      value: Number(stats.otherUsers) || 0,
    },
  ];
  return <DistributionDonutChart data={data} emptyLabel="No user records available" />;
};

export default UserDistributionChart;
