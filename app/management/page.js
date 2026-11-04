import Link from "next/link";
import AppHeader from "../_components/AppHeader";
import FacilityManagementService from "../_components/FacilityManagementService";
import Footer from "../_components/Footer";
import ManagementBanner from "../_components/ManagementBanner";
import MangementHowItWorks from "../_components/MangementHowItWorks";
import SectionLayout from "../_components/SectionLayout";
import TestimonySection from "../_components/TestimonySection";
import Image from "next/image";
import { isValidOrganizationId } from "@/app/_lib/public-navigation";
import { notFound } from "next/navigation";
import { filterPropertiesByOrganization, getProperties, getPublicOrganizationById } from "../_lib/data-services";
import image1 from "@/public/Ellipse1.svg";
import image2 from "@/public/Ellipse2.svg";
import image3 from "@/public/Ellipse3.svg";
export default async function Page({ searchParams }) {
  const params = await searchParams;
  if (!isValidOrganizationId(params?.organizationId)) notFound();
  const [organization, propertyResult] = await Promise.all([
    getPublicOrganizationById(params.organizationId),
    getProperties({ organizationId: params.organizationId, limit: 20 }),
  ]);
  if (!organization) notFound();
  const properties = filterPropertiesByOrganization(propertyResult?.[0], params.organizationId);
  const organizationQuery = `organizationId=${encodeURIComponent(params.organizationId)}`;
  return (
    <>
      <AppHeader />
      <ManagementBanner organization={organization} organizationId={params.organizationId} />
      <main className="lg:px-[7%] px-6 py-12 lg:py-0 flex flex-col">
        <section className="mb-12 rounded-2xl border border-primary-100 bg-primary-50 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">{organization.name} property management</h1>
          <p className="mt-2 text-gray-700">Management information and properties for {organization.name}{[organization.city, organization.state].filter(Boolean).length ? ` in ${[organization.city, organization.state].filter(Boolean).join(", ")}` : ""}.</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
            {organization.email && <a className="text-primary underline" href={`mailto:${organization.email}`}>{organization.email}</a>}
            {organization.phone && <a className="text-primary underline" href={`tel:${organization.phone}`}>{organization.phone}</a>}
            {[organization.address, organization.city, organization.state, organization.country].filter(Boolean).length > 0 && <span>{[organization.address, organization.city, organization.state, organization.country].filter(Boolean).join(", ")}</span>}
          </div>
          <p className="mt-4 text-sm font-semibold text-gray-800">{properties.length} {properties.length === 1 ? "property" : "properties"} managed by this organization</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
            <Link className="text-primary underline" href={`/listings?${organizationQuery}`}>Browse listings</Link>
            <Link className="text-primary underline" href={`/contact?${organizationQuery}`}>Contact {organization.name}</Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property, index) => {
              const slug = property.property_slug || property.slug;
              const kind = String(property.property_status || property.purpose || "property").toLowerCase();
              return (
                <Link key={property.id || property._id || index} href={slug ? `/${kind}/${slug}?${organizationQuery}` : `/listings?${organizationQuery}`} className="rounded-xl border border-primary-100 bg-white p-4 hover:border-primary">
                  <p className="font-semibold text-gray-900">{property.property_name || property.name || "Organization property"}</p>
                  <p className="mt-1 text-sm text-gray-600">{[property.address, property.city, property.state].filter(Boolean).join(", ") || "Location unavailable"}</p>
                </Link>
              );
            })}
          </div>
        </section>
        <MangementHowItWorks />
        <FacilityManagementService organizationId={params.organizationId} />
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
            <p className="text-white md:text-xl text-lg">Your Property Is In Safe Hands With Us!</p>
            <p className="font-mono text-white lg:text-base text-sm">
              Ready to experience ease with our facility management services?
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Link
              href={`/contact?${organizationQuery}`}
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
