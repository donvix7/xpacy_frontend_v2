import { FaBlog, FaCheckCircle, FaSitemap } from "react-icons/fa";
import { MdOutlineDrafts } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";

export default function BlogsSummary({
    totalBlogs = 0,
    publishedBlogs = 0,
    featuredBlogs = 0,
}) {
    const items = [
         {
            title: "Published",
            count: publishedBlogs,
            icon: <FaCheckCircle className="text-green-500" size={20} />,
            color: "bg-green-50 border-green-100",
            textColor: "text-green-900"
        },
        {
            title: "Featured",
            count: featuredBlogs,
            icon: <MdOutlineDrafts className="text-yellow-500" size={20} />,
            color: "bg-yellow-50 border-yellow-100",
            textColor: "text-yellow-900"
        },
    ];

    return (
        <div className="p-6 flex flex-col gap-8 border border-primary-200 rounded-lg bg-white">
            <div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Blogs Statistics</h3>
                </div>

                <div className="flex flex-col gap-4">
                     {/* Main Hero Card */}
                     <div className="flex flex-col border border-primary-200 rounded-lg px-6 py-7 relative overflow-hidden bg-white mb-4">
                        <div className="flex gap-2 items-center lg:w-[256px] w-full" >
                            <span className="w-12 h-12 text-primary-300 bg-purple-100 rounded-full flex items-center justify-center text-2xl "><FaBlog /></span>
                            <span className="font-mono text-primary-900 uppercase">Total Blogs</span>
                        </div>
                        <p className="text-center font-bold text-2xl font-mono w-[256px]">{totalBlogs}</p>
                        <div className="w-[220px] h-[220px] rounded-full absolute lg:-right-[7%] -right-[70%] lg:-top-1 -top-10 bg-primary-700 z-10"></div>
                        <div className="w-[220px] h-[220px] rounded-full absolute lg:right-[4%] -right-[65%] top-2 bg-[#73A0BE]"></div>
                    </div>

                    {/* Grid Items */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {items.map((item, index) => (
                            <div key={index} className={`flex flex-col items-center justify-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white border border-primary-100 w-full relative overflow-hidden group`}>
                               <p className="font-mono text-primary-700 text-base text-center mb-1">{item.title}</p>
                               <p className="text-center font-bold text-lg font-mono text-gray-800">{item.count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
