import { MapPinIcon } from "@heroicons/react/24/solid"
import Image from "next/image"
import { formatCurrency } from "../_lib/utils"

export default function LatestPropertyCard({property}){
    return (
        <div className="h-[170px] flex rounded-lg shadow-md">
            <div className="h-full w-1/2  relative">
                <Image 
                    fill
                    src={`https://app.xpacy.com/src/upload/properties/${property?.images?.at(
                        0
                    )}`}
                    alt="Property image"
                    className="object-cover rounded-l-lg"
                    unoptimized
                />
            </div>
            <div className="p-2 flex flex-col font-mono gap-2">
                <div className="space-y-1">
                    <span className="text-xs text-neutrals-900">{property.property_type}</span>
                    <h2 className="text-sm font-semibold text-black">{property.property_name}</h2>
                </div>
                <div className="space-y-2 flex-end">
                    <div className="flex space-x-1 items-center font-mono">
                        <MapPinIcon className="size-3" />
                        <span className="text-xs font-mono text-neutrals-900">
                            {property.city}, {property.state}
                        </span>
                    </div>
                    <p className="font-mono font-bold text-sm tracking-widest text-secondary">
                                            {formatCurrency(property.property_price)}
                                        </p>
                    <div className="border border-neutrals" />
                    <div className="flex items-center justify-between">
                        <div className="space-x-1 flex items-center font-mono text-xs text-neutrals-900">
                            <img src={"./bed.svg"} alt="bath-icon" />
                            <span>Bed: {property.total_bedrooms}</span>
                        </div>
                        <div className="space-x-1 flex items-center font-mono text-xs text-neutrals-900">
                            <img src={"./bath.svg"} alt="bath icon" />
                            <span>Baths: {property.total_bathrooms}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}