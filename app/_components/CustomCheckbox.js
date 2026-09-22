"use client";

import { FaCheck } from "react-icons/fa6";
import { useId } from "react";

export default function CustomCheckbox({label, handleChange, onCheck, onChange, checked, labelSize ="text-sm", id}) {
    const fallbackId = useId();
    const checkboxId = id || (typeof label === "string" ? `checkbox-${label.replace(/\s+/g, "-").toLowerCase()}` : fallbackId);
    const handleCheck = handleChange || onChange || onCheck;
    return (
        <label htmlFor={checkboxId} className="flex items-center space-x-3 cursor-pointer font-mono ">
            <input type="checkbox" className="hidden peer disabled:cursor-not-allowed" id={checkboxId} checked={checked} onChange={handleCheck}  />
            <div className="h-6 w-6 border-2 border-gray-400 flex items-center justify-center rounded-xs peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-checked:[&>span]:opacity-100">
                <span className="opacity-0 text-white  text-sm"> <FaCheck /></span>
            </div>
            <span className={labelSize} >{label}</span>
        </label>
    )
}