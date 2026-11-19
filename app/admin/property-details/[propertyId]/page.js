import AdminHeader from "@/app/_components/AdminHeader";
import ViewPropertyForm from "@/app/_components/ViewPropertyForm";
import { getCities, getPropertyOwnerById, getAdminBooking, getPropertyById } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page({ params }) {
    const param = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const property = await getPropertyById(param.propertyId);
    const [propertyOwner, allCities, allBookings] = await Promise.all([
        getPropertyOwnerById(property?.property_owner_id),
        getCities(),
        getAdminBooking(token),
    ]);

    // Match bookings to this property
    const propertyBookings = (allBookings || []).filter(
        b => String(b.property_id) === String(param.propertyId) || 
             String(b.property?._id) === String(param.propertyId) || 
             String(b.property?.id) === String(param.propertyId) ||
             (b.property?.property_name && property?.property_name && b.property.property_name.toLowerCase() === property.property_name.toLowerCase())
    );

    if (property) {
        property.bookings = propertyBookings;
    }

    return (
        <div className="flex min-w-0 flex-1 flex-col">
            <AdminHeader title="Property Details" backHref="/dashboard/admin/properties" />
            <main className="flex-1 max-w-5xl mx-auto w-full py-8 px-4 sm:px-6 flex min-w-0 flex-col items-center justify-center">
                <ViewPropertyForm
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
