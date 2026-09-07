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
            <div className="flex flex-col gap-[72px] md:col-span-3">
                {/* Specification */}
                <div className="flex flex-col gap-4 ">
                    <h3 className="text-primary-900 text-[1.375rem] font-normal">Specification</h3>
                    <div className="px-12 py-6 bg-white shadow-lg md:flex md:justify-between rounded-lg grid gap-y-2 md:gap-y-0 grid-cols-[1fr_1fr]">
                        {/* Bedroom */}
                        <div className="flex flex-col gap-2 items-center font-mono">
                            <div className="flex items-center gap-2 font-mono text-2xl text-black">
                                <RiHotelBedLine />
                                <span className="text-base ">Bedrooms</span>
                            </div>
                            <span className="text-lg font-bold">{property?.total_bedrooms}</span>
                        </div>
                        {/* Bathroom */}
                        <div className="flex flex-col gap-2 items-center font-mono">
                            <div className="flex items-center gap-2 text-2xl text-black">
                                <LuBath />
                                <span className="text-base ">Bathrooms</span>
                            </div>
                            <span className="text-lg font-bold">{property?.total_bathrooms}</span>
                        </div>
                        {/* Toilets */}
                        <div className="flex flex-col gap-2 items-center font-mono">
                            <div className="flex items-center gap-2 text-2xl text-black">
                                <LiaToiletSolid />
                                <span className="text-base ">Toilets</span>
                            </div>
                            <span className="text-lg font-bold">{property?.total_toilets}</span>
                        </div>
                        {/* Square area */}
                        {
                            property?.property_square_area && (
                                <div className="flex flex-col gap-2 items-center font-mono">
                                    <div className="flex items-center gap-2 text-2xl text-black">
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
                    <h3 className="text-primary-900 text-[1.375rem] font-normal">Description</h3>
                    <div className="text-base text-black font-mono tracking-wide">
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
                    <h3 className="text-primary-900 text-[1.375rem] font-normal">Property Features</h3>
                    <div className="text-base text-black font-mono grid md:grid-cols-2 grid-cols-1 gap-x-20 gap-y-6 grid-rows-auto">
                        <div className="flex justify-between text-base text-black font-mono">
                            <span>Location</span>
                            <span>{property?.city}, {property?.state}</span>
                        </div>
                        {property?.property_square_area && (
                            <div className="flex justify-between text-base text-black font-mono">
                                <span>Property Size</span>
                                <span>{property?.property_square_area}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base text-black font-mono">
                            <span>Status</span>
                            <span>{property?.property_status}</span>
                        </div>
                        {property?.land_area &&
                            <div className="flex justify-between text-base text-black font-mono">
                                <span>Land Size</span>
                                <span>{property?.land_area}</span>
                            </div>}
                        <div className="flex justify-between text-base text-black font-mono">
                            <span>Type</span>
                            <span>{property?.property_type}</span>
                        </div>
                        <div className="flex justify-between text-base text-black font-mono">
                            <span>Kitchen Type</span>
                            <span>{property?.kitchen_type}</span>
                        </div>
                        <div className="flex justify-between text-base text-black font-mono">
                            <span>Parking Area</span>
                            <span>{property?.parking_area}</span>
                        </div>
                    </div>
                </div>
                <div className="border border-neutral-300"></div>
                {/* Property Amenties */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-primary-900 text-[1.375rem] font-normal">Amenities</h3>
                    <div className="grid auto-rows-auto md:grid-cols-3 grid-cols-1 gap-x-10 gap-y-6 text-base text-black font-mono">
                        {
                            property?.property_amenities.map((amenity, index) => (<div className="flex gap-4 items-center" key={index}>
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
            <section className="flex flex-col col-span-4 gap-[72px]">
                {/* Map */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-primary-900 text-[1.375rem] font-normal">Map</h3>
                    <iframe
                        title="google map"
                        src={`https://www.google.com/maps?q=${property?.lat},${property?.long}&hl=es;z=14&output=embed`}
                        style={{ border: "0px" }}
                        width="100%"
                        height="455"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
                <div className="border border-neutral-300"></div>
                {/* Reviews */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-primary-900 text-[1.375rem] font-normal">Reviews</h3>
                    <TestimonySection />
                </div>
                <div className="border border-neutral-300"></div>
                {/* other properties */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-primary-900 text-[1.375rem] font-normal">You many also like these properties</h3>
                    <Suspense fallback={<LoadingPropertiesCard lengths={6} />}>
                        <OtherProperties />
                    </Suspense>
                </div>
            </section>
        </>
    )
}

export default PropertiesDetailsSection
