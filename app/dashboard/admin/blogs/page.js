import AdminBlogsList from "@/app/_components/blogs/AdminBlogsList";
import BlogsSummary from "@/app/_components/blogs/BlogsSummary";
import BlogFilter from "@/app/_components/blogs/BlogFilter";
import { Plus } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getBlogs, getBlogCategories } from "@/app/_lib/data-services";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import SummaryCards from "@/app/_components/SummaryCards";
import { FaBlog, FaStar } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";

export default async function Page({ searchParams: searchParamsPromise }) {
    const searchParams = await searchParamsPromise;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    const [blogs, categories] = await Promise.all([
        getBlogs(token),
        getBlogCategories()
    ]);

    const stats = {
        totalBlogs: blogs.length,
        publishedBlogs: blogs.filter(b => b.is_published === true).length,
        featuredBlogs: blogs.filter(b => b.is_featured === true).length,
    };

const summaryCards = [
    { 
        label: "Total Blogs", 
        value: stats.totalBlogs, 
        color: "bg-primary-100", 
        icon: <FaBlog className="w-5 h-5 text-primary" /> 
    },
    { 
        label: "Published Blogs", 
        value: stats.publishedBlogs, 
        color: "bg-emerald-100", 
        icon: <FaCheckCircle className="w-5 h-5 text-emerald-600" /> 
    },
    { 
        label: "Featured Blogs", 
        value: stats.featuredBlogs, 
        color: "bg-amber-100", 
        icon: <FaStar className="w-5 h-5 text-amber-600" /> 
    },
];
    const search = searchParams?.search || "";
    const category = searchParams?.category || "all";

    return (
        <div className=" space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h1 className="lg:text-4xl text-[28px] text-primary font-bold capitalize">Blogs Management</h1>
                <Link 
                    href="/dashboard/admin/blogs/create" 
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create New Blog</span>
                </Link>
            </div>
            <SummaryCards cards={summaryCards} title="Blogs Summary" />
            <DashboardGridItem title="Blogs List">
                <AdminBlogsList blogs={blogs} filter={category} search={search} />
            </DashboardGridItem>
            </div>
    );
}
