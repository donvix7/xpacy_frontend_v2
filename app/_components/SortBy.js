
export default function SortBy({children, }){

    return (
        <div className="flex items-center gap-2"> 
            <span>Sort by:</span>
            <select className="p-2 text-base text-neutral-700 border border-primary-200 bg-white rounded-lg">
                {children}
            </select>
        </div>
    )
}