import Image from "next/image";
import Link from "next/link"
import { SlPicture } from "react-icons/sl";
import ViewPhotos from "@/app/_components/ViewPhotos";
export default function PropertyPhotoSection({property}){
    return (
        <div className="grid md:grid-cols-4 md:grid-rows-3 md:gap-6 grid-cols-3 gap-y-4 grid-rows-3 gap-x-2">
            <div className="md:col-span-3 md:row-span-3 col-span-3 row-span-2 relative md:h-[615px] h-[250px]">
                <Image
                    fill
                    src={`https://app.xpacy.com/src/upload/properties/${property?.images.at(0)}`}
                    unoptimized
                    alt="Property image"
                    className="object-cover rounded-lg"
                />
                 <div className="md:hidden block">
                    <ViewPhotos propertySlug={property?.property_slug}/>
                </div>
            </div>
            <div className="relative">
                <Image
                    fill
                    src={`https://app.xpacy.com/src/upload/properties/${property?.images.at(1)}`}
                    unoptimized
                    alt="Property image"
                    className="object-cover rounded-lg"
                />
            </div>
            <div className="relative">
                <Image
                    fill
                    src={`https://app.xpacy.com/src/upload/properties/${property?.images.at(2)}`}
                    unoptimized
                    alt="Property image"
                    className="object-cover rounded-lg"
                />
            </div>
            <div className="relative">
                <Image
                    fill
                    src={`https://app.xpacy.com/src/upload/properties/${property?.images.at(3)}`}
                    unoptimized
                    alt="Property image"
                    className="object-cover rounded-lg"
                />
                <div className="hidden md:block">
                    <ViewPhotos propertySlug={property?.property_slug}/>
                </div>
            </div>
        </div>
    )
}