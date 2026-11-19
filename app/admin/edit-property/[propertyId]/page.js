import AdminHeader from "@/app/_components/AdminHeader";
import EditPropertyForm from "@/app/_components/EditPropertyForm";
import { getCities, getProperty, getPropertyOwnerById, getPropertyOwner } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page({ params }) {
    const param = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const property = await getProperty(param.propertyId);
    const propertyOwner = await getPropertyOwnerById(token, property?.property_owner_id);
    const allCities = await getCities();
    const allOwners = await getPropertyOwner(token);

    return (
        <div className="flex-1 flex flex-col min-h-screen">
            <AdminHeader title="Edit Property" backHref="/dashboard/admin/properties" />
            <main className="flex-1 max-w-5xl mx-auto w-full py-8 px-4 sm:px-6 flex flex-col items-center justify-center">
                <EditPropertyForm
                    allOwners={allOwners}
                    allCities={allCities}
                    token={token}
                    propertyOwnerInfo={propertyOwner}
                    disableSearch={false}
                    initialData={property}
                    isEditMode={true}
                />
            </main>
        </div>
    );
}
