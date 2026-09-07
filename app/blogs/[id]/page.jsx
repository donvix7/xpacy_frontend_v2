import Image from "next/image";
import AppHeader from "../../_components/AppHeader";
import Footer from "../../_components/Footer";
import { getBlog } from "../../_lib/data-services";
import { format } from "date-fns";
import insightImg1 from "../../../public/insight-image1.png";

export default async function BlogPage({ params }) {
  const { id } = await params;
  const blog = await getBlog(id);

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col font-mono bg-white">
        <AppHeader />
        <main className="grow flex items-center justify-center">
          <h1 className="text-2xl font-bold font-mono">Blog post not found</h1>
        </main>
        <Footer />
      </div>
    );
  }

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
    <div className="min-h-screen flex flex-col font-mono bg-white text-neutral-900">
      <AppHeader />
      
      <main className="grow">
        {/* Title and Metadata Section (Above Hero) */}
        <div className="p-6 pt-12 max-w-5xl mx-auto">
          <p className="text-sm md:text-md text-primary-700 font-bold uppercase tracking-wider mb-4">
            {blog.category?.name || blog.category || "General"}
          </p>
         
          
          <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-neutral-600 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200">
                 {/* Placeholder author icon */}
                 <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-400">
                   {blog.author?.name?.charAt(0) || "X"}
                 </div>
                 
              </div>
              <div className="flex flex-col gap-2 justify-center ">
                    <span className="text-xl font-black leading-[1.1] tracking-tight text-neutral-900">
                      {blog.title}
                    </span>
                    <span className="font-bold text-neutral-900">By {blog.author?.name || "Xpacy Team"}</span>
                    <span className="whitespace-nowrap">{formattedDate}</span>
                 </div>
            </div>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <div className="relative w-full h-[400px] md:h-[650px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={imageSrc}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Content Section */}
        <article className="max-w-5xl mx-auto px-6 pb-24 font-sans">
          <div 
            className="prose prose-lg md:prose-xl max-w-none text-neutral-800 leading-relaxed 
                       prose-headings:font-bold prose-headings:text-neutral-900 
                       prose-p:mb-8 prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-4xl prose-h2:border-b prose-h2:pb-4
                       prose-img:rounded-2xl prose-img:shadow-xl prose-a:text-primary-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
