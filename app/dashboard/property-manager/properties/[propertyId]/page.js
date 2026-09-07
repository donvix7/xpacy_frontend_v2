import AddNewPropertyForm from "@/app/_components/AddNewPropertyForm";
import ViewPropertyForm from "@/app/_components/ViewPropertyForm";

import { getProperty, getPropertyOwnerProfile, getCities, getPropertyOwnerBookings } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

export default async function Page({ params }) {
    const { propertyId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const [property, propertyOwner, allCities, ownerBookings] = await Promise.all([
        getProperty(propertyId),
        getPropertyOwnerProfile(token),
        getCities(),
        getPropertyOwnerBookings(token)
    ]);

    // Match bookings to this property
    const propertyBookings = (ownerBookings || []).filter(
        b => String(b.property_id) === String(propertyId) || 
             String(b.property?._id) === String(propertyId) || 
             String(b.property?.id) === String(propertyId) ||
             (b.property?.property_name && property?.property_name && b.property.property_name.toLowerCase() === property.property_name.toLowerCase())
    );

    if (property) {
        property.bookings = propertyBookings;
    }

    return (
        <div className="flex-1 py-12 bg-neutrals-50">
            <ViewPropertyForm 
                allOwners={null}
                allCities={allCities}
                token={token}
                propertyOwnerInfo={propertyOwner}
                disableSearch={true}
                propertyObj={property}
                isReadOnly={true}
            />
        </div>
    );
}
