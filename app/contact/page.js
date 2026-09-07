import { MdKeyboardArrowRight } from "react-icons/md";
import AppHeader from "../_components/AppHeader";
import Footer from "../_components/Footer";
import Link from "next/link";
import Image from "next/image";
import ContactForm from "../_components/ContactForm";
import { cookies } from "next/headers";
import { getUserProfile } from "../_lib/data-services";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const user = await getUserProfile(token)
  return (
    <>
      <AppHeader />
      <div className="px-[7%] flex flex-col gap-12 pt-6 ">
        <div className="flex items-center space-x-2 font-mono text-black text-base">
          <Link href={"/"}>Home</Link>
          <span className="text-md"><MdKeyboardArrowRight /></span>
          <span className={"text-blue-400 capitalize"}>Contact</span>
        </div>
        <h1 className="lg:text-4xl text-2xl font-bold ">Contact Us</h1>
      </div>
      <main className="lg:pl-[7%] px-6 lg:px-0 grid lg:grid-cols-2 grid-cols-1">
        <div className=" py-12 lg:w-[530px] w-full flex flex-col gap-12">
          <div className="space-y-4">
            <p className="lg:text-3xl text-lg font-bold text-primary">We would love to hear from you!</p>
            <p className="font-mono">Have a question or need assistance? Fill out the form below, and we'll get back to you shortly.</p>
          </div>
          <ContactForm user={user} />
        </div>
        {/* Right Side Image */}
        <div className="relative h-[920px] hidden lg:flex">
          <Image src={"/contact-us.png"} fill className="object-cover" alt="contact-us" />
        </div>
      </main>
      <Footer />
    </>
  )
}
