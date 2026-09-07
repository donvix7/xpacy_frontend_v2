"use client";
import Footer from "@/app/_components/Footer"
import Logo from "./_components/Logo";
import Link from "next/link";
export default function Error({ error, reset }) {
  return (
    <>
      <header className="flex items-center justify-between px-[7%] py-6 sticky top-0 z-50 bg-white border-b border-gray-200 shadow-lg ">
        <Logo />
        <>
          <nav>
            <ul className="hidden md:flex md:space-x-6 ">
              <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md`}>
                <Link href={"/"}>Home</Link>
              </li>
              <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md`}>
                <Link href={"/shortlet"}>Shortlet</Link>
              </li>
              <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md`}>
                <Link href={"/rent"}>Rent</Link>
              </li>
              <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md`}>
                <Link href={"/buy"}>Buy</Link>
              </li>
              <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md`}>
                <Link href={"/management"}>Management</Link>
              </li>
              <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md`}>
                <Link href={"/contact"}>Contact </Link>
              </li>
            </ul>
          </nav>
          <div className=" hidden md:flex items-center space-x-5">
            <Link
              href="/auth/log-in"
              className={`bg-white text-primary border border-primary cursor-pointer  px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md`}
            >
              Log in
            </Link>
            <Link
              href="/auth/sign-up"
              className={`bg-primary text-white border border-primary cursor-pointer  px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md`}
            >
              Sign up
            </Link>
          </div>
        </>
      </header >
      <main className="flex justify-center items-center flex-col gap-6 my-10">
        <h1 className="text-3xl font-semibold">Something went wrong!</h1>
        <p className="text-lg font-mono">{error.message}</p>

        <button
          className="inline-block cursor-pointer bg-primary rounded-lg text-white px-6 py-3 text-lg font-mono"
          onClick={reset}
        >
          Try again
        </button>
      </main>
      <Footer />
    </>
  );
}
