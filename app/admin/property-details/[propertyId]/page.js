import AddNewPropertyForm from "@/app/_components/AddNewPropertyForm";
import BackBtn from "@/app/_components/BackBtn";
import Logo from "@/app/_components/Logo";
import ViewPropertyForm from "@/app/_components/ViewPropertyForm";
import { getCities, getProperty, getPropertyOwnerById, getAdminBooking } from "@/app/_lib/data-services";
import { cookies } from "next/headers";



export default async function Page({ params }) {
    const param = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")
    const property = await getProperty(param.propertyId);
    const propertyOwner = await getPropertyOwnerById(token, property?.property_owner_id);
    const [allCities, allBookings] = await Promise.all([
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
        <div className="flex-1 flex flex-col gap-4.5">
            {/* Navigation */}
            <nav className="   flex  pl-[7%] py-6 border-b border-primary-100">
                <div className="w-1/2 flex items-center justify-between">
                    <BackBtn />
                    <Logo />
                </div>
            </nav>
            {/* Form */}
            <div className="flex flex-col items-center justify-center">
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