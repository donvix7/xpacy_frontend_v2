"use client"
import { formatCurrency } from "../_lib/utils";
import BookDayPicker from "./BookDayPicker";
import Modal from "./Modal";
import VideoTour from "./VideoTour";
import BookShortletButton from "./BookShortletButton";
import { FiPhone } from "react-icons/fi";
import LoginForm from "./LoginForm";
import { usePathname } from "next/navigation";

export default function PropertyDetailsSidebar({property, isAuthenticated}){
    const pathname = usePathname();
    return (
        <div className="flex flex-col gap-8 py-[38px]">
            <div className="px-4 pt-8 pb-8 flex flex-col gap-4 shadow-lg rounded-lg">
                <p className="text-[1.5rem] text-center tracking-widest font-mono font-bold text-secondary-500 ">{formatCurrency(property?.property_price)} {property?.property_status === "Shortlet" && "/night"}</p>
                <Modal>
                    <Modal.Open name={isAuthenticated && (property?.property_status === "Shortlet" || property?.property_status === "Rent") ? "booking" : (!isAuthenticated ? "login" : "")} >
                        <BookShortletButton id={property?.id} property_status={property?.property_status} isAuthenticated={isAuthenticated}>
                            {property?.property_status === "Shortlet" ? "Book This Shortlet" : property?.property_status === "Rent" ? "Book Inspection Date" : "Continue"}
                        </BookShortletButton>
                    </Modal.Open>
                    <Modal.Window property_id={property?.id} name="booking">
                        <BookDayPicker property_status={property?.property_status} />
                    </Modal.Window>
                    <Modal.Window name="login" className="max-w-[520px]">
                        <div className="max-h-[95vh] overflow-y-auto px-1 py-4 w-full md:w-[520px]">
                            <LoginForm role="user" customRedirectUrl={pathname} />
                        </div>
                    </Modal.Window>
                </Modal> 
                
            </div>
            {property?.virtual_tour_url && <VideoTour property={property} />}
            <div className="flex flex-col p-4 shadow-lg items-center gap-6 rounded-lg">
                <p className="text-center text-md">For Enquiries</p>
                <p className="font-mono flex items-center gap-1 text-base">
                    <span><FiPhone/></span>
                    <span>Call +234 906 855 7780</span>
                </p>
            </div>
        </div>
    )
}