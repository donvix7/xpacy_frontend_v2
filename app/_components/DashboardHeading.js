"use client"
import {usePathname} from "next/navigation";

export default function DashboardHeading(){
    const pathname = usePathname();
    let heading = pathname.split("/")[3] || "Dashboard Overview"
    heading = heading?.includes("-") ? heading.split("-").join(" ") : heading
    return (
        <h1 className="hidden min-w-0 truncate text-[26px] font-semibold capitalize tracking-[-0.4px] text-ink lg:block">{heading}</h1>
    )
}
