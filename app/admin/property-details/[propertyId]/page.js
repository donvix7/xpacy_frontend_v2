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
        <div className="flex min-w-0 flex-1 flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader title="Property Details" backHref="/dashboard/admin/properties" />
            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex min-w-0 flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        Property Details
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        Overview of property specifications, owner info, and bookings.
                    </p>
                </header>
                <div className="p-6 sm:p-8 rounded-2xl border border-line bg-card shadow-sm">
                    <ViewPropertyForm
                        allOwners={null}
                        allCities={allCities}
                        token={token}
                        propertyOwnerInfo={propertyOwner}
                        disableSearch={true}
                        propertyObj={property}
                    />
                </div>
            </main>
        </div>
    );
}
