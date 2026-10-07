"use client"
import { FaBarsStaggered } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
import NavMenu from "./NavMenu";
import Link from "next/link";
import ReferralSidebarNav from "./ReferralSidebarNav";
import SidebarLogo from "./SidebarLogo";
import SidebarNav from "./SidebarNav";
import { useCloseModal } from "../_hooks/useCloseModal";
import { usePathname } from "next/navigation";
import { isPublicNavigationLinkActive, publicNavigationLinks } from "@/app/_lib/public-navigation";


export default function MobileNav({ children, isSidebar = false, role = "user" }) {
    const pathname = usePathname();

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
                            <MainAppWindow pathname={pathname}>
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


const MainAppWindow = ({ children, pathname }) => {
    return (
        <ul className="border border-primary-200 rounded-lg font-mono lg:hidden">
            {publicNavigationLinks.map(({ label, href }) => {
                const active = isPublicNavigationLinkActive(pathname, href);
                return (
                    <li key={href} className={`border-b border-primary-100 py-2 ${active ? "font-semibold text-primary" : "text-gray-700"}`}>
                        <Link href={href} aria-current={active ? "page" : undefined} className="block">
                            {label}
                        </Link>
                    </li>
                );
            })}
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
