import SidebarLogo from "@/app/_components/SidebarLogo";
import SidebarNav from "@/app/_components/SidebarNav";
import SidebarHeader from "@/app/_components/SidebarHeader";
import { cookies } from "next/headers";
export default async function Layout({children}){
    const cookieStore = await cookies();
    const isOrganizationAdmin = cookieStore.get("organizationAdmin")?.value === "1";
    return (
        <section className="xp-dashboard grid min-w-0 lg:grid-cols-[265px_minmax(0,1fr)] grid-cols-1 grid-rows-[auto_1fr] h-dvh overflow-hidden">
            <div className="row-span-full h-full bg-side lg:flex flex-col px-4 py-7 pb-30 gap-6 overflow-y-auto hidden">
                <SidebarLogo/>
                <SidebarNav role="property-owner" isOrganizationAdmin={isOrganizationAdmin} />
            </div>
            <SidebarHeader role="property-owner" isOrganizationAdmin={isOrganizationAdmin} />
            <main className="min-w-0 overflow-y-auto bg-canvas lg:row-[2/3] lg:col-[2/-2]">
                <div>{children}</div>
            </main>
        </section>
    );
}
