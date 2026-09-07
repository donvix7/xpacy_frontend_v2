"use client"
import { IoFilter } from "react-icons/io5";
import FilterMenu from "./FilterMenu";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function FilterContent({ onClose }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // Local state for filter values
    const [status, setStatus] = useState(searchParams.get('status') || '');
    const [type, setType] = useState(searchParams.get('type') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    const handleApply = () => {
        const params = new URLSearchParams(searchParams);

        if (status) params.set('status', status);
        else params.delete('status');

        if (type) params.set('type', type);
        else params.delete('type');

        if (minPrice) params.set('minPrice', minPrice);
        else params.delete('minPrice');

        if (maxPrice) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');

        replace(`${pathname}?${params.toString()}`);
        if (onClose) onClose();
    };

    return (
        <div className="flex flex-col w-[85vw] sm:w-[300px] z-50 rounded-lg p-4 border border-primary-200 bg-white shadow-xl gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="">All</option>
                    <option value="shortlet">Shortlet</option>
                    <option value="rent">Rented</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Property Type</label>
                <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="">All Types</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Terrace">Terrace</option>
                    <option value="Flat/Apartment">Flat/Apartment</option>
                    <option value="Duplex">Duplex</option>
                    <option value="Semi-detached">Semi-detached</option>
                    <option value="Fully-detached">Fully-detached</option>
                    <option value="Villa">Villa</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Price Range</label>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        placeholder="Min" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input 
                        type="number" 
                        placeholder="Max" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
                    type="button"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleApply}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
                    type="button"
                >
                    Filter
                </button>
            </div>
        </div>
    );
}

export default function DashboardFilter() {
    return (
        <FilterMenu>
            <div className="relative">
                <FilterMenu.Open name="filter">
                    <button className='flex items-center justify-center p-3 text-2xl border border-primary-200 rounded-lg hover:bg-gray-50 transition-colors'>
                        <IoFilter />
                    </button>
                </FilterMenu.Open>
                <FilterMenu.Window name="filter" right="right-0">
                    <FilterContent />
                </FilterMenu.Window>
            </div>
        </FilterMenu>
    )
}


