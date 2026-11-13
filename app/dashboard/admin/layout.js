import SidebarLogo from "@/app/_components/SidebarLogo";
import SidebarNav from "@/app/_components/SidebarNav";
import SidebarHeader from "@/app/_components/SidebarHeader";
import MobileNav from "@/app/_components/MobileNav";
import { Suspense } from "react";
export default function Layout({children}){
    return (
        <section className="xp-dashboard grid min-w-0 lg:grid-cols-[265px_minmax(0,1fr)] grid-cols-1 grid-rows-[auto_1fr] h-dvh overflow-hidden">
            <div className="row-span-full h-full bg-side lg:flex flex-col px-4 py-7 gap-6 overflow-y-auto hidden">
                <SidebarLogo/>
                <SidebarNav role={"admin"}/>
                <Suspense fallback={<div className="h-8 w-8" />}>
                    <MobileNav />
                </Suspense>
            </div>
            <main className="min-w-0  h-screen lg:row-[2/3] lg:col-[2/-2]">
            <SidebarHeader role={"admin"}/>

                <div className="relative z-0 h-screen overflow-y-auto bg-canvas pb-20">
                    {children}
                </div>
            </main>
        </section>
    )
}
