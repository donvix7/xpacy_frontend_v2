import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import StarRating from "./StarRating";


export default function CustomerRatings() {
    return (
        <div className="flex flex-col gap-2">
            <StarRating ratingNum={5} showNum={false} starSize="text-2xl" />
            <p className="font-semibold">Excellent</p>
            <p>Very Comfortable and serene space</p>
            <div className="flex items-center justify-between ">
                <p className="text-gray-400">12-11-25 by Martins</p>
                <div className="flex items-center md:text-lg text-base text-secondary gap-2">
                    <span>
                        <IoMdCheckmarkCircleOutline />
                    </span>
                    <span>
                        Verified Booking
                    </span>
                </div>
            </div>
            <div className="border border-gray-100"></div>
        </div>
    )
}