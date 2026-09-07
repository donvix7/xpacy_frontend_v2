import MobileFilter from "./MobileFilter";
import PropertyCard from "./PropertyCard";
import LatestPropertyList from "./LatestPropertyList";
import PropertySavedIcon from "@/app/_components/ProperySavedIcon";
 export default async function PropertyCardLists({properties, pagination }) {

    return (
        <>
            <div className="flex justify-between md:items-center items-start gap-4 md:gap-0 flex-col md:flex-row">
                <span className="text-base font-mono text-base-500 ">Showing <span>{(pagination.page - 1) * pagination.limit + 1}</span> - <span>{pagination?.page === pagination?.totalPages ? pagination.total : pagination?.page * pagination?.limit}</span> of <span>{pagination?.total}</span> results </span>
                <MobileFilter>
                    <LatestPropertyList/>
                </MobileFilter>
                <div className="flex items-center space-x-2.5 font-mono text-base-500">
                    <span>Sort by:</span>
                    <select className="p-2.5 border border-neutral-200 rounded-lg">
                        <option>Default</option>
                    </select>
                </div>
            </div>
            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-x-6 gap-y-6 md:gap-y-12">
                {
                    properties?.map((property, index) => <PropertyCard property={property} key={index}/>)
                }
            </div>
        </>
    )
}