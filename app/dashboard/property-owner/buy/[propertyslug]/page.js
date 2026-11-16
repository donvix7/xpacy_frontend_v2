import AppHeader from "@/app/_components/AppHeader";
import Footer from "@/app/_components/Footer";
import PropertiesDetailsSection from "@/app/_components/PropertiesDetailsSection";
import PropertyDetailsHeader from "@/app/_components/PropertyDetailsHeader";
import PropertyPhotoSection from "@/app/_components/PropertyPhotosSection";
import PropertySavedIcon from "@/app/_components/ProperySavedIcon";
import { getProperty } from "@/app/_lib/data-services"

import { cookies } from "next/headers";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export async function generateMetadata({params}){
    const pageParams = await params
    let property = null;
    try {
        property = await getProperty(pageParams.propertyslug);
    } catch {
        return {
            title: "Property",
            description: "View property details on Xpacy.",
        }
    }
    return {
        title: property?.property_name,
        description: property?.description,
        openGraph: {
            title: property?.property_name,
            description: property?.description,
            images: [
                {url: `https://app.xpacy.com/src/upload/properties/${property?.images?.at(0)}`,
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
    const results = await Promise.allSettled([getProperty(pageParams.propertyslug)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const property = results[0].status === "fulfilled" ? results[0].value : null;
    return (
        <>
            <AppHeader />
            <main className="flex flex-col px-[7%]">
                {dataErrorMessages.length > 0 ? <DataErrorNotice messages={dataErrorMessages} /> : null}
                <PropertyDetailsHeader propertyName={property?.property_name} propertyStatus={property?.property_status} propertyAddress={property?.address}>
                    <PropertySavedIcon propertyId={property?.id} />
                </PropertyDetailsHeader>
                <PropertyPhotoSection property={property} />
                <div className="grid grid-cols-4 gap-12 py-12">
                    <PropertiesDetailsSection property={property} isAuthenticated={isAuthenticated} />
                </div>
            </main>
            <Footer />
        </>
    )
}