import Image from "next/image";
import ViewPhotos from "@/app/_components/ViewPhotos";
export default function PropertyPhotoSection({property}){
    const images = property?.images?.slice(0, 4) || [];

    return (
        <div className="grid min-w-0 auto-rows-[130px] grid-cols-2 gap-2 sm:gap-3 md:auto-rows-auto md:grid-cols-4 md:grid-rows-3 md:gap-6">
            <div className="relative col-span-2 row-span-2 h-[260px] md:col-span-3 md:row-span-3 md:h-[615px]">
                {images[0] ? (
                    <Image
                        fill
                        src={`https://app.xpacy.com/src/upload/properties/${images[0]}`}
                        unoptimized
                        alt="Property image"
                        className="rounded-lg object-cover"
                    />
                ) : <div className="h-full rounded-lg bg-gray-100" />}
                {images.length > 0 && <div className="md:hidden"><ViewPhotos propertySlug={property?.property_slug}/></div>}
            </div>
            {images.slice(1).map((image, index) => <div key={image} className="relative min-h-0">
                <Image
                    fill
                    src={`https://app.xpacy.com/src/upload/properties/${image}`}
                    unoptimized
                    alt="Property image"
                    className="object-cover rounded-lg"
                />
                {index === images.length - 2 && <div className="hidden md:block"><ViewPhotos propertySlug={property?.property_slug}/></div>}
            </div>)}
            {images.length === 1 && <div className="relative hidden md:block" />}
        </div>
    )
}
