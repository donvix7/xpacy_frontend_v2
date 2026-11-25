import { cookies } from "next/headers";
import DashboardSidebarShell from "@/app/_components/DashboardSidebarShell";
import SidebarHeader from "@/app/_components/SidebarHeader";

export default async function Layout({ children }) {
    const cookieStore = await cookies();
    const isOrganizationAdmin = cookieStore.get("organizationAdmin")?.value === "1";

    return (
        <DashboardSidebarShell
            role="property-owner"
            isOrganizationAdmin={isOrganizationAdmin}
            header={
                <SidebarHeader
                    role="property-owner"
                    isOrganizationAdmin={isOrganizationAdmin}
                />
            }
        >
            {children}
        </DashboardSidebarShell>
    );
}
