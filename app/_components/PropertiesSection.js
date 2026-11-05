import PropertyCardLists from "./PropertyCardList";
import Pagination from "./Pagination";
import { Suspense } from "react";
import { filterPropertiesByOrganization, getProperties } from "../_lib/data-services";

export default async function PropertiesSection({search}){
      const result = await getProperties(search);
      const [fetchedProperties = [], pagination = {}] = result || [];
      const properties = filterPropertiesByOrganization(fetchedProperties, search?.organizationId);
    return (
        <div className="flex-1 flex flex-col gap-8">
            <PropertyCardLists properties={properties} pagination={pagination} organizationId={search?.organizationId} />
            <Suspense fallback={<div className="h-10" />}>
                <Pagination pagination={pagination} />
            </Suspense>
        </div>
    )

}
