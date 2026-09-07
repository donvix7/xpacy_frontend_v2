"use client"
import {useTransition} from 'react';
import Link from "next/link"
import {usePathname} from "next/navigation";
import { FaLinkedinIn, FaFacebookF } from "react-icons/fa";
import { FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { FaRegCopy } from "react-icons/fa";
import {toast} from "react-hot-toast"
function ShareBtnCard({onClose}) {
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const handleCopy = () => {
        startTransition(async () => {
            try{
                await navigator.clipboard.writeText(`https://xpacy.com${pathname}`)
                toast.success("Copied!")
                onClose()
            } catch (err) {
                toast.error(err.message)
            }
            
        })
    }
    return (
        <div className="md:w-[400px] w-[250px] flex flex-col gap-4 font-mono my-2 mx-3">
            <h3 className="font-sans text-md ">Share </h3>
            <div className="flex items-center justify-between ">
                <Link href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pathname)}`} target="_blank" rel="noopener noreferrer" className="bg-[#0d6efd] text-white text-4xl flex items-center justify-center w-[60px] h-[60px] rounded-full">
                    <FaFacebookF/>
                </Link>
                <Link href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this property on Xpacy: https://xpacy.com${pathname}`)}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white text-4xl flex items-center justify-center w-[60px] h-[60px] rounded-full">
                    <FaWhatsapp />
                </Link>
                <Link href={`https://twitter.com/intent/tweet?url=${pathname}&text=Checkout%20this%20on%20property%20on%20Xpacy.com`} target="_blank" rel="noopener noreferrer" className="bg-[#657786] text-white text-4xl flex items-center justify-center w-[60px] h-[60px] rounded-full">
                    <FaXTwitter />
                </Link>
            </div>
            <div className="w-full h-[40px] flex items-center justify-between p-2  border rounded-lg  border-primary-200 "> 
                <p className="clip-text text-base truncate">{`https://xpacy.com/${pathname}`}</p>
                <button className="flex items-center cursor-pointer bg-primary rounded-lg px-1.5 py-1 text-white gap-2 ml-2 disabled:cursor-not-allowed" disabled={isPending} onClick={handleCopy}> <span><FaRegCopy/></span> Copy</button>
            </div>
        </div>
    )
}

export default ShareBtnCard
