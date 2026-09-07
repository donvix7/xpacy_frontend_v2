import { getLatestProperties } from "../_lib/data-services"
import LatestPropertyCard from "./LatestPropertyCard";

export default async function LatestPropertyList(){
    const properties = await getLatestProperties();
        return (
        <div className="p-6 flex flex-col gap-4 border bg-white border-neutral-200 rounded-lg shadow-md">
            <h2 className="text-lg text-black">Latest Properties</h2>
            <div className="flex flex-col gap-6">
                {properties.map((property, index) => <LatestPropertyCard property={property} key={index}/>)}
            </div>
        </div>
    )
}