"use client"
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

import bedIcon from "@/public/bed.svg";
import bathIcon from "@/public/bath.svg";
import { IoMdClose } from "react-icons/io";
import { HeartIcon } from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from './../_lib/utils';
import { useTransition } from 'react';
import { handleDelteSavedProp } from "../_lib/action";
import { usePathname, useRouter } from "next/navigation";
import SpinnerMini from "./SpinnerMini";
import { GoHeartFill } from "react-icons/go";

export default function SavedPropertyCard({ property, id }) {
    const pathname = usePathname();
    const router = useRouter();
    const [ isPending, startTransition] = useTransition();
    const handleDelete  = () => {
        startTransition(() => {
            toast.promise(() => handleDelteSavedProp(id), {
                loading: "Deleting...",
                success: (data) => `${data.message}`,
                error: (error) => {
                    router.push(`/auth/log-in?redirectUrl=${encodeURIComponent(pathname)}`);
                    return `${error.message}`
                }
            })
        })
    }
    return (
        <div className=" h-[558px] flex flex-col rounded-bl-md rounded-br-md shadow-lg">
            <Link href={`/${property?.property_status.toLowerCase()}/${property?.property_slug}`} className="relative p-4 overflow-hidden h-[280px] rounded-tl-md rounded-tr-md">
                <div className="flex items-center justify-between">
                    <span className="rounded-full z-10 px-4 py-2 bg-primary text-white font-mono text-sm  text-center">
                        {property.property_status}
                    </span>
                    <button className="rounded-full bg-gray-300 p-3 z-10">
                        <span className="text-primary text-2xl"><GoHeartFill /></span>
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
                <div className="flex items-center justify-between">
                    <div className="space-x-1 flex items-center font-mono text-[16px]">
                        <Image src={bedIcon} width="24" height="24" alt="bed icon"/>
                        <span>Bed: {property.total_bedrooms}</span>
                    </div>
                    <div className="space-x-1 flex items-center font-mono text-[16px]">
                        <Image src={bathIcon} width="24" height="24" alt="bath icon"/>
                        <span>Baths: {property.total_bathrooms}</span>
                    </div>
                </div>
                <div className="border border-neutrals" />
                <div className="flex items-center justify-between font-mono">
                    <Link href={`/${property?.property_status.toLowerCase()}/${property?.property_slug}`} className="p-2 font-bold text-white bg-primary rounded-lg cursor-pointer">View Details</Link>
                    <button onClick={handleDelete} disabled={isPending} className="p-2 font-bold text-primary bg-white border border-primary rounded-lg cursor-pointer flex items-center gap-1 disabled:bg-gray-300 disabled:cursor-not-allowed">
                        <span className="text-2xl">
                           {isPending ? <SpinnerMini/> :  <IoMdClose/>}
                        </span>
                        <span>Remove</span>
                    </button>
                </div>
            </main>
        </div>
    )
}