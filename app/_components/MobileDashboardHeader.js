"use client"
import { usePathname } from "next/navigation";
import { SlOptionsVertical } from "react-icons/sl";
import FilterMenu from "./FilterMenu";
import Link from "next/link";
import { BiCalendarCheck } from "react-icons/bi";


export default function MobileDashboardHeader({showMenu = true}) {
    const pathname = usePathname();
    let heading = pathname.split("/")[3] || "Dashboard"
    heading = heading?.includes("-") ? heading.split("-").join(" ") : heading
    return (
        <div className="flex lg:hidden items-center justify-between mb-3 relative">
            <h2 className="text-md capitalize">{heading}</h2>
           {showMenu &&  <Option/>}
        </div>
    )
}


const Option = () => {

    return (
        <FilterMenu>
            <FilterMenu.Open name={"overview"}>
                <button className="flex items-center p-2 cursor-pointer justify-center text-lg">
                    <SlOptionsVertical/>
                </button>
            </FilterMenu.Open>
            <FilterMenu.Window name={"overview"} top={"top-[80%]"}>
                <div className="flex flex-col gap-2 items-center bg-white shadow-lg rounded-lg p-4">
                    <Link href={"#"} className="flex items-center gap-4 justify-center hover:bg-gray-50 font-mono">
                        <span className="text-lg"><BiCalendarCheck/></span>
                        <span>Book a service</span>
                    </Link>
                </div>
            </FilterMenu.Window>
        </FilterMenu>
    )
}

