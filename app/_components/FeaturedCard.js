import Image from "next/image";


import { MapPinIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { formatCurrency } from './../_lib/utils';
import PropertySavedIcon from "./ProperySavedIcon";

export default function FeaturedCard({ property }) {
  return (
    <div className=" w-[373px] h-[518px] flex flex-col rounded-bl-md rounded-br-md shadow-lg">
      <Link href={`${property.property_status.toLowerCase()}/${property?.property_slug}`} className="relative p-4 overflow-hidden h-[280px] rounded-tl-md rounded-tr-md">
        <div className="flex items-center justify-between">
          <span className="rounded-full z-10 px-4 py-2 bg-primary text-white font-mono text-sm  text-center">
            {property.property_status}
          </span>
          <PropertySavedIcon isPropertyCard={true} propertyId={property.id} />
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
      </Link>
      <main className="p-4  space-y-6">
        <div className="flex flex-col space-y-2">
          <p className="font-mono text-s text-neutrals-900">
            {property.property_type}
          </p>
          <h1 className="text-base text-md">{property.property_name}</h1>
          <div className="flex space-x-2 items-center font-mono">
            <MapPinIcon className="size-6" />
            <span>
              {property.city}, {property.state}
            </span>
          </div>
          <p className="font-mono font-bold text-2xl tracking-wide text-secondary">
            {formatCurrency(property.property_price)}
          </p>
        </div>
        <div className="border border-neutrals" />
        <div className="flex items-center justify-between">
          <div className="space-x-1 flex items-center font-mono text-[16px]">
            <img src={"./bed.svg"} alt="bath-icon" />
            <span>Bed: {property.total_bedrooms}</span>
          </div>
          <div className="space-x-1 flex items-center font-mono text-[16px]">
            <img src={"./bath.svg"} alt="bath icon" />
            <span>Baths: {property.total_bathrooms}</span>
          </div>
        </div>
      </main>
    </div>
  );
}