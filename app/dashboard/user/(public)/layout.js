import DashboardSidebarShell from "@/app/_components/DashboardSidebarShell";
import SidebarHeader from "@/app/_components/SidebarHeader";

export default function Layout({ children }) {
    return (
        <DashboardSidebarShell
            role="user"
            header={<SidebarHeader />}
        >
            {children}
        </DashboardSidebarShell>
    );
}
