import { getBlog } from "@/app/_lib/data-services";
import BlogForm from "@/app/_components/blogs/BlogForm";
import AppHeader from "@/app/_components/AppHeader";
import Footer from "@/app/_components/Footer";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function Page({ params }) {
    const { id } = await params;
    const blog = await getBlog(id);

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <AppHeader />
                <main className="grow flex flex-col items-center justify-center p-2 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                        <ChevronLeft size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2 font-mono uppercase tracking-tighter italic">Blog Post Not Found</h1>
                    <p className="text-gray-500 mb-8 max-w-sm">The post you're trying to edit might have been removed or the ID is incorrect.</p>
                    <Link 
                        href="/dashboard/admin/blogs"
                        className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                        Back to Management
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            
            <main className="grow py-12 px-6">
                <div className="max-w-4xl mx-auto mb-10 flex items-center justify-between">
                    <Link 
                        href="/dashboard/admin/blogs"
                        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-mono font-bold uppercase text-xs"
                    >
                        <ChevronLeft size={16} />
                        Back to List
                    </Link>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 font-mono italic">
                        Editing ID: {id}
                    </div>
                </div>

                <BlogForm initialData={blog} isEditMode={true} />
            </main>

            <Footer />
        </div>
    );
}
