"use client"
import { usePathname } from "next/navigation"
import { MdKeyboardArrowRight } from "react-icons/md";
export default function PropertyHeader({ pagination }) {
    const pathname = usePathname();
    const headerTxt = pathname.split("/").at(1);
    return (
        <div className="flex flex-col gap-[46px]">
            <div className="flex items-center space-x-2 font-mono text-black text-base">
                <span>Home</span>
                <span className="text-md"><MdKeyboardArrowRight /></span>
                {headerTxt === 'search' ? <span className={"text-blue-400 capitalize"}>Results</span> : <span className={"text-blue-400 capitalize"}>{headerTxt}</span>}
            </div>
            {headerTxt === 'search' ? (
                <div>
                    <h1 className="font-bold text-4xl capitalize">We&apos;ve got {pagination.total} results for you</h1>
                </div>
            ) : (<div className="space-y-2">
                <h1 className="font-bold md:text-4xl text-[28px] capitalize">Properties For {headerTxt}</h1>
                <p className="md:text-md text-black font-mono md:font-sans">Search for properties on {headerTxt}</p>
            </div>)
            }
        </div>
    )
}