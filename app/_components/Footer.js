import Link from "next/link";
import { FaFacebook } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import { FaTiktok } from "react-icons/fa6";
import SubscribeForm from "./SubscribeForm";
export default function Footer() {
  return (
    <footer className="px-6 py-12 md:px-[7%] md:pt-[120px] md:pb-6 md:py-0 flex flex-col gap-8 bg-primary-900">
      <div className="md:flex md:justify-between md:gap-y-0 grid grid-cols-2 gap-y-16 ">
        <div className="flex flex-col gap-8 w-[338px] col-span-full ">
          <div className="space-y-2 w-[294px]">
            <img
              src={"/xpacy-footer-logo.png"}
              alt="xpacy logo"
              className="w-[294px]"
            />
            <h5 className="text-white text-md">
              Experience Ease,
              <br /> Find Your Dream Property
            </h5>
          </div>
          <div className="flex flex-col gap-2 font-mono text-base text-white">
            <p>
              <span className="font-bold">Address:</span> No. 1 Joe Akonobi
              Street, Ojodu Berger.
            </p>
            <p>
              <span className="font-bold">Email:</span> info@xpacy.com
            </p>
            <p>
              <span className="font-bold">Phone:</span> 09068557780
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href={"#"} className="text-white text-2xl">
              <FaFacebook />
            </Link>
            <Link href={"#"} className="text-white text-2xl">
              <FaXTwitter />
            </Link>
            <Link href={"#"} className="text-white text-2xl">
              <FaInstagram />
            </Link>
            <Link href={"#"} className="text-white text-2xl">
              <FaTiktok />
            </Link>
          </div>
        </div>
        <div className="flex flex-col w-[130px] gap-4">
          <h5 className="font-normal text-lg text-white uppercase">Company</h5>
          <div className=" flex flex-col space-y-6 font-mono text-base font-bold text-white">
            <Link href={"#"}>Home</Link>
            <Link href={"#"}>Buy</Link>
            <Link href={"#"}>Rent</Link>
            <Link href={"#"}>Management</Link>
            <Link href={"#"}>Contact</Link>
          </div>
        </div>
        <div className="flex flex-col w-[152px] gap-4">
          <h5 className="font-normal text-lg text-white uppercase">Help</h5>
          <div className=" flex flex-col space-y-6 font-mono text-base font-bold text-white">
            <Link href={"#"}>Company Support</Link>
            <Link href={"#"}>Terms & Conditions</Link>
            <Link href={"#"}>Privacy Policy</Link>
          </div>
        </div>
        <div className="flex flex-col md:w-[302px] w-full gap-4 col-span-full">
          <h5 className="font-normal text-lg text-white uppercase">Newsletter</h5>
          
           <SubscribeForm/>
          
        </div>
      </div>
      <div className="border border-primary-200"></div>
      <p className="text-center text-xs font-mono font-light text-white">
        &copy; Copywright <span>{new Date().getFullYear()}</span>, All Rights
        Reserved by Xpacy
      </p>
    </footer>
  );
}
