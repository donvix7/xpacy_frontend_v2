"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Filter as FilterIcon, X } from "lucide-react";
import { useTransition } from "react";

export default function BlogFilter({ categories = [] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const currentSearch = searchParams.get("search") || "";
    const currentCategory = searchParams.get("category") || "all";

    function updateSearchParams(key, value) {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    type="text"
                    defaultValue={currentSearch}
                    placeholder="Search by title..."
                    onChange={(e) => updateSearchParams("search", e.target.value)}
                    className="block w-1/2 pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all"
                />
                {isPending && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                    </div>
                )}
            </div>

            {/* Category Filter */}
            <div className="relative w-full md:w-64 flex gap-4 items-center">
                    <FilterIcon className="h-5 w-5  text-gray-400" />
                <select
                    value={currentCategory}
                    onChange={(e) => updateSearchParams("category", e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl leading-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all appearance-none"
                >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Clear Filters */}
            {(currentSearch || currentCategory !== "all") && (
                <button
                    onClick={() => {
                        startTransition(() => {
                            router.push(pathname, { scroll: false });
                        });
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                    <X size={16} />
                    Clear
                </button>
            )}
        </div>
    );
}
