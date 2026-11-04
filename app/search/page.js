import AppHeader from "../_components/AppHeader";
import Footer from "../_components/Footer";
import PropertyHeader from "../_components/PropertyHeader";
import PropertyLayout from "../_components/PropertyLayout";
import { getProperties } from "../_lib/data-services";
import { filterPropertiesByOrganization, getPublicOrganizationById } from "../_lib/data-services";
export default async function Page({searchParams}) {
  let search = await searchParams;
  const [data, organization] = await Promise.all([
    getProperties(search),
    search?.organizationId ? getPublicOrganizationById(search.organizationId) : null,
  ]);
  if (search?.organizationId) data[0] = filterPropertiesByOrganization(data[0], search.organizationId);

  return (
    <>
      <AppHeader  />
      <main className="flex flex-col gap-6 mt-6 px-[7%] mb-[72px]">
        <PropertyHeader pagination={data?.at(1)} organization={organization} />
        <PropertyLayout search={search}/>
      </main>
      <Footer/>
    </>
  )
}
