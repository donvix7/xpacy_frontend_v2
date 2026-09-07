"use client"

import { IoFilter } from "react-icons/io5"
import FilterMenu from "./FilterMenu"
import UserFilterForm from "./UserFilterForm"


export default function UserFilterMenu() {
    return (
        <FilterMenu>
            <FilterMenu.Open>
                <button className='flex items-center cursor-pointer justify-center p-3 text-2xl border border-primary-200 rounded-lg'>
                    <IoFilter />
                </button>
            </FilterMenu.Open>
            <FilterMenu.Window>
                <UserFilterForm/>
            </FilterMenu.Window>
        </FilterMenu>
    )
}