"use client"
import { useState } from "react";
import { LuCirclePlus } from "react-icons/lu";
export default function FaqToggle({question, answer, width}){
    const [showText, setShowText] = useState(false)
    return (
      <div className={`flex flex-col space-y-6 ${width}`}>
        <div className="border border-neutrals"></div>
        <div className="flex items-center justify-between group cursor-pointer" onClick={()=> setShowText((prev) => !prev)}>
          <h3
            className={`${
              !showText ? "text-base-500" : "text-blue-400"
            } font-mono font-bold text-md group-hover:text-blue-400`}
          >
            {question}
          </h3>
          <span
            className={`${
              !showText ? "text-primary" : "text-blue-400"
            } text-2xl group-hover:text-blue-400`}
          >
            <LuCirclePlus />
          </span>
        </div>
          {showText && <p className="font-mono text-base-500 text-md font-normal select-none">{answer}</p>}
      </div>
    );
}