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
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader title="Service Details" backHref="/dashboard/admin/services" />
            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        Service Details
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        Property and service information overview.
                    </p>
                </header>
                <div className="p-6 sm:p-8 rounded-2xl border border-line bg-card shadow-sm">
                    <AddNewPropertyForm
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
