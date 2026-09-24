import { Suspense } from "react";
import LoadingPropertiesCard from "./LoadingPropertiesCard";
import { RiHotelBedLine } from "react-icons/ri";
import { LuBath } from "react-icons/lu";
import { LiaToiletSolid } from "react-icons/lia";
import { FaRegSquare } from "react-icons/fa6";
import { IoMdCheckmark } from "react-icons/io";
import TextExpander from "./TextExpander";
import TestimonySection from "./TestimonySection";
import OtherProperties from "./OtherProperties";
import PropertyDetailsSidebar from "./PropertyDetailsSidebar";
import ReviewsBox from "./ReviewsBox";
function PropertiesDetailsSection({ property, isAuthenticated }) {

    return (
        <>
            <div className="flex min-w-0 flex-col gap-8 md:col-span-3 md:gap-[72px]">
                {/* Specification */}
                <div className="flex flex-col gap-4 ">
                    <h3 className="text-lg font-medium text-primary-900 sm:text-[1.375rem]">Specification</h3>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-4 rounded-lg bg-white p-4 shadow-lg sm:gap-4 sm:p-6 md:flex md:justify-between md:px-12 md:py-6">
                        {/* Bedroom */}
                            <div className="flex min-w-0 flex-col items-center gap-2 font-mono">
                            <div className="flex items-center gap-2 font-mono text-xl text-black sm:text-2xl">
                                <RiHotelBedLine />
                                <span className="text-base ">Bedrooms</span>
                            </div>
                            <span className="text-lg font-bold">{property?.total_bedrooms}</span>
                        </div>
                        {/* Bathroom */}
                        <div className="flex min-w-0 flex-col items-center gap-2 font-mono">
                            <div className="flex items-center gap-2 text-xl text-black sm:text-2xl">
                                <LuBath />
                                <span className="text-base ">Bathrooms</span>
                            </div>
                            <span className="text-lg font-bold">{property?.total_bathrooms}</span>
                        </div>
                        {/* Toilets */}
                        <div className="flex min-w-0 flex-col items-center gap-2 font-mono">
                            <div className="flex items-center gap-2 text-xl text-black sm:text-2xl">
                                <LiaToiletSolid />
                                <span className="text-base ">Toilets</span>
                            </div>
                            <span className="text-lg font-bold">{property?.total_toilets}</span>
                        </div>
                        {/* Square area */}
                        {
                            property?.property_square_area && (
                                <div className="flex min-w-0 flex-col items-center gap-2 font-mono">
                                    <div className="flex items-center gap-2 text-xl text-black sm:text-2xl">
                                        <FaRegSquare />
                                        <span className="text-base ">Square Area</span>
                                    </div>
                                    <span className="text-lg font-bold">{property?.property_square_area} sqm<sup>2</sup></span>
                                </div>
                            )}
                    </div>
                </div>
                {/* Description */}
                <div className="border border-neutral-300"></div>
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-medium text-primary-900 sm:text-[1.375rem]">Description</h3>
                    <div className="break-words text-sm leading-7 tracking-wide text-black sm:text-base">
                        <TextExpander>
                            {property?.description}
                        </TextExpander>
                    </div>
                </div>
                <section className="md:col-span-1 md:hidden">
                    <PropertyDetailsSidebar property={property} isAuthenticated={isAuthenticated} />
                </section>
                <div className="border border-neutral-300"></div>
                {/* Property features */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-medium text-primary-900 sm:text-[1.375rem]">Property Features</h3>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-4 font-mono text-sm text-black sm:text-base md:grid-cols-2 md:gap-x-20 md:gap-y-6">
                        <div className="flex min-w-0 justify-between gap-3">
                            <span className="shrink-0">Location</span>
                            <span className="min-w-0 break-words text-right">{property?.city}, {property?.state}</span>
                        </div>
                        {property?.property_square_area && (
                            <div className="flex min-w-0 justify-between gap-3">
                                <span className="shrink-0">Property Size</span>
                                <span className="min-w-0 break-words text-right">{property?.property_square_area}</span>
                            </div>
                        )}
                        <div className="flex min-w-0 justify-between gap-3">
                            <span className="shrink-0">Status</span>
                            <span className="min-w-0 break-words text-right">{property?.property_status}</span>
                        </div>
                        {property?.land_area &&
                            <div className="flex min-w-0 justify-between gap-3">
                                <span className="shrink-0">Land Size</span>
                                <span className="min-w-0 break-words text-right">{property?.land_area}</span>
                            </div>}
                        <div className="flex min-w-0 justify-between gap-3">
                            <span className="shrink-0">Type</span>
                            <span className="min-w-0 break-words text-right">{property?.property_type}</span>
                        </div>
                        <div className="flex min-w-0 justify-between gap-3">
                            <span className="shrink-0">Kitchen Type</span>
                            <span className="min-w-0 break-words text-right">{property?.kitchen_type}</span>
                        </div>
                        <div className="flex min-w-0 justify-between gap-3">
                            <span className="shrink-0">Parking Area</span>
                            <span className="min-w-0 break-words text-right">{property?.parking_area}</span>
                        </div>
                    </div>
                </div>
                <div className="border border-neutral-300"></div>
                {/* Property Amenties */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-medium text-primary-900 sm:text-[1.375rem]">Amenities</h3>
                    <div className="grid auto-rows-auto grid-cols-1 gap-x-6 gap-y-4 break-words font-mono text-sm text-black sm:grid-cols-2 sm:text-base md:grid-cols-3 md:gap-x-10 md:gap-y-6">
                        {
                            property?.property_amenities?.map((amenity, index) => (<div className="flex min-w-0 items-center gap-3" key={index}>
                                <IoMdCheckmark /> <span>{amenity}</span>
                            </div>))
                        }
                    </div>
                </div>
                <div className="border border-neutral-300"></div>
                {/* Property Reviews */}
                <ReviewsBox/>
                <div className="border border-neutral-300"></div>

            </div>
            <section className="md:col-span-1 hidden md:block">
                <PropertyDetailsSidebar property={property} isAuthenticated={isAuthenticated} />
            </section>
            <section className="col-span-4 flex flex-col gap-8 md:gap-[72px]">
                {/* Map */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-medium text-primary-900 sm:text-[1.375rem]">Map</h3>
                    <iframe
                        title="google map"
                        src={`https://www.google.com/maps?q=${property?.lat},${property?.long}&hl=es;z=14&output=embed`}
                        style={{ border: "0px" }}
                        width="100%"
                        className="h-64 rounded-lg sm:h-80 md:h-[455px]"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
                <div className="border border-neutral-300"></div>
                {/* Reviews */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-medium text-primary-900 sm:text-[1.375rem]">Reviews</h3>
                    <TestimonySection />
                </div>
                <div className="border border-neutral-300"></div>
                {/* other properties */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-medium text-primary-900 sm:text-[1.375rem]">You may also like these properties</h3>
                    <Suspense fallback={<LoadingPropertiesCard lengths={6} />}>
                        <OtherProperties />
                    </Suspense>
                </div>
            </section>
        </>
    )
}

export default PropertiesDetailsSection
