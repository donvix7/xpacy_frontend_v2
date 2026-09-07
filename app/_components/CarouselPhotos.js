"use client"

import Image from "next/image"
import {useState} from "react"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
export default function CarouselPhotos({propertyImages}) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const handleNext = () => {
        setCurrentSlideIndex((prev) => (prev + 1 + propertyImages?.length) % propertyImages?.length);
    }
    const handlePrevious = () => {
        setCurrentSlideIndex((prev) => (prev - 1 + propertyImages?.length) % propertyImages?.length);
    }
    return (
        <div className="md:flex flex-col gap-6 hidden">
            <div className="w-full h-full  overflow-hidden relative">
                <div
                    style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
                    className="flex min-w-full h-full transition-transform duration-300 ease-in-out"
                >
                    {propertyImages?.map((image, index) => (
                        <div key={index} className="w-full h-[615px] shrink-0 ">
                            <div className="h-full w-full relative ">
                                <Image unoptimized src={`https://app.xpacy.com/src/upload/properties/${image}`} fill alt="property-photo" className="object-cover rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
                {/* Controls */}
                <div className="w-full flex items-center justify-between absolute top-1/2"> 
                    <button onClick={handlePrevious} className="flex items-center justify-center cursor-pointer w-12 h-12 rounded-full bg-white text-2xl text-black">
                        <FaArrowLeft/>
                    </button>
                    <button onClick={handleNext} className="flex items-center cursor-pointer justify-center w-12 h-12 rounded-full bg-white text-2xl text-black">
                        <FaArrowRight/>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-6 grid-rows-auto">
                {propertyImages.map((image, i) => {
                    return <div key={i} className="w-full h-[205px] relative">
                        <Image unoptimized  src={`https://app.xpacy.com/src/upload/properties/${image}`} alt="property-photo" fill className="object-cover" />
                        {i !== currentSlideIndex && <div className="absolute top-0 left-0 bottom-0 right-0 bg-gray-800 opacity-50 z-40"></div>}
                    </div>
                })}
            </div>
        </div>
    )
}