import Link from "next/link";
import Image from "next/image";
import AppHeader from "./_components/AppHeader";
import Footer from "./_components/Footer";
import PMHeroSection from "./_components/PMHeroSection";
import PMLifecycleSection from "./_components/PMLifecycleSection";
import BuiltForPropertyManagers from "./_components/BuiltForPropertyManagers";
import PMBottomCta from "./_components/PMBottomCta";
import ServicesSection from "./_components/ServicesSection";
import FaqSection from "./_components/FaqSection";
import SectionLayout from "./_components/SectionLayout";
import BlogCard from "./_components/BlogCard";
import { getBlogs, getBanners } from "./_lib/data-services";

import image1 from "@/public/image1.png";
import image2 from "@/public/image2.png";
import image3 from "@/public/image3.png";
import image4 from "@/public/listproperty-image.png";
import HomeCarousel from "./_components/HomeCarousel";

export default async function Home() {
  const [blogsResult, bannersResult] = await Promise.allSettled([
    getBlogs(),
    getBanners(),
  ]);

  const blogs =
    blogsResult.status === "fulfilled" && Array.isArray(blogsResult.value)
      ? blogsResult.value
      : [];

  const banners =
    bannersResult.status === "fulfilled" && Array.isArray(bannersResult.value)
      ? bannersResult.value
      : [];

  return (
    <>
      <AppHeader />
      <main>
        {/* Reference Hero Section: Dynamic Changing Background + PM value proposition + Demo Booking Form */}
        <PMHeroSection banners={banners} />

        {/* The Complete PM Lifecycle: Prospect -> Lease -> Manage -> Renew */}
        <PMLifecycleSection />

        {/* Built for Property Managers: 6 Core Capabilities */}
        <BuiltForPropertyManagers />

        {/* Our Services Section (Retained) */}
        <SectionLayout
          heading={"Our Services"}
          subheading={"Tailored Property Services to Meet Your Unique Needs"}
        >
          <ServicesSection />
        </SectionLayout>

        {/* Want To List Your Property Section (Retained & Polished) */}
        <div className="py-16 md:py-24 px-6 md:px-[7%] max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="md:w-1/2 w-full h-[360px] sm:h-[420px] md:h-[460px] relative shrink-0 rounded-2xl overflow-hidden shadow-xl border border-primary-100">
              <Image
                src={image4}
                fill
                alt="Want to list your property with Xpacy"
                className="object-cover"
              />
            </div>
            <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left justify-center space-y-6">
            
              <h2 className="font-bold font-sans text-primary md:text-4xl text-3xl leading-tight tracking-tight">
                Want To List Your Property?
              </h2>
              <p className="text-base font-mono text-gray-600 leading-relaxed max-w-lg">
                At Xpacy, we manage your property listings from start to finish,
                ensuring you enjoy peace of mind while maximizing your returns.
              </p>
              <div>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-primary hover:bg-primary-900 text-white text-base py-3.5 px-8 font-sans font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  List My Property
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action Section */}
        <PMBottomCta />

        {/* Frequently Asked Questions */}
        <SectionLayout
          heading={"Frequently asked questions"}
          subheading={"Everything you need to know about the Xpacy platform."}
          bgColor={true}
        >
          <div className="space-y-16">
            <FaqSection />
            <section className="flex flex-col p-8 gap-6 bg-primary rounded-2xl shadow-md">
              <div className="flex items-center justify-center">
                <div className="flex -space-x-2">
                  <Image src={image1} alt="" className="rounded-full w-12 h-12 border-2 border-white" />
                  <Image
                    src={image2}
                    alt=""
                    className="rounded-full w-12 h-12 -translate-y-2 border-2 border-white"
                  />
                  <Image src={image3} alt="" className="rounded-full w-12 h-12 border-2 border-white" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-white md:text-xl text-lg font-bold font-sans">
                  Still have questions?
                </p>
                <p className="font-mono text-white/90 md:text-base text-sm max-w-md mx-auto">
                  Can’t find the answer you’re looking for? Speak directly to our leasing and property management team.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-secondary hover:bg-secondary-500 text-primary-900 text-base font-mono rounded-xl font-bold transition-colors shadow-sm"
                >
                  Get In Touch
                </Link>
              </div>
            </section>
          </div>
        </SectionLayout>

        {/* Xpacy Insights / Blog Section */}
        {blogs && blogs.length > 0 && (
          <SectionLayout
            heading={"Xpacy Insights"}
            subheading={
              "Expert Advice, Tips, and Trends to Make the Most of Your Property Journey"
            }
          >
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              {blogs.slice(0, 3).map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </SectionLayout>
        )}
      </main>
      <Footer />
    </>
  );
}
