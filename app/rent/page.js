import AppHeader from "../_components/AppHeader";
import Footer from "../_components/Footer";
import PropertyHeader from "../_components/PropertyHeader";
import PropertyLayout from "../_components/PropertyLayout";
export default async function Page({ searchParams }) {
  let search = await searchParams;
  search = {
    purpose: "rent",
    ...search
  }

  return (
    <>
      <AppHeader />
      <main className="flex flex-col gap-6 mt-6 px-[7%] mb-[72px]">
        <PropertyHeader />
        <PropertyLayout search={search} />
      </main>
      <Footer />
    </>
  )
}

