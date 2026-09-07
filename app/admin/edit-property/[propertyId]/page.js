import AddNewPropertyForm from "@/app/_components/AddNewPropertyForm";
import BackBtn from "@/app/_components/BackBtn";
import EditPropertyForm from "@/app/_components/EditPropertyForm";
import Logo from "@/app/_components/Logo";
import { getCities, getProperty, getPropertyOwnerById, getPropertyOwner } from "@/app/_lib/data-services";
import { cookies } from "next/headers";



export default async function Page({ params }) {
    const param = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")
    const property = await getProperty(param.propertyId);
    const propertyOwner = await getPropertyOwnerById(token, property?.property_owner_id);
    const allCities = await getCities();
    const allOwners = await getPropertyOwner(token);

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
        </div>
    )
}