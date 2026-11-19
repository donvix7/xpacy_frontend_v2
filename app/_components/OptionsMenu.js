"use client";

import { SlOptions } from "react-icons/sl";
import FilterMenu from "./FilterMenu";

export default function OptionsMenu({ id, children }) {
    return (
        <FilterMenu>
            <FilterMenu.Open name={id}>
                <button
                    type="button"
                    aria-label="Options"
                    className="flex items-center p-2 cursor-pointer justify-center text-lg text-mute transition-colors hover:text-ink"
                >
                    <SlOptions />
                </button>
            </FilterMenu.Open>
            <FilterMenu.Window name={id} top={"top-[60%]"}>
                <div className="flex flex-col bg-card rounded-xl border border-line shadow-2xl p-1.5 min-w-[190px]">
                    {children}
                </div>
            </FilterMenu.Window>
        </FilterMenu>
    );
}
