"use client"
import Image from "next/image";
import StatusChips from "./StatusChips";
import OwnerOptionsMenu from "./OwnerOptionsMenu";
import Modal from "./Modal";
import { HiOutlineUserAdd } from "react-icons/hi";
import AddNewOwnerForm from "./AddNewOwnerForm";
import DataTable from "./DataTable";

const tableHeadings = [
    { heading: "Owner’s Information" },
    { heading: "Contact Details" },
    { heading: "User Status", center: true },
    { heading: "" }
];

export default function AdminPropertyOwnersList({ owners,  variant = "default" }) {

    const renderRow = (owner) => (
        <tr key={owner._id || owner.id} className="text-neutrals-900 text-sm font-mono border-b border-primary-100 hover:bg-gray-50/50 transition-colors last:border-0">
            <td className="p-4">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 relative shrink-0">
                        <Image src={owner.display_picture ? `https://app.xpacy.com/src/upload/display_img/${owner.display_picture}` : "/avatar.png"} alt="owner-photo" className="object-cover rounded-full" unoptimized fill />
                    </div>
                    <span className="truncate font-semibold">{owner.first_name} {owner.last_name}</span>
                </div>
            </td>
            <td className="p-4">
                <div className="flex flex-col justify-center">
                    <span>{owner.phone}</span>
                    <span className="text-gray-500 text-xs truncate">{owner.email}</span>
                </div>
            </td>
            <td className="p-4 text-center">
                <div className="flex justify-center capitalize">
                    <StatusChips status={"active"} />
                </div>
            </td>
            <td className="p-4 relative text-center">
                <div className="flex justify-center">
                    <OwnerOptionsMenu id={owner._id || owner.id} />
                </div>
            </td>
        </tr>
    );

    const renderMobileCard = (owner) => (
         <div key={owner._id || owner.id} className="flex flex-col gap-4 p-4 border-b border-primary-100 bg-white last:border-0 w-full border-2">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 relative w-full">
                             
                            <div className="w-12 h-12 relative shrink-0">
                                <Image src={owner.display_picture ? `https://app.xpacy.com/src/upload/display_img/${owner.display_picture}` : "/avatar.png"} alt="owner-photo" className="object-cover rounded-full" unoptimized fill />
                            </div>
                            <div className="flex flex-col w-full">
                               <div className="backdrop-blur-sm self-end ">
                                <OwnerOptionsMenu id={owner._id || owner.id} />
                                </div>
                                <div className="flex justify-between">
                                <label className="text-sm text-gray-500 ">Name</label>
                                <span className="text-sm font-semibold">{owner.first_name} {owner.last_name}</span>
        
                                </div>
                                <div className="flex justify-between">
                                    <label className="text-sm text-gray-500 ">Email</label>
        
                                <p className="text-xs text-gray-500 truncate max-w-[280px]">{owner.email}</p>
                                </div>
                                <div className="flex justify-between">
                                    <label className="text-sm text-gray-500 ">Role</label>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize w-fit ${
                                    owner.user_role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                    owner.user_role === 'Property Owner' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {owner.user_role?.replace('-', ' ') || 'User'}
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
                                                <span className="font-medium text-gray-900">{owner.email || "N/A"}</span>
                                                <span className="text-gray-500">{owner.phone || "N/A"}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-gray-500 ">Phone:</span>
                                            <span className="font-medium text-gray-900">{owner.phone || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-gray-500 ">Status:</span>
                                            <StatusChips status={owner.status || "active"} />
                                        </div>
                                        {variant === 'registered' && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-gray-500">KYC Status:</span>
                                                <StatusChips status={owner.kyc_status || 'N/A'} />
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

    const AddOwnerBtn = (
        <Modal>
            <Modal.Open>
                <button className="flex items-center justify-center cursor-pointer gap-2 px-4 py-2.5 bg-primary rounded-lg font-mono font-medium text-white text-sm hover:bg-primary-dark transition-colors shrink-0 whitespace-nowrap">
                    <HiOutlineUserAdd className="text-xl" />
                    <span>Add New Owner</span>
                </button>
            </Modal.Open>
            <Modal.Window>
                <AddNewOwnerForm/>
            </Modal.Window>
        </Modal>
    );

    return (
        <DataTable
            title="Property Owners List"
            headers={tableHeadings}
            data={owners}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            headerActions={AddOwnerBtn}
        />
    )
}