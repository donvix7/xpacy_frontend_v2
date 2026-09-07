import { FaQuestionCircle, FaListUl } from "react-icons/fa";

export default function AdminFaqsSummary({ faqs }) {
    const counts = {
        total: faqs?.length || 0,
        // Assuming we might have categories or status later
    };

    return (
        <div className="p-6 flex flex-col gap-4 border border-primary-200 rounded-lg bg-white mb-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">FAQs Summary</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Main Hero Card */}
                <div className="flex flex-col border border-primary-200 rounded-lg px-6 py-7 relative overflow-hidden bg-white min-w-[250px] flex-1">
                    <div className="flex gap-2 items-center" >
                        <span className="w-12 h-12 text-primary bg-primary-100 rounded-full flex items-center justify-center text-2xl "><FaQuestionCircle /></span>
                        <span className="font-mono text-primary-900 uppercase">Total FAQs</span>
                    </div>
                    <p className="text-center font-bold text-2xl font-mono mt-4">{counts.total}</p>
                    <div className="w-[150px] h-[150px] rounded-full absolute -right-10 -top-10 bg-primary-700 opacity-10 z-10"></div>
                </div>

                 {/* Simple Stat Card */}
                 <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-sm bg-gray-50 border border-primary-100 flex-1 hover:shadow-md transition-shadow">
                    <div className="mb-2 text-xl text-blue-500"><FaListUl /></div>
                    <p className="font-mono text-gray-600 text-base text-center">Categories</p>
                    <p className="text-center font-bold text-lg font-mono text-primary">General</p>
                </div>
            </div>
        </div>
    );
}
