import BackBtn from "@/app/_components/BackBtn";
import Logo from "@/app/_components/Logo";
import ViewPropertyForm from "@/app/_components/ViewPropertyForm";
import { getCities, getProperty, getPropertyOwnerById, getAdminBooking, getPropertyById } from "@/app/_lib/data-services";
import { cookies } from "next/headers";



export default async function Page({ params }) {
    const param = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")
    const property = await getPropertyById(param.propertyId)
    console.log(property)
    const [propertyOwner, allCities, allBookings] = await Promise.all([
        getPropertyOwnerById(property?.property_owner_id),
        getCities(),
        getAdminBooking(token)
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
        <div className="flex min-w-0 flex-1 flex-col gap-4.5">
            {/* Navigation */}
            <nav className="flex border-b border-primary-100 px-4 py-4 sm:px-6 md:px-[7%] md:py-6">
                <div className="flex w-full items-center justify-between gap-4 md:w-1/2">
                    <BackBtn />
                    <Logo />
                </div>
            </nav>
            {/* Form */}
            <div className="flex min-w-0 flex-col items-center justify-center px-2 sm:px-4">
                <ViewPropertyForm
                    allOwners={null}
                    allCities={allCities}
                    token={token}
                    propertyOwnerInfo={propertyOwner}
                    disableSearch={true}
                    propertyObj={property}
                />
            </div>

            
        </div>
    )
}
