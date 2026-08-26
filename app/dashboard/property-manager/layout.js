import SidebarLogo from "@/app/_components/SidebarLogo";
import SidebarNav from "@/app/_components/SidebarNav";
import SidebarHeader from "@/app/_components/SidebarHeader";
import MobileNav from "@/app/_components/MobileNav";
export default function Layout({children}){
    return (
        <section className="grid lg:grid-cols-[265px_1fr] grid-cols-1 grid-rows-[auto_1fr] h-dvh overflow-hidden ">
            <div className="row-span-full h-full bg-primary-900 lg:flex flex-col p-6 items-center gap-8 overflow-y-auto hidden">
                <SidebarLogo/>
                <SidebarNav role={"property-manager"} />
            </div>
            <SidebarHeader role={"property-manager"} />
            <main className=" overflow-y-auto lg:row-[2/3] lg:col-[2/-2]">
                <div>
                    {children}
                </div>
            </main>
        </section>
    )
}