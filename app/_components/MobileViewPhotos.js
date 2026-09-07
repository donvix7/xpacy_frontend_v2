import Image from "next/image"


export default function MobileViewPhotos({propertyImages}) {

    return (
        <div className="grid grid-cols-1 grid-rows-[auto] md:hidden gap-y-6">
            {propertyImages?.map((image, i) => {
                return (
                    <div key={i} className="w-full h-[250px] relative ">
                        <Image unoptimized src={`https://app.xpacy.com/src/upload/properties/${image}`} alt="property-photo" fill className="object-cover rounded-lg" />
                    </div>
                )
            })}
        </div>
    )
}