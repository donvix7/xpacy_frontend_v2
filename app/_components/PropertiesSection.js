import PropertyCardLists from "./PropertyCardList";
import Pagination from "./Pagination";
import { getProperties } from "../_lib/data-services";

export default async function PropertiesSection({search}){
      const result = await getProperties(search);
      const [properties, pagination] = result;
    return (
        <div className="flex-1 flex flex-col gap-8">
            <PropertyCardLists properties={properties} pagination={pagination} />
            <Pagination pagination={pagination} />
        </div>
    )
    
}