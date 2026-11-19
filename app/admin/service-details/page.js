import AddNewPropertyForm from "@/app/_components/AddNewPropertyForm";
import AdminHeader from "@/app/_components/AdminHeader";
import { getCities, getProperty, getPropertyOwnerById } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page({ params }) {
    const param = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const property = await getProperty(param?.propertyId);
    const propertyOwner = await getPropertyOwnerById(token, property?.property_owner_id);
    const allCities = await getCities();

    return (
        <div className="flex-1 flex flex-col min-h-screen">
            <AdminHeader title="Service Details" backHref="/dashboard/admin/services" />
            <main className="flex-1 max-w-5xl mx-auto w-full py-8 px-4 sm:px-6 flex flex-col items-center justify-center">
                <AddNewPropertyForm
                    allOwners={null}
                    allCities={allCities}
                    token={token}
                    propertyOwnerInfo={propertyOwner}
                    disableSearch={true}
                    propertyObj={property}
                />
            </main>
        </div>
    );
}
