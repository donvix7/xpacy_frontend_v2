import Image from "next/image";
import Link from "next/link";

const ManagementBanner = () => {
    return (
        <div className="w-full h-[615px] relative">
            <Image src={"/management_banner.jpg"} fill alt="banner" className="object-cover" />
            <div className="absolute bg-black opacity-70 top-0 left-0 right-0 bottom-0"></div>
            <div className="flex flex-col gap-8 lg:w-[718px] z-10 absolute lg:left-[7%] left-6 right-6 lg:right-0 lg:top-[197px] top-[165px]  ">
                <h1 className="lg:text-4xl text-2xl  font-bold text-white ">Comprehensive Facility Management For Your Property</h1>
                <p className="lg:text-lg text-base text-white font-mono lg:font-sans">Book Trusted Maintenance Services Today!</p>
                <div><Link href={"/book-service"} className="text-white bg-primary rounded-lg p-4 font-mono">Book A Service</Link></div>
            </div>
        </div>
    );
};

export default ManagementBanner;