"use client"
import { FaBarsStaggered } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
import NavMenu from "./NavMenu";
import Link from "next/link";
import ReferralSidebarNav from "./ReferralSidebarNav";
import SidebarLogo from "./SidebarLogo";
import SidebarNav from "./SidebarNav";
import { useCloseModal } from "../_hooks/useCloseModal";


export default function MobileNav({ children, isSidebar = false, role = "user" }) {

    return (
        <NavMenu>
            <NavMenu.Open>
                <MobileNavBtns />
            </NavMenu.Open>
            <NavMenu.Window isSidebar={isSidebar}>
                {
                    isSidebar ?
                        (
                            <MobileSideBarWindow role={role} />
                        ) :
                        (
                            <MainAppWindow>
                                {children}
                            </MainAppWindow>
                        )
                }

            </NavMenu.Window>
        </NavMenu>
    )
}

const MobileNavBtns = ({ isOpen, open }) => {
    return (

        <>
            {isOpen ? (
                <button onClick={open} className="text-2xl lg:hidden"><IoCloseSharp /></button>
            ) : (
                <button onClick={open} className="text-2xl lg:hidden"><FaBarsStaggered /></button>
            )
            }
            
        </>
    )
}


const MainAppWindow = ({ children }) => {
    return (
        <ul className="border border-primary-200 rounded-lg font-mono lg:hidden">
            <li className="py-2 border-b border-primary-100">
                <Link href={"/"}>Home</Link>
            </li>
            <li className="py-2 border-b border-primary-100">
                <Link href={"/shortlet"}>Shortlet</Link>
            </li>
            <li className="py-2 border-b border-primary-100">
                <Link href={"/rent"}>Rent</Link>
            </li>
            <li className="py-2 border-b border-primary-100">
                <Link href={"/buy"}>Buy</Link>
            </li>
            <li className="py-2 border-b border-primary-100">
                <Link href={"/blogs"}>Blogs</Link>
            </li>
            <li className="py-2 border-b border-primary-100">
                <Link href={"/management"}>Management</Link>
            </li>
            <li className="py-2 border-b border-primary-100">
                <Link href={"/contact"}>Contact </Link>
            </li>
            {children}
        </ul>
    )
}


const MobileSideBarWindow = ({ role }) => {
    return (
        <div className="max-h-max  bg-primary-900 flex flex-col py-8 px-6 w-max items-start gap-8 overflow-y-auto lg:hidden">
            <SidebarNav role={role} />
        </div>
    )
}