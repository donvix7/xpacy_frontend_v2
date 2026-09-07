"use client"
import { IoSearch } from "react-icons/io5";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function SearchInput({placeholder}){
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    function handleSearch(term) {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('location', term);
            params.set('page', 1);
        } else {
            params.delete('location');
        }
        replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="relative w-[300px]">
            <input 
                type="search" 
                className="border w-full font-mono border-primary-200 rounded-lg pl-10 py-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white" 
                placeholder={placeholder || "Search location..."}
                defaultValue={searchParams.get('location')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
            />
            <span className="text-xl absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IoSearch/></span>
        </div>
    )
}