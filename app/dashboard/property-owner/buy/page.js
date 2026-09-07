import AppHeader from "@/app/_components/AppHeader";
import Footer from "@/app/_components/Footer";
import PropertyHeader from "@/app/_components/PropertyHeader";
import PropertyLayout from "@/app/_components/PropertyLayout";
export default async function Page({searchParams}) {
  let search = await searchParams;
  search = {
    purpose: "buy",
    ...search
  }
  
  return (
    <>
      <AppHeader/>
      <main className="flex flex-col gap-6 mt-6 px-[7%] mb-[72px]">
        <PropertyHeader/>
        <PropertyLayout search={search}/>
      </main>
      <Footer/>
    </>
  )
}

