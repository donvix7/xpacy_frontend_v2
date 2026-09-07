"use client"
import Image from "next/image";
import Link from "next/link";
import { FiBell } from "react-icons/fi";
import { MdKeyboardArrowDown, MdOutlineDashboardCustomize } from "react-icons/md";
import { RiUserSettingsLine } from "react-icons/ri";
import { TbLogout2 } from "react-icons/tb";
import { handleLogOut } from "../_lib/action";
import FilterMenu from "./FilterMenu";
import { usePathname } from "next/navigation";


export default function MobileProfileMenu({ profile, role="user" }) {
    const pathname = usePathname();
    const profileSettingsHref = pathname?.includes("/dashboard/property-owner")
        ? "/dashboard/property-owner/profile-settings"
        : "/dashboard/user/profile-settings";

    return (
        <FilterMenu>
            <FilterMenu.Open>
                <button className="group flex items-center gap-1.5 lg:hidden">
                    <span className="text-2xl relative">
                        <span className="text-2xl" ><FiBell /></span>
                        <span className="absolute text-xs -top-2 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center bg-red-600 text-black font-mono">5</span>
                    </span>
                    <div className=" cursor-pointer flex items-center border border-primary-200 rounded-lg bg-white justify-center py-1 px-3">
                        <div className="w-8 h-8 p-1 relative">
                            <Image unoptimized src={profile?.display_picture ? `https://app.xpacy.com/src/upload/display_img/${profile?.display_picture}` : "/avatar.png"} alt="avatar" fill className="rounded-full" />
                        </div>
                        <span className="text-2xl text-primary-200 p-2 group-hover:rotate-180"><MdKeyboardArrowDown /></span>
                    </div>
                </button>
            </FilterMenu.Open>
            <FilterMenu.Window right={"-left-8"}>
                <div className="w-max flex flex-col gap-2 border border-primary-200 rounded-lg p-4 absolute bg-white z-40 ">
                    {/* Notifications */}
                    <Link href={role.toLowerCase() === "admin" ? "/dashboard/admin" : role.toLowerCase() === "property-owner" ? "/dashboard/property-owner" : "/dashboard/user"} className="p-1  flex items-center gap-2 text-gray-500 font-mono hover:text-gray-800 ">
                        <span className="text-lg"><MdOutlineDashboardCustomize /></span>
                        <span>Dashboard</span>
                    </Link>
                    <div className="border border-primary-200"></div>
                    {/* Profile settings */}
                    <Link href={profileSettingsHref} className="p-1  flex items-center gap-4 text-gray-500 font-mono hover:text-gray-800 ">

                        <span className="text-lg"><RiUserSettingsLine /></span>
                        <span>Profile settings</span>
                    </Link>
                    <div className="border border-primary-200"></div>
                    {/* Log out */}
                    <form action={handleLogOut}>
                        <button className="p-1 cursor-pointer  flex items-center gap-4 text-gray-500 font-mono hover:text-gray-800 ">
                            <span className="text-lg"><TbLogout2 /></span>
                            <span>Log out</span>
                        </button>
                    </form>
                </div>
            </FilterMenu.Window>
        </FilterMenu>
    )
}