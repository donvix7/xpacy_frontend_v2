"use client"

import { useRouter } from "next/navigation"
import { FaArrowLeft } from "react-icons/fa6"


export default function BackBtn() {
    const router = useRouter();
    return (
        <div>
            <button className="flex items-center gap-2 text-black cursor-pointer font-mono" onClick={() => router.back()}>
                <span className="text-2xl"><FaArrowLeft /></span>
                <span>Back</span>
            </button>
        </div>
    )
}