import BlogForm from "@/app/_components/blogs/BlogForm";
import AppHeader from "@/app/_components/AppHeader";
import Footer from "@/app/_components/Footer";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function Page() {
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
                        New Post
                    </div>
                </div>

                <BlogForm isEditMode={false} />
            </main>

            <Footer />
        </div>
    );
}
