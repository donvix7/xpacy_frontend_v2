import Image from "next/image";
import { format } from "date-fns";
import insightImg1 from "../../public/insight-image1.png";
import Link from "next/link";
import BlogOptionsMenu from "./blogs/BlogOptionsMenu";

export default function BlogCard({ blog, isAdmin = false }) {
  const rawImage = blog.image || (Array.isArray(blog.images) ? blog.images[0] : null);
  const baseImageUrl = "https://app.xpacy.com/src/upload/blog";
  
  const imageSrc = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${baseImageUrl}/${rawImage.startsWith("/") ? rawImage.slice(1) : rawImage}`
    : insightImg1;
    
  const formattedDate = blog.created_at || blog.createdAt
    ? format(new Date(blog.created_at || blog.createdAt), "dd MMMM yyyy") 
    : "Unknown Date";

  return (
    <div className="relative bg-white flex flex-col w-full group rounded-2xl md:rounded-[24px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 border border-primary-200 overflow-hidden">
      {isAdmin && (
        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-30">
          <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg p-0.5 hover:bg-white transition-all transform hover:scale-105 border border-gray-100/50">
            <BlogOptionsMenu id={blog._id || blog.id} slug={blog.slug} />
          </div>
        </div>
      )}

      <header className="w-full h-48 md:h-[267px] relative shrink-0 bg-gray-50 overflow-hidden">
       <Link href={`/blogs/${blog.slug}`} className="block w-full h-full">
        <Image
          src={imageSrc}
          alt={blog.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        </Link>
        
        {blog.is_featured && (
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-gray-900/90 backdrop-blur-md text-[10px] text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-xl border border-white/10">
            Featured
          </div>
        )}
      </header>
      
      <footer className="flex flex-col flex-1 p-4 md:p-6 bg-white gap-2 md:gap-3">
        <div className="flex items-center gap-2 mb-1 md:mb-2">
           {blog.slug ? (
              <p className="text-[10px] md:text-[11px] text-primary font-black hover:text-primary-dark transition-colors uppercase tracking-[0.2em] font-mono">
                {blog.category?.name || blog.category || "Uncategorized"}
              </p>
          ) : (
            <p className="text-[10px] md:text-[11px] text-primary font-black uppercase tracking-[0.2em] font-mono">
              {blog.category?.name || blog.category || "Uncategorized"}
            </p>
          )}
        </div>

        <h3 className="font-bold text-lg md:text-xl text-gray-900 line-clamp-2 leading-[1.3] md:leading-[1.4] group-hover:text-primary transition-colors mb-3 md:mb-4">
          {blog.title}
        </h3> 
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/80">
          <p className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-wider font-mono">
            {formattedDate}
          </p>
          <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono italic flex items-center gap-1.5">
             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
             {blog.readTime || "5 min read"}
          </p>
        </div>
      </footer>
    </div>
  );
}
