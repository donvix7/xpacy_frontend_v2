import { cookies } from "next/headers";
import { getAdminProperties } from "@/app/_lib/data-services";
import AdminListingsClient from "./AdminListingsClient";
import AppHeader from "../_components/AppHeader";

export const metadata = {
  title: "Listing Statistics & Intelligence | Admin Dashboard",
  description: "Track listing views, enquiries, market demand, and price benchmarks across Nigeria.",
};

export default async function AdminListingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let properties = [];
  try {
    const res = await getAdminProperties();
    if (res && Array.isArray(res.properties)) {
      properties = res.properties;
    } else if (Array.isArray(res)) {
      properties = res;
    }
  } catch (error) {
    console.warn("Failed to load admin properties for listings page:", error);
  }

  return (
    <div>
            <AppHeader />
<div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <AdminListingsClient properties={properties} />
    </div>
    </div>
    
  );
}

