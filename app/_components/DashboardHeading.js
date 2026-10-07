"use client"
import {usePathname} from "next/navigation";

export default function DashboardHeading(){
    const pathname = usePathname();
    let heading = pathname.split("/")[3] || "Dashboard Overview"
    heading = heading?.includes("-") ? heading.split("-").join(" ") : heading
    return (
        <p className="text-[22px] hidden lg:block capitalize">{heading}</p>
    )
}