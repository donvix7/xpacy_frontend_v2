import Carousel from "./Carousel";
import img01 from "@/public/carousel-photo01.png";
import Image from "next/image";
import { getBanners } from "../_lib/data-services";

export default async function AuthCarousel({ position = "top-2/3"}){
    let banners = await getBanners();
    if (!banners || banners.length === 0) {
        banners = [{
            id: 'default',
            image_url: 'default-banner.jpg', // Ensure you have a default image or handle this path
            title: 'Welcome to Xpacy'
        }];
    }
    const slides = banners.map((banner) => {
        return(
        <div className="h-full relative" key={banner.id}>
            <Image
                fill
                unoptimized
                    src={`https://app.xpacy.com/src/upload/homepage_slider/${banner.image_url}`}
                alt="Xpacy Hero"
                className="object-cover"
            />
            <div className={`absolute flex flex-col space-y-8 z-20 w-10/12 text-white text-center translate-x-[-50%] translate-y-[-50%] ${position} left-[50%]`}>
                <h1 className="leading-15  md:text-3xl font-bold">{banner.title}</h1>
            </div>
            <div className="absolute top-0 right-0 left-0 bottom-0 opacity-30 bg-gray-700 z-10" />
        </div>
        )
    })

    return (
        <Carousel slides={slides} indicators={true}/>
    )
}