import { Suspense } from "react";
import { getBanners } from "../_lib/data-services";
import Carousel from "./Carousel";
import Image from "next/image";
export default async function HomeCarousel() {
  const banners = await getBanners();                     
  const slides = banners?.map((banner) => {
    return (
      <div key={banner.id} className="h-full relative">
        <Image
          fill
          unoptimized
          src={`https://app.xpacy.com/src/upload/homepage_slider/${banner?.image_url}`}
          alt="Xpacy Hero"
        />
        <div className="absolute flex flex-col p-4 md:p-0 space-y-8 z-20 md:w-10/12 w-full text-white text-center translate-x-[-50%] translate-y-[-50%] md:top-1/3 top-1/2 left-[50%]">
          <h1 className="leading-15 text-[32px] md:text-5xl">{banner?.title}</h1>
          <p className="md:text-xl text-lg font-light ">
            Search, buy, or rent properties across Nigeria
          </p>
        </div>
        <div className="absolute top-0 right-0 left-0 bottom-0 opacity-30 bg-gray-700 z-10" />
      </div>
    );
  });

  return <Suspense fallback={<div className="spinner"></div>}>
    <Carousel slides={slides} />
  </Suspense>;
}
