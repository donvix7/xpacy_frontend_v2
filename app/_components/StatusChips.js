
const statusBg = {
    "vacant": "bg-[#FBC0BC] text-[#C4170B] ",
    "available": "bg-green-100 text-green-700 ",
    "rented": "bg-green-100 text-green-700 ",
    "active": "bg-[#C3E5C4] text-[#357B38] ",
    "draft": "bg-gray-200 text-gray-700",
    "pending": "bg-amber-100 text-amber-700",
    "verified": "bg-[#C3E5C4] text-[#357B38]",
    "n/a": "bg-gray-100 text-gray-500",
    
    // KYC Statuses
    "approved": "bg-green-100 text-green-700",
    "processing": "bg-blue-100 text-blue-700",
    "declined": "bg-red-100 text-red-700",
    
    // Service Statuses
    "in progress": "bg-[#FEF9C3] text-[#A16207]", // Yellow
    "in-progress": "bg-[#FEF9C3] text-[#A16207]",
    "completed": "bg-[#C3E5C4] text-[#357B38]",
    "upcoming": "bg-[#DBEAFE] text-[#1D4ED8]", // Blue
}

export default function StatusChips({status}) {
    return (  
            <span className={`${statusBg[status.toLowerCase()] || ""} px-4 py-1 flex items-center justify-center rounded-full  text-sm font-bold font-mono`}>{status}</span>
    )
}