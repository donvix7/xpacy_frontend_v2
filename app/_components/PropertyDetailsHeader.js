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
        <header className="flex flex-col gap-12 py-6">
            <div className="flex items-center space-x-2 font-mono text-black text-sm md:text-base">
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
            <div className="md:space-y-2 space-y-4 flex flex-col">
                <h1 className="font-bold text-[28px] md:text-4xl capitalize ">{propertyName}</h1>
                <div className="flex md:items-center md:justify-between gap-2 md:gap-0 flex-col md:flex-row">
                    <p className="md:text-md text-base flex items-center gap-2 text-primary-700">
                        <span className="text-2xl"><IoLocationOutline/></span>
                        {propertyAddress}
                    </p>
                    <div className="space-x-2 flex">
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