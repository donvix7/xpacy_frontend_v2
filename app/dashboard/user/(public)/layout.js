import SidebarLogo from "@/app/_components/SidebarLogo";
import SidebarNav from "@/app/_components/SidebarNav";
import SidebarHeader from "@/app/_components/SidebarHeader";
import MobileNav from "@/app/_components/MobileNav";
import { Suspense } from "react";
export default function Layout({children}){
    return (
        <section className="xp-dashboard grid lg:grid-cols-[265px_1fr] grid-cols-1 grid-rows-[auto_1fr] h-dvh overflow-hidden ">
            <div className="row-span-full h-full bg-side lg:flex flex-col px-4 py-7 gap-6 overflow-y-auto hidden">
                <SidebarLogo/>
                <SidebarNav/>
                <Suspense fallback={<div className="h-8 w-8" />}>
                    <MobileNav />
                </Suspense>
            </div>
            <SidebarHeader />
            <main className=" overflow-y-auto bg-canvas lg:row-[2/3] lg:col-[2/-2]">
                <div>
                    {children}
                </div>
            </main>
        </section>
    )
}
