import AppHeader from "../_components/AppHeader";
import Footer from "../_components/Footer";
import PropertyHeader from "../_components/PropertyHeader";
import PropertyLayout from "../_components/PropertyLayout";

export const metadata = {
      title: "Shortlets ",
      description: "Find and book available shortlets with ease",
}

export default async function Page({searchParams}) {
  let search = await searchParams;
    search = {
      purpose: "shortlet",
      ...search
    }
  
  return (
    <>
      <AppHeader />
      <main className="flex flex-col gap-8 md:gap-6 mt-6 px-6 md:px-[7%] mb-[72px]">
        <PropertyHeader />
        <PropertyLayout search={search} />
      </main>
      <Footer />
    </>
  )
}

