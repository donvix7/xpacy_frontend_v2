"use client"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";


export default function Pagination({ pagination }) {
    const { page: currentPage, totalPages, limit } = pagination;
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // const currentPage = searchParams.get("page") ?? 1
    const router = useRouter()
    function handleNext() {
        const params = new URLSearchParams(searchParams);
        params.set('page', Number(currentPage + 1))
        router.replace(`${pathname}?${params.toString()}`, { scroll: true })
    }
    function handlePrevioust() {
        const params = new URLSearchParams(searchParams);
        params.set('page',  Number(currentPage - 1))
        router.replace(`${pathname}?${params.toString()}`, { scroll: true })
    }
    // if(totalPages === 1) return null

    return (
        <div className="flex items-center justify-end font-mono gap-4">
            <button className="flex gap-1 p-2 cursor-pointer items-center justify-center border border-primary-200 rounded-lg  text-sm font-bold text-black hover:bg-primary-200 disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={currentPage === 1} onClick={handlePrevioust}>
                <span>
                    <FaAngleLeft />
                </span>
                <span>Previous</span>
            </button>
            <button className="flex gap-1 p-2 cursor-pointer justify-center items-center border border-primary-200 rounded-lg  text-sm font-bold text-black hover:bg-primary-200 disabled:bg-gray-100 disabled:cursor-not-allowed" onClick={handleNext} disabled={currentPage === totalPages}>
                <span>Next</span>
                <span>
                    <FaAngleRight />
                </span>
            </button>
        </div>
    )
}