import Link from "next/link";
import { cookies } from "next/headers";
import { Plus, Wrench } from "lucide-react";
import {
    getPropertyOwnerProfile,
    getPropertyOwnerProperties,
    getPropertyOwnerServices,
} from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import DataTable from "@/app/_components/DataTable";
import EmptyState from "@/app/_components/EmptyState";
import HeroBand from "@/app/_components/HeroBand";
import StatusChips from "@/app/_components/StatusChips";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getPropertyOwnerProfile(token),
        getPropertyOwnerProperties(token, { limit: 10000 }),
        getPropertyOwnerServices(token),
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const services = results[2].status === "fulfilled" ? results[2].value : [];
    const myServices = Array.isArray(services) ? services : [];

    const maintenanceServices = myServices.filter((s) =>
        [
            "maintenance",
            "repair",
            "plumbing",
            "electrical",
            "cleaning",
            "hvac",
            "painting",
            "general",
        ].includes((s.service_type || s.category || "").toLowerCase())
    );

    const pendingMaintenance = maintenanceServices.filter(
        (s) => (s.status || "").toLowerCase() === "pending"
    );
    const inProgressMaintenance = maintenanceServices.filter((s) =>
        ["in-progress", "in_progress"].includes((s.status || "").toLowerCase())
    );
    const completedMaintenance = maintenanceServices.filter((s) =>
        ["completed", "resolved", "closed"].includes((s.status || "").toLowerCase())
    );

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const addHref = `/admin/add-new-maintenance?returnTo=${encodeURIComponent(
        "/dashboard/property-manager/maintenance"
    )}`;

    const columns = [
        {
            heading: "Request",
            render: (service, idx) => (
                <span className="text-sm font-medium text-ink">
                    {service.title || service.description || `Request ${idx + 1}`}
                </span>
            ),
        },
        {
            heading: "Type",
            className: "capitalize text-mute",
            render: (service) =>
                service.service_type || service.category || "General",
        },
        {
            heading: "Date",
            className: "font-mono text-xs text-mute",
            render: (service) =>
                service.created_at || service.createdAt
                    ? new Date(
                          service.created_at || service.createdAt
                      ).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                      })
                    : "—",
        },
        {
            heading: "Status",
            center: true,
            render: (service) => (
                <div className="flex justify-center">
                    <StatusChips status={(service.status || "pending").toLowerCase()} />
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <HeroBand
                tagline={`Property operations · ${today}`}
                title="Maintenance & Work Orders"
                description="Track open maintenance requests, active repairs, and completed work orders across your managed portfolio."
                stats={[
                    {
                        label: "Total Requests",
                        value: maintenanceServices.length,
                        hint: "All work orders",
                    },
                    {
                        label: "Pending",
                        value: pendingMaintenance.length,
                        hint: "Awaiting action",
                    },
                    {
                        label: "In Progress",
                        value: inProgressMaintenance.length,
                        hint: "Currently active",
                    },
                    {
                        label: "Completed",
                        value: completedMaintenance.length,
                        hint: "Resolved orders",
                    },
                ]}
                actions={
                    <Link
                        href={addHref}
                        className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2.5 text-[13px] font-semibold text-side transition-colors hover:bg-white"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        New request
                    </Link>
                }
            />

            <DashboardGridItem title={`Work Orders (${maintenanceServices.length})`}>
                {maintenanceServices.length === 0 ? (
                    <EmptyState
                        icon={<Wrench className="h-10 w-10 text-primary" aria-hidden="true" />}
                        title="No work orders found"
                        message="Maintenance requests will appear here when submitted."
                        cta="New request"
                        link={addHref}
                    />
                ) : (
                    <DataTable
                        data={maintenanceServices}
                        columns={columns}
                        rowKey={(service, idx) =>
                            service.id || service._id || `maint-${idx}`
                        }
                        showPagination={maintenanceServices.length > 10}
                        pageSize={10}
                        className="p-0! border-none shadow-none"
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}
