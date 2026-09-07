"use client"
import { useState } from "react"
export default function TextExpander({children}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const displayText = isExpanded ? children : children.split(" ").slice(0, 40).join(" ") + "... "
    return (
        <span>
            {displayText}
            <button className="text-primary cursor-pointer border-b border-primary pb-1 font-bold text-base leading-3" onClick={() => setIsExpanded(prev => !prev)}>
                {isExpanded ? " Show less" : " Show more"}
            </button>
        </span>
    )
}