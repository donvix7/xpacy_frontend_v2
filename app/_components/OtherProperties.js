import { getOtherProperties } from "../_lib/data-services"
import PropertyCard from "./PropertyCard";

export default async function OtherProperties(){
    const properties = await getOtherProperties();
    return (
        <div className="grid md:grid-cols-3 grid-cols-1 grid-rows-2 gap-x-6 gap-y-6 md:gap-y-16">
            {properties?.map((property) => <PropertyCard key={property?.id} property={property}/>)}
        </div>
    )
}