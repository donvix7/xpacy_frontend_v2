import AppHeader from "@/app/_components/AppHeader";
import Footer from "@/app/_components/Footer";
import BackBtn from "@/app/_components/BackBtn";
import { getProperty } from "@/app/_lib/data-services";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";

import PropertyDetailsHeader from "@/app/_components/PropertyDetailsHeader";
import PropertySavedIcon from "@/app/_components/ProperySavedIcon";
import CarouselPhotos from "@/app/_components/CarouselPhotos";
import MobileViewPhotos from "@/app/_components/MobileViewPhotos";
export default async function Page({ params }) {
    const pageParams = await params;
    const property = await getProperty(pageParams.propertyslug)
    return (
        <>
            <AppHeader />
            <main className="flex flex-col px-[7%] pb-12">
                <PropertyDetailsHeader 
                    propertyName={property?.property_name} 
                    propertyStatus={property?.property_status} 
                    viewPhotos={true} 
                    propertyAddress={property?.address}
                >
                    <PropertySavedIcon propertyId={property?.id}/>
                </PropertyDetailsHeader>
                <CarouselPhotos propertyImages={property?.images}/>
                <MobileViewPhotos propertyImages={property?.images} />
            </main>
            <Footer />
        </>
    )
}