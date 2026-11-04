import Image from "next/image";
import Link from "next/link";

const ManagementBanner = ({ organization, organizationId }) => {
    return (
        <div className="w-full h-[615px] relative">
            <Image src={"/management_banner.jpg"} fill alt="banner" className="object-cover" />
            <div className="absolute bg-black opacity-70 top-0 left-0 right-0 bottom-0"></div>
            <div className="flex flex-col gap-8 lg:w-[718px] z-10 absolute lg:left-[7%] left-6 right-6 lg:right-0 lg:top-[197px] top-[165px]  ">
                <p className="lg:text-4xl text-2xl  font-bold text-white ">Property management by {organization?.name || "Xpacy"}</p>
                <p className="lg:text-lg text-base text-white font-mono lg:font-sans">{organization?.city || organization?.state ? `Trusted property care in ${[organization.city, organization.state].filter(Boolean).join(", ")}.` : `Explore management services from ${organization?.name || "this organization"}.`}</p>
                <div><Link href={`/contact?organizationId=${encodeURIComponent(organizationId || "")}`} className="text-white bg-primary rounded-lg p-4 font-mono">Contact {organization?.name || "the team"}</Link></div>
            </div>
        </div>
    );
};

export default ManagementBanner;
