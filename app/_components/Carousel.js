"use client"

import { useEffect, useState } from "react"

function Carousel({ slides, indicators }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  useEffect(() => {
    const nextSlide = () => {
      setCurrentSlideIndex((prev) => (prev + 1 + slides?.length) % slides?.length);
    }
    const id = setInterval(() => {
      nextSlide()
    }, 50000);
    return () => clearInterval(id);
  }, [slides?.length])
  return (
    <div className="w-full h-full  overflow-hidden relative">
      <div
        style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
        className="flex min-w-full h-full transition-transform duration-300 ease-in-out"
      >
        {slides?.map((slide, index) => (
          <div key={index} className="w-full h-[431px] md:min-h-dvh shrink-0">
            {slide}
          </div>
        ))}
      </div>
      {
        indicators && <div className="flex justify-center items-center absolute top-4/5 w-full">
          <div className="flex items-center gap-2">
            {Array.from({length: slides?.length}, (_, i) => <div key={i} className={`h-3 rounded-full  ${(currentSlideIndex ) === i ? "w-6.5 bg-secondary" : "w-3 bg-secondary-100"}`}></div>)}
          </div>
        </div>
      }
    </div>
  );
}

export default Carousel
