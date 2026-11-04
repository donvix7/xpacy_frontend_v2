import { MdKeyboardArrowRight } from "react-icons/md";
import AppHeader from "../_components/AppHeader";
import Footer from "../_components/Footer";
import Link from "next/link";
import Image from "next/image";
import ContactForm from "../_components/ContactForm";
import { cookies } from "next/headers";
import { getUserProfile } from "../_lib/data-services";
import { getPublicOrganizationById } from "../_lib/data-services";
import { notFound } from "next/navigation";
import { isValidOrganizationId } from "../_lib/public-navigation";

export default async function Page({ searchParams }) {
  const params = await searchParams;
  if (!isValidOrganizationId(params?.organizationId)) notFound();
  const organization = await getPublicOrganizationById(params.organizationId);
  if (!organization) notFound();
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
        <p className="lg:text-4xl text-2xl font-bold ">Contact {organization.name || "Us"}</p>
      </div>
      <main className="lg:pl-[7%] px-6 lg:px-0 grid lg:grid-cols-2 grid-cols-1">
        <div className=" py-12 lg:w-[530px] w-full flex flex-col gap-12">
          <div className="space-y-4">
            <p className="lg:text-3xl text-lg font-bold text-primary">Get in touch with {organization.name || "our team"}</p>
            <p className="font-mono">Send a message directly to this organization and its team will get back to you.</p>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            {organization.email && <p>Email: <a className="text-primary underline" href={`mailto:${organization.email}`}>{organization.email}</a></p>}
            {organization.phone && <p>Phone: <a className="text-primary underline" href={`tel:${organization.phone}`}>{organization.phone}</a></p>}
            {[organization.address, organization.city, organization.state, organization.country].filter(Boolean).length > 0 && <p>Address: {[organization.address, organization.city, organization.state, organization.country].filter(Boolean).join(", ")}</p>}
          </div>
          <ContactForm user={user} organization={organization} organizationId={params.organizationId} />
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
