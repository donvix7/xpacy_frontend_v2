"use client"
import FilterSidebar from "./FilterSidebar";
import MobileFilterMenu from "./MobileFilterMenu";
import { FiFilter } from "react-icons/fi";

export default function MobileFilter({children}){

    return (
        <MobileFilterMenu>
            <MobileFilterMenu.Open>
                <button className="flex items-center gap-2 text-secondary font-mono md:hidden">
                    <span className="text-2xl"><FiFilter/></span>
                    <span>Filter Options</span>
                </button>
            </MobileFilterMenu.Open>
            <MobileFilterMenu.Window>
                <div className="w-full flex flex-col gap-4 md:hidden">
                <FilterSidebar/>
                {children}
            </div>
            </MobileFilterMenu.Window>
        </MobileFilterMenu>
    )
}