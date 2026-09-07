import AppHeader from "@/app/_components/AppHeader";
import Footer from "@/app/_components/Footer";
import PropertiesDetailsSection from "@/app/_components/PropertiesDetailsSection";
import PropertyDetailsHeader from "@/app/_components/PropertyDetailsHeader";
import PropertyPhotoSection from "@/app/_components/PropertyPhotosSection";
import PropertySavedIcon from "@/app/_components/ProperySavedIcon";
import { getProperty } from "@/app/_lib/data-services"

import { cookies } from "next/headers";

export async function generateMetadata({ params }) {
    const pageParams = await params
    const property = await getProperty(pageParams.propertyslug);
    return {
        title: property?.property_name,
        description: property?.description,
        openGraph: {
            title: property?.property_name,
            description: property.description,
            images: [
                {
                    url: `https://app.xpacy.com/src/upload/properties/${property?.images.at(0)}`,
                    width: 1200,
                    height: 630
                }
            ]
        }
    }
}
export default async function Page({ params }) {
    const pageParams = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const isAuthenticated = !!token?.value;
    const property = await getProperty(pageParams.propertyslug)
    return (
        <>
            <AppHeader />
            <main className="flex flex-col px-6 md:px-[7%]">
                <PropertyDetailsHeader propertyName={property?.property_name} propertyStatus={property?.property_status} propertyAddress={property?.address}>
                    <PropertySavedIcon propertyId={property?.id} />
                </PropertyDetailsHeader>
                <PropertyPhotoSection property={property} />
                <div className="md:grid md:grid-cols-4 gap-12 py-12 flex flex-col ">
                    <PropertiesDetailsSection property={property} isAuthenticated={isAuthenticated} />
                </div>
            </main>
        </>
    )
}