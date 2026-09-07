import { getBlogs } from "@/app/_lib/data-services";
import BlogCard from "../BlogCard";

export default async function AdminBlogsList({ blogs = [], filter = "all", search = "" }) {
    // If blogs aren't passed, fetch them (fallback, though Page.js should provide them)
    // Actually, in the current architecture, Page.js provides them.
    
    let filteredBlogs = [...blogs];

    // Filter by search term
    if (search) {
        const query = search.toLowerCase();
        filteredBlogs = filteredBlogs.filter(blog => 
            blog.title?.toLowerCase().includes(query) || 
            blog.content?.toLowerCase().includes(query) ||
            blog.author?.name?.toLowerCase().includes(query)
        );
    }

    // Filter by category
    if (filter !== "all") {
        filteredBlogs = filteredBlogs.filter(blog => 
            blog.category?.name === filter || 
            blog.category === filter
        );
    }

    return (
        <div className=''>
            {filteredBlogs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 italic text-gray-400">
                    No blogs found matching your criteria.
                </div>
            ) : (
                <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto'>
                    {filteredBlogs.map((blog) => (
                        <BlogCard key={blog.id || blog._id} blog={blog} isAdmin={true} />
                    ))}
                </section>
            )}
        </div>
    );
}
