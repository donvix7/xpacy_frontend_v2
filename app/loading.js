import Image from "next/image";
import Footer from "./_components/Footer";
import Navigation from "./_components/Navigation";
import Link from "next/link";
export default function Loading() {
    return (
        <div className="min-h-screen">
            <header className="flex items-center justify-between px-[7%] py-6 sticky top-0 z-50 bg-white border-b border-gray-700">
                <div >
                    <Image src={"/logo.png"} width={"156"} height={"32"} alt={"Xpacy Logo"} />
                </div>
                <Navigation>
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
                </Navigation>
            </header>
            <div className="spinner"></div>
            <Footer />
        </div>
    )

}