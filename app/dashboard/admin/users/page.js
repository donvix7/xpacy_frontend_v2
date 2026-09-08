import AdminPropertyOwnersList from "@/app/_components/AdminPropertyOwnersList";
import AdminUsersList from "@/app/_components/AdminUsersList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import UsersSummary from "@/app/_components/UsersSummary";
import { getPropertyOwner, getAllAdmin, getAllUsers } from "@/app/_lib/data-services";
import { UserPlus } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { FaUserTimes } from "react-icons/fa";
import { FaFileSignature, FaPlus, FaUser, FaUserCheck, FaUsers, FaUserShield, FaUserSlash, FaUserTie } from "react-icons/fa6";

export default async function Page(){
        const cookieStore = await cookies();
        const token = cookieStore.get("token")
        
        const [owners, admins, regularUsers] = await Promise.all([
            getPropertyOwner(token),
            getAllAdmin(token),
            getAllUsers(token)
        ]);

        // Normalize data structure if needed
        const ownersList = (owners || []).map(u => ({ ...u, role: 'property-owner' }));
        const adminsList = (admins || []).map(u => ({ ...u, role: 'admin' }));
        const usersList = (regularUsers || []).map(u => ({ ...u, role: 'user' }));

        // Deduplicate users for the "All Registered Users" list
        // Priority: Admin > Property Owner > User
        const allUsersMap = new Map();
        
        // Add users first (lowest priority)
        usersList.forEach(u => allUsersMap.set(u.id, u));
        
        // Add owners (overwrites user if ID matches)
        ownersList.forEach(u => allUsersMap.set(u.id, u));
        
        // Add admins (highest priority, overwrites others)
        adminsList.forEach(u => allUsersMap.set(u.id, u));

        const allUsers = Array.from(allUsersMap.values());

        const stats = {
            totalUsers: allUsers.length,
            propertyOwners: ownersList.length,
            admins: adminsList.length,
            regularUsers: usersList.length,
            processedKyc: allUsers.filter(u => u.kyc_status === 'processing').length,
            activeUsers: allUsers.filter(u => u.status === 'active').length,
            inactiveUsers: allUsers.filter(u => u.status === 'inactive').length,
            unverifiedUsers: allUsers.filter(u => !u.email_verified_at).length 
        };

       
const summaryCards = [
    { 
        label: "Total Users", 
        value: stats.totalUsers, 
        color: "bg-primary-100", 
        icon: <FaUsers className="w-5 h-5 text-primary" /> 
    },
    { 
        label: "Property Owners", 
        value: stats.propertyOwners, 
        color: "bg-blue-100", 
        icon: <FaUserTie className="w-5 h-5 text-blue-600" /> 
    },
    { 
        label: "Admins", 
        value: stats.admins, 
        color: "bg-purple-100", 
        icon: <FaUserShield className="w-5 h-5 text-purple-600" /> 
    },
    { 
        label: "Regular Users", 
        value: stats.regularUsers, 
        color: "bg-amber-100", 
        icon: <FaUser className="w-5 h-5 text-amber-600" /> 
    },
    { 
        label: "KYC Processing", 
        value: stats.processedKyc, 
        color: "bg-orange-100", 
        icon: <FaFileSignature className="w-5 h-5 text-orange-600" /> 
    },
    { 
        label: "Active Users", 
        value: stats.activeUsers, 
        color: "bg-emerald-100", 
        icon: <FaUserCheck className="w-5 h-5 text-emerald-600" /> 
    },
    { 
        label: "Inactive Users", 
        value: stats.inactiveUsers, 
        color: "bg-red-100", 
        icon: <FaUserTimes className="w-5 h-5 text-red-600" /> 
    },
    { 
        label: "Unverified Users", 
        value: stats.unverifiedUsers, 
        color: "bg-gray-100", 
        icon: <FaUserSlash className="w-5 h-5 text-gray-600" /> 
    },
];
    return (
        <div className="p-2 space-y-6">
            <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize mb-2">User Management</h1>
            <SummaryCards cards={summaryCards} title="User Summary" />
            <DashboardGridItem title="All Users List">
               
                <AdminUsersList users={usersList} title="All Users List" variant="tenant" />
            </DashboardGridItem>
            <DashboardGridItem title="All Registered Users List">

                <AdminUsersList users={allUsers} title="All Registered Users List" variant="registered" />
            </DashboardGridItem>
            <DashboardGridItem title="Admins List">

                <AdminUsersList users={adminsList} title="Admins List" />
            </DashboardGridItem>
            <DashboardGridItem title="Property Owners List">
                <Link href="/admin/add-new-owner" className="flex items-center self-end gap-2 text-sm text-primary hover:underline">
                    <FaPlus /> Add New Owner
                </Link>
                <AdminPropertyOwnersList owners={ownersList}/>    
            </DashboardGridItem>        
        </div>
    )
}