import Carousel from "./Carousel";
import Image from "next/image";
import { getBanners } from "../_lib/data-services";

const FALLBACK = {
    id: "default",
    image_url: null,
    title: "Welcome to Xpacy",
};

export default async function AuthCarousel() {
    let banners = await getBanners();
    if (!banners || banners.length === 0) {
        banners = [FALLBACK];
    }

    const slides = banners.map((banner) => (
        <div className="relative h-full w-full" key={banner.id}>
            <Image
                fill
                unoptimized
                sizes="(max-width: 767px) 0px, 50vw"
                src={banner.image_url
                    ? `https://app.xpacy.com/src/upload/homepage_slider/${banner.image_url}`
                    : "/carousel-photo01.png"}
                alt="Xpacy Hero"
                className="object-cover"
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0f1c27]/85 via-[#1f3a52]/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 px-8 pb-16 text-white sm:px-10">
                <span className="w-max rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.18em] backdrop-blur-sm">
                    Xpacy
                </span>
                <p className="max-w-md font-sans text-[28px] font-semibold leading-[1.15] tracking-[-0.4px] sm:text-[34px]">
                    {banner.title}
                </p>
                <p className="max-w-sm font-mono text-[13.5px] leading-relaxed text-white/80">
                    Find, book and manage properties in one calm, considered workspace.
                </p>
            </div>
        </div>
    ));

    return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-side">
            <Carousel slides={slides} indicators={true} indicatorTone="light" />
        </div>
    );
}
