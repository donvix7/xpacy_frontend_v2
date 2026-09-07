import { cookies } from "next/headers";
import AppHeader from "../_components/AppHeader";
import BookServiceForm from "../_components/BookServiceForm";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import { getUserProfile } from "../_lib/data-services";
import Footer from "../_components/Footer";
export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const user = await getUserProfile(token)
  return (
    <>
      <AppHeader />
      <Link href={"/dashboard/user"} className=" px-[7%] pt-6 flex items-center gap-2 text-black cursor-pointer font-mono">
        <span className="text-2xl"><FaArrowLeft /></span>
        <span>Back to dashboard</span>
      </Link>
      <main className=" bg-[#FCFCFC] pb-[120px] flex justify-center items-center ">
        <BookServiceForm user={user} />
      </main>
      <Footer/>
    </>
  );
};
