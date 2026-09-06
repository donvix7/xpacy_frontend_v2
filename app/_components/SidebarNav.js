"use client"
import Link from "next/link";
import {usePathname} from "next/navigation";
import { RxDashboard } from "react-icons/rx";
import { FiBell } from "react-icons/fi";
import { BiBuildingHouse, BiShield } from "react-icons/bi";
import { FaIdCard, FaRegHeart } from "react-icons/fa";
import { IoCardOutline, IoLogInOutline, IoPeopleOutline } from "react-icons/io5";
import { RiUserSettingsLine } from "react-icons/ri";
import { LuBell, LuLayoutDashboard, LuMessageCircleQuestion, LuMessageSquare, LuWrench } from "react-icons/lu";
import { IoCalendarOutline } from "react-icons/io5";
import { RiHome2Line, RiSearchLine, RiSettings3Line, RiPulseLine } from "react-icons/ri";
import { Archive, MessageSquare, Settings, User } from "lucide-react";
import { FaBroom, FaCheck, FaClipboardList, FaHandshake, FaWrench } from "react-icons/fa6";
import { TbBuilding, TbBuildingCommunity, TbFileText, TbHelp, TbReportAnalytics, TbSettings, TbUsers } from "react-icons/tb";
import { HiOutlineClipboardList } from "react-icons/hi";
import { BsTools } from "react-icons/bs";
import { GiPayMoney, GiTakeMyMoney } from "react-icons/gi";
import { MdInventory2, MdOutlineReport } from "react-icons/md";


export default function SidebarNav({ role = "user" }) {
    const userNavList = [
        {
            text: "Go to Homepage",
            link: "/",
            icon: <RiHome2Line />
        },
        {
            text: "Dashboard",
            link: "/dashboard/user",
            icon: <RxDashboard />
        },
        {
            text: "Notifications",
            link: "/dashboard/user/notifications",
            icon: <FiBell />
        },
        {
            text: "My Properties",
            link: "/dashboard/user/my-properties",
            icon: <BiBuildingHouse />
        },
        {
            text: "Saved Properties",
            link: "/dashboard/user/saved-properties",
            icon: <FaRegHeart />
        },
        {
            text: "Booked Services",
            link: "/dashboard/user/booked-services",
            icon: <IoCalendarOutline />
        },
        {
            text: "Payments",
            link: "/dashboard/user/payments",
            icon: <IoCardOutline />
        },
        {
            text: "Profile Settings",
            link: "/dashboard/user/profile-settings",
            icon: <RiUserSettingsLine />
        },
        {
            text: "Help/Support",
            link: "/contact",
            icon: <LuMessageCircleQuestion />
        },
        {
            text: "KYC Verification",
            link: "/dashboard/user/kyc",
            icon: <FaIdCard />
        }
    ];

    const adminNavList = [
        {
            text: "Dashboard",
            link: "/dashboard/admin",
            icon: <RxDashboard />
        },
        {
            text: "Notifications",
            link: "/dashboard/admin/notifications",
            icon: <FiBell />
        },
        {
            text: "Properties",
            link: "/dashboard/admin/properties",
            icon: <BiBuildingHouse />
        },
        {
            text: "Services",
            link: "/dashboard/admin/services",
            icon: <IoCalendarOutline />
        },
        {
            text: "Users",
            link: "/dashboard/admin/users",
            icon: <User />
        },
        {
            text: "Blogs",
            link: "/dashboard/admin/blogs",
            icon: <MessageSquare />
        },
        {
            text: "Bookings",
            link: "/dashboard/admin/bookings",
            icon: <IoCalendarOutline />
        },
        {
            text: "Payments",
            link: "/dashboard/admin/payments",
            icon: <IoCardOutline />
        },
        {
            text: "Reports & Analytics",
            link: "/dashboard/admin/reports-analytics",
            icon: <RiUserSettingsLine />
        },
        {
            text: "Settings",
            link: "/dashboard/admin/settings",
            icon: <Settings />
        },
        {
            text: "FAQs",
            link: "/dashboard/admin/faqs",
            icon: <LuMessageCircleQuestion />
        }
    ];

    const propertyOwnerNavList = [
        {
            text: "Dashboard",
            link: "/dashboard/property-owner",
            icon: <RxDashboard className="w-5 h-5" />,
        },
        {
            text: "Notifications",
            link: "/dashboard/property-owner/notifications",
            icon: <FiBell className="w-5 h-5" />,
        },
        {
            text: "My Properties",
            link: "/dashboard/property-owner/properties",
            icon: <BiBuildingHouse className="w-5 h-5" />,
        },
        {
            text: "Tenants",
            link: "/dashboard/property-owner/tenants",
            icon: <IoPeopleOutline className="w-5 h-5" />,
        },
        {
            text: "Maintenance",
            link: "/dashboard/property-owner/maintenance",
            icon: <FaWrench className="w-5 h-5" />,
        },
        {
            text: "Vendor",
            link: "/dashboard/property-owner/vendor",
            icon: <FaHandshake className="w-5 h-5" />,
        },
        {
            text: "Utilities",
            link: "/dashboard/property-owner/utility-management",
            icon: <TbBuildingCommunity className="w-5 h-5" />,
        },
        {
            text: "Inventory",
            link: "/dashboard/property-owner/inventory",
            icon: <Archive className="w-5 h-5" />,
        },
        {
            text: "Inspections",
            link: "/dashboard/property-owner/inspections",
            icon: <HiOutlineClipboardList className="w-5 h-5" />,
        },
        {
            text: "Services Requests",
            link: "/dashboard/property-owner/services",
            icon: <BsTools className="w-5 h-5" />,
        },
        {
            text: "Bookings",
            link: "/dashboard/property-owner/bookings",
            icon: <IoCalendarOutline className="w-5 h-5" />,
        },
        {
            text: "Rents",
            link: "/dashboard/property-owner/rents",
            icon: <GiTakeMyMoney className="w-5 h-5" />,
        },
        {
            text: "Security",
            link: "/dashboard/property-owner/security",
            icon: <BiShield className="w-5 h-5" />,
        },
        {
            text: "Community Forum",
            link: "/dashboard/property-owner/community-forum",
            icon: <LuMessageSquare className="w-5 h-5" />,
        },
        {
            text: "Payments",
            link: "/dashboard/property-owner/payments",
            icon: <GiPayMoney className="w-5 h-5" />,
        },
        {
            text: "Reports & Analytics",
            link: "/dashboard/property-owner/reports",
            icon: <MdOutlineReport className="w-5 h-5" />,
        },
        {
            text: "Profile Settings",
            link: "/dashboard/property-owner/settings",
            icon: <RiSettings3Line className="w-5 h-5" />,
        },
        {
            text: "Help/Support",
            link: "/contact",
            icon: <LuMessageCircleQuestion className="w-5 h-5" />,
        },
    ];

    const facilityManagerNavList = [
        {
            text: "Dashboard",
            link: "/dashboard/facility-manager",
            icon: <RxDashboard />
        },
        {
            text: "Notifications",
            link: "/dashboard/facility-manager/notifications",
            icon: <FiBell />
        },
        {
            text: "My Properties",
            link: "/dashboard/facility-manager/properties",
            icon: <BiBuildingHouse />
        },
        {
            text: "Inventory",
            link: "/dashboard/facility-manager/inventory",
            icon: <MdInventory2 className="w-5 h-5" />
        },
        {
            text: "Maintenance",
            link: "/dashboard/facility-manager/maintenance",
            icon: <FaWrench className="w-5 h-5" />
        },
        {
            text: "Housekeeping",
            link: "/dashboard/facility-manager/housekeeping",
            icon: <FaBroom className="w-5 h-5" />
        },
        {
            text: "Check-ins",
            link: "/dashboard/facility-manager/check-ins",
            icon: <IoLogInOutline className="w-5 h-5" />
        },
        {
            text: "Vendor",
            link: "/dashboard/facility-manager/vendor",
            icon: <FaHandshake className="w-5 h-5" />
        },
        {
            text: "Bookings",
            link: "/dashboard/facility-manager/bookings",
            icon: <FaCheck />
        },
        {
            text: "Utilities",
            link: "/dashboard/facility-manager/utility-management",
            icon: <BiBuildingHouse />
        },
        {
            text: "Services Requests",
            link: "/dashboard/facility-manager/services",
            icon: <IoCalendarOutline />
        },
        {
            text: "Payments",
            link: "/dashboard/facility-manager/payments",
            icon: <IoCardOutline />
        },
        {
            text: "Reports & Analytics",
            link: "/dashboard/facility-manager/reports",
            icon: <RiUserSettingsLine />
        },
        {
            text: "Community Forum",
            link: "/dashboard/facility-manager/community-forum",
            icon: <LuMessageSquare className="w-5 h-5" />
        },
        {
            text: "Profile Settings",
            link: "/dashboard/facility-manager/settings",
            icon: <RiSettings3Line className='w-5 h-5' />
        },
        {
            text: "Help/Support",
            link: "/contact",
            icon: <LuMessageCircleQuestion />
        }
    ];

    const propertyManagerNavList = [
        {
            text: "Dashboard",
            link: "/dashboard/property-manager",
            icon: <LuLayoutDashboard className="w-5 h-5" /> // Dashboard/layout icon
        },
        {
            text: "Notifications",
            link: "/dashboard/property-manager/notifications",
            icon: <LuBell className="w-5 h-5" /> // Bell for notifications
        },
        {
            text: "My Properties",
            link: "/dashboard/property-manager/properties",
            icon: <TbBuilding className="w-5 h-5" /> // Building represents properties
        },
        {
            text: "Tenants",
            link: "/dashboard/property-manager/tenants",
            icon: <TbUsers className="w-5 h-5" /> // Users/people represents tenants
        },
        {
            text: "Leases",
            link: "/dashboard/property-manager/leases",
            icon: <TbFileText className="w-5 h-5" /> // File text represents lease documents
        },
        {
            text: "Bookings",
            link: "/dashboard/property-manager/bookings",
            icon: <IoCalendarOutline className="w-5 h-5" /> // Calendar represents bookings
        },
        {
            text: "Utilities",
            link: "/dashboard/property-manager/utility-management",
            icon: <TbBuildingCommunity className="w-5 h-5" /> // Building community represents utilities
        },
        {
            text: "Inventory",
            link: "/dashboard/property-manager/inventory",
            icon: <MdInventory2 className="w-5 h-5" /> // Inventory box represents inventory
        },
        {
            text: "Inspections",
            link: "/dashboard/property-manager/inspections",
            icon: <FaClipboardList className="w-5 h-5" /> // Clipboard list represents inspections
        },
        {
            text: "Maintenance",
            link: "/dashboard/property-manager/maintenance",
            icon: <FaWrench className="w-5 h-5" /> // Wrench represents maintenance/work orders
        },
        {
            text: "Housekeeping",
            link: "/dashboard/property-manager/housekeeping",
            icon: <FaBroom className="w-5 h-5" /> // Broom represents housekeeping
        },
        {
            text: "Check-ins",
            link: "/dashboard/property-manager/check-ins",
            icon: <IoLogInOutline className="w-5 h-5" /> // Log-in represents guest check-in/out
        },
        {
            text: "Services Requests",
            link: "/dashboard/property-manager/services",
            icon: <LuWrench className="w-5 h-5" /> // Wrench represents service requests
        },
        {
            text: "Vendor",
            link: "/dashboard/property-manager/vendor",
            icon: <FaHandshake className="w-5 h-5" /> // Handshake represents vendors
        },
        {
            text: "Community Forum",
            link: "/dashboard/property-manager/community-forum",
            icon: <LuMessageSquare className="w-5 h-5" /> // Message square represents community/forum
        },
        {
            text: "Reports & Analytics",
            link: "/dashboard/property-manager/reports",
            icon: <TbReportAnalytics className="w-5 h-5" /> // Report/analytics icon
        },
        {
            text: "Profile Settings",
            link: "/dashboard/property-manager/settings",
            icon: <TbSettings className="w-5 h-5" /> // Settings gear
        },
        {
            text: "Help/Support",
            link: "/contact",
            icon: <TbHelp className="w-5 h-5" /> // Help/question mark
        }
    ];
    let navList = [];
    if (role?.toLowerCase() === "admin") navList = adminNavList;
    else if (role?.toLowerCase() === "property-owner" || role?.toLowerCase() === "propertyowner") navList = propertyOwnerNavList;
    else if (role?.toLowerCase() === "facility-manager") navList = facilityManagerNavList;
    else if (role?.toLowerCase() === "property-manager") navList = propertyManagerNavList;
    else navList = userNavList;

    const pathname = usePathname();
    return (
        <ul className="flex flex-col gap-4 h-full border-red-500 ">
            {navList.map((list, index) => (
                <li key={index} className={`${pathname === list.link && "bg-primary-700"} px-4 py-2 rounded-lg hover:bg-primary-700 group transition-all duration-300`}>
                    <Link href={list.link} className="flex gap-4 items-center ">
                        <span className={`${pathname === list.link ? "text-secondary" : "text-white"} text-2xl group-hover:text-secondary`}>{list.icon}</span>
                        <span className="text-base text-white font-mono">{list.text}</span>
                    </Link>
                </li>
            )
            )}
        </ul>
    )
}