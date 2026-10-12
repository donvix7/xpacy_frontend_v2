import Link from "next/link";
import { Plus, ChevronLeft } from "lucide-react";
import AdminUsersList from "@/app/_components/AdminUsersList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import {
    getAllTenants,
    getPropertyById,
} from "@/app/_lib/data-services";
import {
    FaFileSignature,
    FaUserCheck,
    
    FaUsers,
    
    FaUserSlash,
} from "react-icons/fa6";
import { FaUserTimes } from "react-icons/fa";

export default async function Page({ params }) {
    // propertyId comes straight from the URL
    const { id: propertyId } = await params;

    // Fetch the property and its tenants in parallel
    const [property, rawUsers] = await Promise.all([
        getPropertyById(propertyId).catch(() => null),
        getAllTenants().catch(() => []),
    ]);

    const propertyName =
        property?.name ||
        property?.property_name ||
        property?.title ||
        "Property";

    const allUsers = Array.isArray(rawUsers) ? rawUsers : [];

    // Keep only tenants (exclude owners/admins even if the API returns them)
    const tenantsList = allUsers
        .filter((u) => {
            const role = (u.role || "").toLowerCase();
            // If the API marks tenants explicitly, keep those.
            // Otherwise treat anyone without an elevated role as a tenant.
            return (
                role === "tenant" ||
                role === "user" ||
                role === "" ||
                role === undefined
            );
        })
        .map((u) => ({ ...u, role: "tenant" }));

    const stats = {
        totalTenants: tenantsList.length,
        processedKyc: tenantsList.filter(
            (u) => u.kyc_status === "processing"
        ).length,
        activeTenants: tenantsList.filter((u) => u.status === "active").length,
        inactiveTenants: tenantsList.filter((u) => u.status === "inactive")
            .length,
        unverifiedTenants: tenantsList.filter((u) => !u.email_verified_at)
            .length,
    };

    const summaryCards = [
        {
            label: "Total Tenants",
            value: stats.totalTenants,
            color: "bg-primary-100",
            icon: <FaUsers className="w-5 h-5 text-primary" />,
        },
        {
            label: "KYC Processing",
            value: stats.processedKyc,
            color: "bg-orange-100",
            icon: <FaFileSignature className="w-5 h-5 text-orange-600" />,
        },
        {
            label: "Active Tenants",
            value: stats.activeTenants,
            color: "bg-emerald-100",
            icon: <FaUserCheck className="w-5 h-5 text-emerald-600" />,
        },
        {
            label: "Inactive Tenants",
            value: stats.inactiveTenants,
            color: "bg-red-100",
            icon: <FaUserTimes className="w-5 h-5 text-red-600" />,
        },
        {
            label: "Unverified",
            value: stats.unverifiedTenants,
            color: "bg-gray-100",
            icon: <FaUserSlash className="w-5 h-5 text-gray-600" />,
        },
    ];

    return (
        <div className="space-y-6 p-2 sm:p-4">
            <div>
                <Link
                    href={`/dashboard/user/my-properties/${propertyId}`}
                    className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to property
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-[28px] font-bold capitalize text-primary lg:text-4xl">
                            Tenants
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Tenants for {propertyName}.
                        </p>
                    </div>
                    <Link
                        href={`/admin/add-new-tenant`}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                        <Plus className="h-4 w-4" />
                        Add tenant
                    </Link>
                </div>
            </div>

            <SummaryCards cards={summaryCards} title="Tenant Summary" />

            <DashboardGridItem title="All Tenants">
                <AdminUsersList
                    users={tenantsList}
                    title="All Tenants"
                    variant="tenant"
                />
            </DashboardGridItem>
        </div>
    );
}