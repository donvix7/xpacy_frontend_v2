import { filterPropertiesByOrganization, getProperties } from "../_lib/data-services"
import LatestPropertyCard from "./LatestPropertyCard";

export default async function LatestPropertyList({ organizationId }){
    const [fetched] = await getProperties({ organizationId, limit: 5 });
    const properties = filterPropertiesByOrganization(fetched, organizationId).slice(0, 5);
        return (
        <div className="p-6 flex flex-col gap-4 border bg-white border-neutral-200 rounded-lg shadow-md">
            <p className="text-lg text-black">Latest Properties</p>
            <div className="flex flex-col gap-6">
                {properties.map((property, index) => <LatestPropertyCard property={property} key={index}/>)}
            </div>
        </div>
    )
}
