import PropertyCardLists from "./PropertyCardList";
import Pagination from "./Pagination";
import { filterPropertiesByOrganization, getProperties } from "../_lib/data-services";

export default async function PropertiesSection({search}){
      const result = await getProperties(search);
      const [fetchedProperties = [], pagination = {}] = result || [];
      const properties = filterPropertiesByOrganization(fetchedProperties, search?.organizationId);
    return (
        <div className="flex-1 flex flex-col gap-8">
            <PropertyCardLists properties={properties} pagination={pagination} organizationId={search?.organizationId} />
            <Pagination pagination={pagination} />
        </div>
    )

}
