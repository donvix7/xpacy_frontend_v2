import Link from "next/link";


export default function DashboardGridItem({ children, viewAllLink, title }) {

    return (
        <div className={` ${title === "Saved Properties" ? "lg:border-[1.5px] lg:border-primary-200 lg:p-6" : "border-[1.5px] border-primary-200 p-6"} flex flex-col gap-4 rounded-lg`}>
            <div className="flex items-center justify-between">
                <h3 className="lg:text-md text-black text-base font-sans">{title}</h3>
                {viewAllLink && <Link href={viewAllLink} className="p-2 border-b border-primary text-primary font-mono font-semibold text-sm lg:text-base">View All</Link>}
            </div>
            {title === "Saved Properties" ? <div className="overflow-x-scroll no-scrollbar">{children}</div> : children}
        </div>
    )
}