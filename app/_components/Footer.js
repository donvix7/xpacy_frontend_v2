import Link from "next/link";
import { FaFacebook } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import { FaTiktok } from "react-icons/fa6";
import SubscribeForm from "./SubscribeForm";
export default function Footer() {
  return (
    <footer className="flex flex-col gap-8 bg-primary-900 px-5 py-12 sm:px-6 md:px-[7%] md:pb-6 md:pt-[120px] md:py-0">
      <div className="grid grid-cols-2 gap-y-10 md:flex md:justify-between md:gap-y-0">
        <div className="col-span-full flex w-full max-w-[338px] flex-col gap-6 sm:gap-8">
          <div className="w-full max-w-[294px] space-y-2">
            <img
              src={"/xpacy-footer-logo.png"}
              alt="xpacy logo"
              className="w-full max-w-[294px]"
            />
            <p className="text-white text-md">
              Experience Ease,
              <br /> Find Your Dream Property
            </p>
          </div>
          <div className="flex flex-col gap-2 font-mono text-[15px] text-white sm:text-base">
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
        <div className="flex w-full flex-col gap-3 md:w-[130px] md:gap-4">
          <p className="font-normal text-lg text-white uppercase">Company</p>
          <div className=" flex flex-col space-y-4 font-mono text-base font-bold text-white sm:space-y-6">
            <Link href={"#"}>Home</Link>
            <Link href={"#"}>Buy</Link>
            <Link href={"#"}>Rent</Link>
            <Link href={"#"}>Management</Link>
            <Link href={"#"}>Contact</Link>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-[152px] md:gap-4">
          <p className="font-normal text-lg text-white uppercase">Help</p>
          <div className=" flex flex-col space-y-4 font-mono text-base font-bold text-white sm:space-y-6">
            <Link href={"#"}>Company Support</Link>
            <Link href={"#"}>Terms & Conditions</Link>
            <Link href={"#"}>Privacy Policy</Link>
          </div>
        </div>
        <div className="col-span-full flex w-full flex-col gap-4 md:w-[302px]">
          <p className="font-normal text-lg text-white uppercase">Newsletter</p>
          
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
