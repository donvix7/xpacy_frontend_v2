import Image from "next/image";
import Link from "next/link";

import applestoreIcon from "@/public/apple-store.svg";
import image1 from "@/public/image1.png";
import image2 from "@/public/image2.png";
import image3 from "@/public/image3.png";
import image4 from "@/public/listproperty-image.png";
import image5 from "@/public/mobile-img.png";
import playstoreIcon from "@/public/play-store.svg";

import AppHeader from "./_components/AppHeader";
import BlogCard from "./_components/BlogCard";
import FaqSection from "./_components/FaqSection";
import FeaturedSection from "./_components/FeaturedSection";
import Filter from "./_components/Filter";
import Footer from "./_components/Footer";
import HomeCarousel from "./_components/HomeCarousel";
import SectionLayout from "./_components/SectionLayout";
import ServicesSection from "./_components/ServicesSection";
import TestimonySection from "./_components/TestimonySection";
import { getBlogs } from "./_lib/data-services";

export default async function Home() {
  const blogs = await getBlogs();

  return (
    <>
      <AppHeader />
      <HomeCarousel />
      <section className="px-6 py-6 md:py-0 md:px-[7%] md:-mt-40 z-40 flex items-center justify-center">
        <Filter />
      </section>
      <FeaturedSection />
      <SectionLayout
        heading={"Our Services"}
        subheading={"Tailored Property Services to Meet Your Unique Needs"}
      >
        <ServicesSection />
      </SectionLayout>
      <SectionLayout
        heading={"What Our Clients Are Saying"}
        subheading={
          "Hear firsthand from our customers who have experienced exceptional service with us"
        }
      >
        <TestimonySection />
      </SectionLayout>
      <SectionLayout
        heading={"Frequently asked questions"}
        subheading={"Everything you need to know about the Xpacy."}
        bgColor={true}
      >
        <div className="space-y-16">
          <FaqSection />
          <section className="flex flex-col p-8 gap-6 bg-primary rounded-lg">
            <div className="flex items-center justify-center">
              <div className="flex -space-x-2">
                <Image src={image1} alt="" className="rounded-full w-12 h-12" />
                <Image
                  src={image2}
                  alt=""
                  className="rounded-full w-12 h-12 -translate-y-2"
                />
                <Image src={image3} alt="" className="rounded-full w-12 h-12" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-white md:text-xl text-lg">Still have questions?</h3>
              <p className="font-mono text-white md:text-base text-sm">
                Can’t find the answer you’re looking for? Please chat to our
                friendly team.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Link
                href="/contact"
                className="p-4 bg-secondary-500 text-black text-base font-mono rounded-lg font-bold "
              >
                Get In Touch
              </Link>
            </div>
          </section>
        </div>
      </SectionLayout>

      <div className="md:py-[120px] md:px-[7%] flex md:space-x-22 flex-col md:flex-row gap-8 md:gap-0">
        <div className="md:w-[612px] w-full h-[459px] relative grow shrink-0 ">
          <Image src={image4} fill alt="" className="object-cover md:rounded-lg" />
        </div>
        <div className=" flex flex-col items-center justify-center text-center gap-8 px-6 pb-12 md:pb-0 md:px-0 ">
          <h2 className="font-bold md:text-4xl text-[28px]">Want To List Your Property?</h2>
          <p className="text-base font-mono ">
            At Xpacy, we manage your property listings from start to finish,
            ensuring you enjoy peace of mind while maximizing your returns.
          </p>
          <div className="flex items-center justify-center">
            <Link
              href="/contact"
              className="bg-primary text-white text-base p-4 font-mono rounded-lg"
            >
              List My Property
            </Link>
          </div>
        </div>
      </div>
      <div className="md:py-[120px] md:px-[7%] ">
        <div className="bg-primary md:px-[120px] md:py-12 px-6 py-12">
          <div className="flex items-center flex-col md:flex-row">
            <div className="flex flex-col items-center justify-center space-y-8 text-white text-center px-6 md:px-0">
              <h2 className="font-bold md:text-4xl text-[28px]">
                Take Xpacy with You Anywhere!
              </h2>
              <p className="font-mono md:text-base text-sm">
                Download our mobile app and enjoy seamless property management
                on the go.
              </p>
              <div className="flex space-x-2">
                <Link
                  href={"#"}
                  className="flex md:pl-2 pr-2.5 py-1.5 bg-white border border-black rounded-lg space-x-1.5 items-center"
                >
                  <div className="relative shrink-0 w-10 h-11">
                    <Image
                      src={playstoreIcon}
                      alt="play store icon"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col ">
                    <span className="text-[10px] md:text-sm font-light uppercase text-black font-mono">
                      Get It on
                    </span>
                    <span className="text-xs md:text-md font-bold  text-black font-mono">
                      Google Play
                    </span>
                  </div>
                </Link>
                <Link
                  href={"#"}
                  className="flex pl-2 pr-2.5 py-1.5 bg-white border border-black rounded-lg space-x-1.5 items-center"
                >
                  <div className="relative shrink-0 w-[40px] h-[44px]">
                    <Image
                      src={applestoreIcon}
                      alt="play store icon"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col ">
                    <span className="text-[10px] md:text-sm font-semibold text-black font-mono">
                      Download on the
                    </span>
                    <span className="text-xs md:text-md font-bold  text-black font-mono">
                      App Store
                    </span>
                  </div>
                </Link>
              </div>
            </div>
            <div className="relative w-[329px] h-[637px] shrink-0 -order-1">
              <Image src={image5} alt="" fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
      <SectionLayout
        heading={"Xpacy Insights"}
        subheading={
          "Expert Advice, Tips, and Trends to Make the Most of Your Property Journey"
        }
      >
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {blogs?.slice(0, 3).map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </SectionLayout>
      <Footer />
    </>
  );
}
