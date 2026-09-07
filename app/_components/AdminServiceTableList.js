import AdminServiceList from "./AdminServiceList";
import BookedServiceList from "./BookedServicesList";
import UserFilterMenu from "./UserFilterMenu";


export default async function ServicesTableList({ services }) {

    return (
         <div className="flex flex-col p-6 gap-6 border border-primary-200 bg-white rounded-lg">
            <header className="flex items-center justify-between relative">
                <h2 className="text-md text-base lg:font-sans font-mono">Service Overview</h2>
                <div className="flex items-center gap-2">
                    {/* Sortby */}
                    <div className="hidden lg:flex items-center space-x-2.5 font-mono text-base-500">
                        <span>Sort by:</span>
                        <select className="p-2.5 border border-neutral-200 rounded-lg">
                            <option>Default</option>
                            <option>Oldest to newest </option>
                            <option>Newest to oldest</option>
                        </select>
                    </div>
                    {/* Filter */}
                    <UserFilterMenu />
                </div>
            </header>
            <AdminServiceList services={services} />
        </div>
    )
}