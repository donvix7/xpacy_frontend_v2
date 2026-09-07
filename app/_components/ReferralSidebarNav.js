import { RiGift2Fill } from "react-icons/ri";
import { FiArrowUpRight } from "react-icons/fi";
import Link from "next/link"
export default function ReferralSidebarNav(){

    return(
        <Link href="referral" className=" p-4 rounded-lg bg-secondary flex flex-col gap-4 font-mono  w-full h-[300px] relative overflow-clip z-10" >
            <div className="flex items-center justify-between">
                <span className="text-[42px] text-black"><RiGift2Fill/></span>
                <span className="text-2xl"><FiArrowUpRight/></span>
            </div>
            <p className="text-lg text-black font-bold">Refer Friends and Earn</p>
            <p className="mt-2">Invite your friends to Xpacy and earn rewards for every successful signup. </p>
            <div className="w-[220px] h-[220px] rounded-full bg-[#B6904E] absolute -bottom-1/2 -right-1/2 -z-10"></div>
        </Link>
    )
}