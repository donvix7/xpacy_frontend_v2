"use client";
import Image from "next/image";
import StatusChips from "./StatusChips";
import UserOptionsMenu from "./UserOptionsMenu";
import DataTable from "./DataTable";

const defaultHeadings = [
    { heading: "Name" },
    { heading: "Contact/Info" },
    { heading: "Status", center: true },
    { heading: "" }
];

const registeredHeadings = [
    { heading: "Name" },
    { heading: "Contact/Info" },
    { heading: "Status", center: true },
    { heading: "KYC Status", center: true },
    { heading: "" }
];

const tenantHeadings = [
    { heading: "Name" },
    { heading: "Contact/Info", center: true },
    { heading: "" }
];

export default function AdminUsersList({ users = [], title = "All Users List", variant = "default", pagination }) {
    let headings = defaultHeadings;
    if (variant === 'tenant') headings = tenantHeadings;
    else if (variant === 'registered') headings = registeredHeadings;

    const renderRow = (user) => (
        <tr key={user._id || user.id} className="text-neutrals-900 text-sm font-mono border-b border-primary-100 hover:bg-gray-50 transition-colors last:border-0">
            <td className="p-4">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 relative shrink-0">
                        <Image src={user.display_picture ? `https://app.xpacy.com/src/upload/display_img/${user.display_picture}` : "/avatar.png"} alt="user-photo" className="object-cover rounded-full" unoptimized fill />
                    </div>
                    <span className="truncate font-semibold">{user.firstname || user.first_name || user.firstName} {user.lastname || user.last_name || user.lastName || user.username}</span>
                </div>
            </td>

            {variant === 'tenant' ? (
                <>
                    <td className="p-4 text-center">
                        <div className="flex flex-col justify-center items-center">
                            <span className="text-gray-900 text-xs">{user.email}</span>
                            <span className="text-gray-500 text-[10px]">{user.phone || "N/A"}</span>
                            <span className="text-gray-400 font-semibold text-[10px] mt-1 uppercase">{user.user_type || user.role || ""}</span>
                        </div>
                    </td>
                </>
            ) : (
                <>
                    <td className="p-4">
                        <div className="flex flex-col justify-center">
                            <span className="text-gray-900">{user.email}</span>
                            <span className="text-gray-500 text-xs">{user.phone || "N/A"}</span>
                        </div>
                    </td>
                    <td className="p-4 text-center">
                        <div className="flex justify-center capitalize">
                            <StatusChips status={user.status || "active"} />
                        </div>
                    </td>
                    {variant === 'registered' && (
                        <td className="p-4 text-center">
                            <div className="flex justify-center capitalize">
                                <StatusChips status={user.kyc_status || 'N/A'} />
                            </div>
                        </td>
                    )}
                </>
            )}

            <td className="p-4 relative text-center">
                <div className="flex justify-center">
                    <UserOptionsMenu id={user._id || user.id} role={user.user_role} /> 
                </div>
            </td>
        </tr>
    );

    const renderMobileCard = (user) => (
        <div key={user._id || user.id} className="flex flex-col gap-4 p-4 border-b border-primary-100 bg-white last:border-0 w-full border-2">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 relative w-full">
                     
                    <div className="w-12 h-12 relative shrink-0">
                        <Image src={user.display_picture ? `https://app.xpacy.com/src/upload/display_img/${user.display_picture}` : "/avatar.png"} alt="user-photo" className="object-cover rounded-full" unoptimized fill />
                    </div>
                    <div className="flex flex-col w-full">
                       <div className="backdrop-blur-sm self-end ">
                        <UserOptionsMenu id={user._id || user.id} role={user.role} />
                        </div>
                        <div className="flex justify-between">
                        <label className="text-sm text-gray-500 ">Name</label>
                        <h3 className="font-bold text-sm text-neutrals-900">{user.firstname} {user.lastname}</h3>

                        </div>
                        {variant !== 'tenant' && 
                        <div className="flex justify-between">
                            <label className="text-sm text-gray-500 ">Email</label>

                        <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        }
                        <div className="flex justify-between">
                            <label className="text-sm text-gray-500 ">Role</label>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize w-fit ${
                            user.user_role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                            user.user_role === 'Property Owner' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                            {user.user_role?.replace('-', ' ') || 'User'}
                        </span>
                            
                        </div>
                       
                        <div className="flex flex-col gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg">
                        {variant === 'tenant' ? (
                            <>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-gray-500 ">Property:</span>
                                    <span className="font-medium text-gray-900 truncate max-w-[120px]">{user.property_name || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-gray-500 ">Contact:</span>
                                    <div className="flex flex-col items-end">
                                        <span className="font-medium text-gray-900">{user.email || "N/A"}</span>
                                        <span className="text-gray-500">{user.phone || "N/A"}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-gray-500 ">Phone:</span>
                                    <span className="font-medium text-gray-900">{user.phone || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-gray-500 ">Status:</span>
                                    <StatusChips status={user.status || "active"} />
                                </div>
                                {variant === 'registered' && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-gray-500">KYC Status:</span>
                                        <StatusChips status={user.kyc_status || 'N/A'} />
                                    </div>
                                )}
                            </>
                        )}
                        </div>
                    </div>
                    
                </div>
                
            </div>
            
           
        </div>
    );

    return (
        <DataTable
            title={title}
            headers={headings}
            data={users}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            emptyMessage="No users found."
            showPagination={true}
            pagination={pagination}
        />
    );
}