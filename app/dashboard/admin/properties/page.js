import AdminPropertyList from "@/app/_components/AdminPropertyList";
import AdminPropertiesTabs from "@/app/_components/AdminPropertiesTabs";
import PropertiesSummary from "@/app/_components/PropertiesSummary";
// import AdminSummary from "@/app/_components/AdminSummary"; // Commented out in original
import { getAdminProperties, getManagedProperties, getMyProperties } from "@/app/_lib/data-services";
import SearchInput from "@/app/_components/SearchInput";
import DashboardFilter from "@/app/_components/DashboardFilter";
import DashboardGridItem from "@/app/_components/DashboardGridItems";

function getPropertyList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.properties)) return payload.properties;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
}

export default async function Page({searchParams}) {
    const params = await searchParams;
    
    // Fetch unpaginated properties for full filtering
    const [adminPropertiesResult, ownedResult, managedResult] = await Promise.all([
        getAdminProperties(),
        getMyProperties(10000),
        getManagedProperties(10000),
    ]);

            const [
                allProperties,
                managedProperties,
                rentedProperties,
            ] = await Promise.all([
                getMyProperties(),
                getManagedProperties(),
                getMyRentedProperties(),
            ]);
    const filterProperties = (source) => {
        let result = source;
        if (params.status) result = result.filter((property) => property.property_status?.toLowerCase() === params.status.toLowerCase());
        if (params.type) result = result.filter((property) => property.property_type?.toLowerCase() === params.type.toLowerCase());
        if (params.minPrice) result = result.filter((property) => Number(property.property_price) >= Number(params.minPrice));
        if (params.maxPrice) result = result.filter((property) => Number(property.property_price) <= Number(params.maxPrice));
        if (params.location) {
            const query = params.location.toLowerCase();
            result = result.filter((property) =>
                property.city?.toLowerCase().includes(query) ||
                property.state?.toLowerCase().includes(query) ||
                property.property_name?.toLowerCase().includes(query)
            );
        }
        return result;
    };

    const getListPage = (source) => {
        const properties = filterProperties(source);
        const page = Number(params.page) || 1;
        const limit = 10;
        const total = properties.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const pagination = { page: Math.min(page, totalPages), limit, total, totalPages };
        const visibleProperties = properties.slice((pagination.page - 1) * limit, pagination.page * limit);
        return { visibleProperties, pagination };
    };

    const ownedPage = getListPage(ownedProperties);
    const managedPage = getListPage(managedProperties);

    return (
        <div className="space-y-6 p-4">
            <p className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-8">Properties</p>
            <DashboardGridItem title="Properties Summary">
            <PropertiesSummary properties={allProperties} totalProperties={allProperties.length} />
            </DashboardGridItem>
            
            <div className="flex flex-col items-end gap-4 sm:flex-row sm:justify-end">
                <SearchInput placeholder="Search location..." />
                <DashboardFilter />
            </div>
            <DashboardGridItem >
                <AdminPropertiesTabs
                    initialTab={params.view}
                    ownedCount={ownedProperties.length}
                    managedCount={managedProperties.length}
                    ownedList={<AdminPropertyList properties={ownedPage.visibleProperties} bookings={[]} pagination={ownedPage.pagination} />}
                    managedList={<AdminPropertyList properties={managedPage.visibleProperties} bookings={[]} pagination={managedPage.pagination} />}
                />
            </DashboardGridItem>
        </div>
    )
}
