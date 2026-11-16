import AddNewPropertyForm from "@/app/_components/AddNewPropertyForm";
import ViewPropertyForm from "@/app/_components/ViewPropertyForm";

import { getProperty, getPropertyOwnerProfile, getCities, getPropertyOwnerBookings } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export default async function Page({ params }) {
    const { propertyId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const results = await Promise.allSettled([
        getProperty(propertyId),
        getPropertyOwnerProfile(token),
        getCities(),
        getPropertyOwnerBookings(token)
    ]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const property = results[0].status === "fulfilled" ? results[0].value : null;
    const propertyOwner = results[1].status === "fulfilled" ? results[1].value : null;
    const allCities = results[2].status === "fulfilled" ? results[2].value : [];
    const ownerBookings = results[3].status === "fulfilled" ? results[3].value : [];

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
            {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
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
