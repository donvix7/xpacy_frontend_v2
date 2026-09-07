import Image from "next/image";
import Link from "next/link";

import bedIcon from "@/public/bed.svg";
import bathIcon from "@/public/bath.svg";
import { HeartIcon } from "@heroicons/react/24/outline";
import { FaHeart } from "react-icons/fa";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from './../_lib/utils';

export default function SavedPropCard({ property }) {
    return (
        <div className=" w-[209px] flex flex-col rounded-bl-md rounded-br-md shadow-lg">
            <div  className="relative p-4 overflow-hidden h-[156px] rounded-tl-md rounded-tr-md">
                {/* Buttons */}
                <div className="flex items-center justify-between">
                    <span className="rounded-full z-10 px-2 py-1.5 bg-primary text-white font-mono text-xs  text-center">
                        {property.property_status}
                    </span>
                    <button className="rounded-full bg-gray-300 p-2.5 z-10">
                        <FaHeart className="size-4" />
                    </button>
                </div>
                <Image
                    fill
                    quality={"80%"}
                    src={`https://app.xpacy.com/src/upload/properties/${property?.images?.at(
                        0
                    )}`}
                    alt="Property image"
                    className="hover:scale-101 transition-all duration-150 object-cover"
                    unoptimized
                />
            </div>
            <main className="p-2  space-y-2">
                <div className="flex flex-col space-y-2">
                    <p className="font-mono text-xs text-neutrals-900">
                        {property.property_type}
                    </p>
                    <h1 className="text-sm text-md">{property.property_name}</h1>
                    <div className="flex space-x-2 items-center font-mono">
                        <MapPinIcon className="size-4" />
                        <span className="text-xs">
                            {property.city}, {property.state}
                        </span>
                    </div>
                    <p className="font-mono font-bold text-sm tracking-wide text-secondary">
                        {formatCurrency(property.property_price)}
                    </p>
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-x-1 flex items-center font-mono text-xs">
                        <Image src={bedIcon} width="24" height="24" alt="bed icon"/>
                        <span>Bed: {property.total_bedrooms}</span>
                    </div>
                    <div className="space-x-1 flex items-center font-mono text-xs">
                        <Image src={bathIcon} width="24" height="24" alt="bath icon"/>
                        <span>Baths: {property.total_bathrooms}</span>
                    </div>
                </div>
            </main>
        </div>
    )
}