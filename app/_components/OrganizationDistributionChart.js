import DistributionDonutChart from "./DistributionDonutChart";
import { toReportArray } from "@/app/_lib/report-utils";

function formatLabel(raw, fallback = "Unspecified") {
  const cleaned = String(raw || "")
    .trim()
    .replace(/[_-]+/g, " ");
  if (!cleaned) return fallback;
  return cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getOrgType(org) {
  return (
    org?.type ||
    org?.organizationType ||
    org?.organization_type ||
    org?.category ||
    org?.industry ||
    ""
  );
}

function getOrgCountry(org) {
  return (
    org?.country ||
    org?.address?.country ||
    org?.location?.country ||
    ""
  );
}

function getOrgState(org) {
  return (
    org?.state ||
    org?.address?.state ||
    org?.location?.state ||
    ""
  );
}

function getOrgCity(org) {
  return (
    org?.city ||
    org?.address?.city ||
    org?.location?.city ||
    ""
  );
}

function getOrgStatus(org) {
  if (org?.status) return formatLabel(org.status);
  if (typeof org?.isActive === "boolean") {
    return org.isActive ? "Active" : "Inactive";
  }
  return "Active";
}

const OrganizationDistributionChart = ({ organizations = [] }) => {
  const list = toReportArray(organizations);

  const hasType = list.some((org) => Boolean(String(getOrgType(org)).trim()));
  const countries = new Set(
    list.map((org) => String(getOrgCountry(org)).trim().toLowerCase()).filter(Boolean)
  );
  const hasState = list.some((org) => Boolean(String(getOrgState(org)).trim()));
  const hasCity = list.some((org) => Boolean(String(getOrgCity(org)).trim()));
  const hasCountry = countries.size > 0;

  const counts = list.reduce((acc, org) => {
    let label;
    if (hasType) {
      label = formatLabel(getOrgType(org), "Unspecified");
    } else if (countries.size > 1) {
      label = formatLabel(getOrgCountry(org), "Unspecified");
    } else if (hasState) {
      label = formatLabel(getOrgState(org), "Unspecified");
    } else if (hasCity) {
      label = formatLabel(getOrgCity(org), "Unspecified");
    } else if (hasCountry) {
      label = formatLabel(getOrgCountry(org), "Unspecified");
    } else {
      label = getOrgStatus(org);
    }

    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <DistributionDonutChart
      data={data}
      emptyLabel="No organizations available"
    />
  );
};

export default OrganizationDistributionChart;
