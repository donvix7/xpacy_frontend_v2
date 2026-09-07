import { FaUsers } from "react-icons/fa";

export default function AdminUsersSummary({ stats }){
    const { totalUsers = 0, propertyOwners = 0, activeUsers = 0, admins = 0 } = stats || {};

    return (
        <div className="p-6 flex flex-col gap-4 border border-primary-200 rounded-lg bg-white">
                    <p className="lg:text-md text-base font-bold text-gray-800">Users Summary</p>
                    <div className="flex flex-col gap-4">
                        {/* Total users card */}
                        <div className="flex flex-col border border-primary-200 rounded-lg px-6 py-7 relative overflow-hidden bg-white">
                            <div className="flex gap-2 items-center lg:w-[256px] w-full" >
                                <span className="w-12 h-12 text-primary bg-yellow-400 rounded-full flex items-center justify-center text-2xl "><FaUsers /></span>
                                <span className="font-mono text-primary-900">TOTAL USERS</span>
                            </div>
                            <p className="text-center font-bold text-2xl font-mono w-[256px]">{totalUsers}</p>
                            <div className="w-[220px] h-[220px] rounded-full absolute lg:-right-[7%] -right-[70%] lg:-top-1 -top-10 bg-primary-700 z-10 opacity-10"></div>
                            <div className="w-[220px] h-[220px] rounded-full absolute lg:right-[4%] -right-[65%] top-2 bg-[#73A0BE] opacity-10"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Property Owners */}
                            <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg bg-white border border-primary-100 w-full hover:shadow-xl transition-shadow">
                                <p className="font-mono text-primary-600 text-base">Property Owners</p>
                                <p className="text-center font-bold text-lg font-mono">{propertyOwners}</p>
                            </div>
                            {/* Active Users */}
                             <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg bg-white border border-primary-100 w-full hover:shadow-xl transition-shadow">
                                <p className="font-mono text-primary-600 text-base">Active Users</p>
                                <p className="text-center font-bold text-lg font-mono">{activeUsers}</p>
                            </div>
                            {/* Admin */}
                            <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg bg-white border border-primary-100 w-full hover:shadow-xl transition-shadow">
                                <p className="font-mono text-primary-600 text-base">Admins</p>
                                <p className="text-center font-bold text-lg font-mono">{admins}</p>
                            </div>
                        </div>
                    </div>
                </div>
    )
}