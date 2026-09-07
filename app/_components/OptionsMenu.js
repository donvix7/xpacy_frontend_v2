"use client"

import { SlOptions } from "react-icons/sl";
import FilterMenu from "./FilterMenu";
export default function     OptionsMenu({id, children}){
    return (
        <FilterMenu>
            <FilterMenu.Open name={id}>
                <button className="flex items-center p-2 cursor-pointer justify-center text-2xl">
                    <SlOptions/>
                </button>
            </FilterMenu.Open>
            <FilterMenu.Window name={id} top={"top-[60%]"}>
                <div className="flex flex-col gap-2 bg-white shadow-2xl rounded-lg p-4">
                    {children}
                </div>
            </FilterMenu.Window>
        </FilterMenu>
    )
}