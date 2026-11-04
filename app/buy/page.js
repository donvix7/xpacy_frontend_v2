import AppHeader from "../_components/AppHeader";
import Footer from "../_components/Footer";
import PropertyHeader from "../_components/PropertyHeader";
import PropertyLayout from "../_components/PropertyLayout";
import { notFound } from "next/navigation";
import { isValidOrganizationId } from "../_lib/public-navigation";
import { getPublicOrganizationById } from "../_lib/data-services";
export default async function Page({searchParams}) {
  let search = await searchParams;
  if (!isValidOrganizationId(search?.organizationId)) notFound();
  const organization = await getPublicOrganizationById(search.organizationId);
  if (!organization) notFound();
    search = {
      ...search,
      purpose: "buy"
    }
  
  return (
    <>
      <AppHeader/>
      <main className="flex flex-col gap-6 mt-6 px-[7%] mb-[72px]">
        <PropertyHeader organization={organization}/>
        <PropertyLayout search={search}/>
      </main>
      <Footer/>
    </>
  )
}

