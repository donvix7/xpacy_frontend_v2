"use client"
import { IoSearchOutline } from "react-icons/io5";
import { useState } from 'react';
export default function PropertySearchBtn(){
    const [showSearchBtn, setshowSearchBtn] = useState(true)
    const handleSubmit = (e) => {
        e.preventDefault();
        setshowSearchBtn(prev => !prev)
    }
    return (
        <>
            {
                showSearchBtn ? 
                    (
                        <button onClick={() => setshowSearchBtn(prev => !prev)} className="flex items-center border border-primary-200 rounded-lg gap-2 py-1.5 px-2 text-black text-xs font-mono cursor-pointer hover:bg-primary-200">
                            <span className="text-base"> <IoSearchOutline /></span>
                            Search Properties
                        </button>
                    ) : 
                    (
                        <form onSubmit={handleSubmit}>
                            <input type="search" className="px-2 py-1.5 border border-primary-200 rounded-lg font-mono text-sm text-black" placeholder="Enter property name" />
                        </form>
                    )
            }
        </>
    )
}