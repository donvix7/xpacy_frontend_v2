import { MdKeyboardArrowRight } from "react-icons/md";
import { TiStarFullOutline, TiStarHalfOutline } from "react-icons/ti";
import CustomerRatings from "./CustomerRatings";
export default function ReviewsBox({ totalRating = 4.5 }) {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-primary-900 text-[1.375rem] font-normal ">Reviews and Ratings</h3>
            <div className="grid auto-rows-auto md:grid-cols-[250px_1fr] grid-cols-1p gap-6 text-base text-black font-mono">
                <div className="flex flex-col gap-3">
                    <h3 className="md:text-lg text-base  uppercase mt-2">Verified Ratings (1)</h3>
                    <div className="p-4 flex flex-col gap-4 items-center bg-gray-100 rounded-lg shadow-lg border border-gray-200">
                        <p className="text-2xl font-semibold text-primary">{totalRating}/5</p>
                        <div className="flex text-2xl text-secondary-500">
                            {Array.from({ length: 5 }, (_, i) => {
                                if ((i + 1) % totalRating === 0.5) {
                                    return <span key={i}><TiStarHalfOutline /></span>
                                } else {
                                    return <span key={i}><TiStarFullOutline /></span>
                                }
                            })}
                        </div>
                        <p>1 Verified rating</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3 ">
                    <div className="flex justify-between gap-2 md:gap-0 items-center">
                        <h3 className="md:text-lg text-sm uppercase">Comments from verified bookings (1)</h3>
                        <button className="md:px-3.5 px-1.5 py-1 flex items-center gap-2 md:text-lg text-base text-secondary rounded-lg hover:bg-gray-200 cursor-pointer">
                            <span>See all</span>
                            <span><MdKeyboardArrowRight /></span>
                        </button>
                    </div>
                    <div className="border border-gray-100"></div>
                    {/* Customer comments and ratings */}
                    {Array.from({length: 1}, (_, i) => (<CustomerRatings key={i}/>))}
                </div>
            </div>
        </div>
    )
}