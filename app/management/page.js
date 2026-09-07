import Link from "next/link";
import AppHeader from "../_components/AppHeader";
import FacilityManagementService from "../_components/FacilityManagementService";
import Footer from "../_components/Footer";
import ManagementBanner from "../_components/ManagementBanner";
import MangementHowItWorks from "../_components/MangementHowItWorks";
import SectionLayout from "../_components/SectionLayout";
import TestimonySection from "../_components/TestimonySection";
import Image from "next/image";
import image1 from "@/public/Ellipse1.svg";
import image2 from "@/public/Ellipse2.svg";
import image3 from "@/public/Ellipse3.svg";
export default function Page() {
  return (
    <>
      <AppHeader />
      <ManagementBanner />
      <main className="lg:px-[7%] px-6 py-12 lg:py-0 flex flex-col">
        <MangementHowItWorks />
        <FacilityManagementService />
      </main>
      <SectionLayout
        bgColor={true}
        heading={"What Our Clients Are Saying"}
        subheading={
          "Hear firsthand from our customers who have experienced exceptional service with us"
        }
      >
        <TestimonySection />
      </SectionLayout>
      <section className="lg:px-[7%] pb-18 ">
        <div className=" flex flex-col p-8 gap-6 bg-primary lg:rounded-2xl">
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
            <h3 className="text-white md:text-xl text-lg">Your Property Is In Safe Hands With Us!</h3>
            <p className="font-mono text-white lg:text-base text-sm">
              Ready to experience ease with our facility management services?
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Link
              href="/contact"
              className="p-4 bg-secondary-500 text-black text-base font-mono rounded-lg font-bold "
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
