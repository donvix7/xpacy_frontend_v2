"use client"

import { IoLocationOutline } from "react-icons/io5";
import { MdKeyboardArrowRight } from "react-icons/md";

import Modal from "./Modal";
import PropertySearchBtn from "./PropertySearchBtn";

import Link from "next/link";
import ShareBtn from "./ShareBtn";
import ShareBtnCard from "./ShareBtnCard";
import { useRouter } from "next/navigation";


export default function PropertyDetailsHeader({propertyName, propertyAddress, propertyStatus,  viewPhotos = null, children}){
    const router = useRouter();
    return ( 
        <header className="flex min-w-0 flex-col gap-6 py-5 sm:gap-8 sm:py-6 md:gap-12">
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap font-mono text-sm text-black md:text-base">
                <Link href={"/"}>Home</Link>
                <span className="text-md"><MdKeyboardArrowRight /></span>
                <Link href={`/${propertyStatus?.toLowerCase() || ""}`} className={"capitalize"}>{propertyStatus || "Details"}</Link>
                <span className="text-md"><MdKeyboardArrowRight /></span>
                { viewPhotos && 
                (<> 
                    <button onClick={() => router.back()} className={"capitalize cursor-pointer"}>Property Details</button>
                    <span className="text-md"><MdKeyboardArrowRight /></span>
                 </>)}
                <span className={"text-blue-400 capitalize"}>{viewPhotos ?  "View Photos" : "Property Details"}</span>
            </div>
            <div className="flex min-w-0 flex-col space-y-3 md:space-y-2">
                <h1 className="break-words text-2xl font-bold capitalize sm:text-[28px] md:text-4xl">{propertyName}</h1>
                <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
                    <p className="flex min-w-0 items-start gap-2 break-words text-sm text-primary-700 sm:text-base">
                        <span className="shrink-0 text-2xl"><IoLocationOutline/></span>
                        <span className="min-w-0">{propertyAddress}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <PropertySearchBtn />
                        {children}
                        <Modal>
                            <Modal.Open name={"share"}>
                                <ShareBtn/>
                            </Modal.Open>
                            <Modal.Window name="share">
                                <ShareBtnCard/>
                            </Modal.Window>
                        </Modal>
                    </div>
                </div>

            </div>
        </header>
    )
}
