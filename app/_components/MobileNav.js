"use client"
import { FaBarsStaggered } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
import NavMenu from "./NavMenu";
import Link from "next/link";
import ReferralSidebarNav from "./ReferralSidebarNav";
import SidebarLogo from "./SidebarLogo";
import SidebarNav from "./SidebarNav";
import { useCloseModal } from "../_hooks/useCloseModal";
import { usePathname, useSearchParams } from "next/navigation";
import { getPublicNavigationLinks, isPublicNavigationLinkActive } from "@/app/_lib/public-navigation";


export default function MobileNav({ children, isSidebar = false, role = "user", isOrganizationAdmin = false, isLoggedIn = false }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const links = getPublicNavigationLinks(searchParams.get("organizationId"), isLoggedIn);

    return (
        <NavMenu>
            <NavMenu.Open>
                <MobileNavBtns />
            </NavMenu.Open>
            <NavMenu.Window isSidebar={isSidebar}>
                {
                    isSidebar ?
                        (
                            <MobileSideBarWindow role={role} isOrganizationAdmin={isOrganizationAdmin} />
                        ) :
                        (
                            <MainAppWindow pathname={pathname} links={links}>
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
                <button
                    onClick={open}
                    aria-label="Close menu"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-card text-ink transition-colors hover:bg-soft text-xl lg:hidden"
                >
                    <IoCloseSharp />
                </button>
            ) : (
                <button
                    onClick={open}
                    aria-label="Open menu"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-card text-ink transition-colors hover:bg-soft text-xl lg:hidden"
                >
                    <FaBarsStaggered />
                </button>
            )}
        </>
    );
};

const MainAppWindow = ({ children, pathname, links }) => {
    return (
        <ul className="divide-y divide-line rounded-xl border border-line bg-card font-mono text-ink shadow-sm overflow-hidden lg:hidden">
            {links.map(({ label, href }) => {
                const active = isPublicNavigationLinkActive(pathname, href);
                return (
                    <li key={href} className={active ? "bg-soft font-semibold text-ink" : "text-mute hover:bg-soft hover:text-ink transition-colors"}>
                        <Link href={href} aria-current={active ? "page" : undefined} className="flex min-h-11 items-center justify-center px-4 text-sm font-medium">
                            {label}
                        </Link>
                    </li>
                );
            })}
            {children}
        </ul>
    );
};


const MobileSideBarWindow = ({ role, isOrganizationAdmin }) => {
    return (
        <div className="max-h-max  bg-side flex flex-col py-8 px-6 w-max items-start gap-8 overflow-y-auto lg:hidden">
            <SidebarNav role={role} isOrganizationAdmin={isOrganizationAdmin} />
        </div>
    )
}
