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
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader title="Edit Property" backHref="/dashboard/admin/properties" />
            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        Edit Property
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        Update property details, owner assignment, and pricing.
                    </p>
                </header>
                <div className="p-6 sm:p-8 rounded-2xl border border-line bg-card shadow-sm">
                    <EditPropertyForm
                        allOwners={allOwners}
                        allCities={allCities}
                        token={token}
                        propertyOwnerInfo={propertyOwner}
                        disableSearch={false}
                        initialData={property}
                        isEditMode={true}
                    />
                </div>
            </main>
        </div>
    );
}
