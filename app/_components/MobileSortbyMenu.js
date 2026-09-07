
"use client"
import { BiSortAlt2 } from "react-icons/bi";
import FilterMenu from "./FilterMenu";

export default function MobileSortbyMenu(){

    return (
        <FilterMenu>
            <FilterMenu.Open>
                <button className='flex items-center justify-center p-3 text-2xl border border-primary-200 rounded-lg'>
                    <BiSortAlt2 />
                </button>
            </FilterMenu.Open>
            <FilterMenu.Window>
                <div className="flex flex-col w-[138px] z-10 rounded-lg p-3 border-primary-200 bg-white shadow-lg [&>*]:p-2.5   [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-neutral-300">
                    <span>Default</span>
                    <span>Last 7 days</span>
                    <span>Last 30 days</span>
                    <span>Last 90 days</span>
                </div>
            </FilterMenu.Window>
        </FilterMenu>
    )
}







