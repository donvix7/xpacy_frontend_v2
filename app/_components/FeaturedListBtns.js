"use client"
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { useRef } from "react";

export default function FeaturedListBtns({children}){
      const containerRef = useRef(null);
      const moveRight = () => {
        containerRef.current.scrollBy({left: 500, behaviour: 'smooth'})
      }
        const moveLeft = () => {
          containerRef.current.scrollBy({ left: -500, behaviour: "smooth" });
        };
    return (
        <div
        ref={containerRef}
        className=" overflow-x-scroll no-scrollbar flex  flex-nowrap"
      >
        <div className=" hidden w-6/7 absolute top-1/2 lg:justify-between lg:flex z-10 ">
          <button onClick={moveLeft} className="bg-white rounded-full cursor-pointer p-3 border border-black flex items-center justify-center">
            <ArrowLeftIcon className="size-6" />
          </button>
          <button
            onClick={moveRight}
            className="bg-white rounded-full cursor-pointer p-3 border border-black flex items-center justify-center"
          >
            <ArrowRightIcon className="size-6" />
          </button>
        </div>
        {children}
      </div>
    )
}