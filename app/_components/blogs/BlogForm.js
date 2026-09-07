"use client";

import { useState, useTransition, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Camera, Save, Trash2, X, AlertCircle } from "lucide-react";
import SpinnerMini from "../SpinnerMini";
import { createBlog, updateBlog, deleteBlog } from "../../_lib/action";
import { getBlogCategories } from "../../_lib/data-services";
import { compressImages } from "../../_lib/image-compression";

export default function BlogForm({ initialData = null, isEditMode = false }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [imagePreviews, setImagePreviews] = useState([]);
    const [featured, setFeatured] = useState(initialData?.is_featured ?? false);
    const [published, setPublished] = useState(initialData?.is_published ?? false);
    const [title, setTitle] = useState(initialData?.title ?? "");
    const [slug, setSlug] = useState(initialData?.slug ?? "");
    const [category_id, setCategory_id] = useState(initialData?.category_id ?? "");
    const [content, setContent] = useState(initialData?.content ?? "");
    
    // Track images properly - separate new file from existing URL
    const [newImageFile, setNewImageFile] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState("");
    const [isImageRemoved, setIsImageRemoved] = useState(false);
    
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await getBlogCategories();
                setCategories(data || []);
            } catch (error) {
                console.error("Failed to fetch blog categories:", error);
                toast.error("Failed to load categories");
            }
        };
        loadCategories();
    }, []);

    // Initialize existing image from initialData
    useEffect(() => {
        if (initialData?.images && initialData.images.length > 0 && !existingImageUrl && !isImageRemoved) {
            let imageUrl = initialData.images[0];
            // Handle both string and array cases
            if (Array.isArray(imageUrl)) {
                imageUrl = imageUrl[0] || "";
            }
            setExistingImageUrl(imageUrl);
        }
    }, [initialData, existingImageUrl, isImageRemoved]);

    // Handle preview for new image
    useEffect(() => {
        if (newImageFile instanceof File) {
            const objectUrl = URL.createObjectURL(newImageFile);
            setImagePreviews([objectUrl]);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setImagePreviews([]);
        }
    }, [newImageFile]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressedFile = await compressImages(file);
                setNewImageFile(compressedFile);
                // Clear existing image when new one is added
                setExistingImageUrl("");
                setIsImageRemoved(true);
            } catch (error) {
                console.error("Blog image compression error:", error);
                toast.error("Failed to compress image");
                // Fallback to original file
                setNewImageFile(file);
                setExistingImageUrl("");
                setIsImageRemoved(true);
            }
        }
    };

    const removeExistingImage = () => {
        setExistingImageUrl("");
        setIsImageRemoved(true);
        setNewImageFile(null);
        setImagePreviews([]);
        toast.success("Image removed");
    };

    const removeNewImage = () => {
        setNewImageFile(null);
        setImagePreviews([]);
        toast.success("New image removed");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const submitData = new FormData();
        submitData.append("title", title);
        submitData.append("slug", slug);
        submitData.append("category_id", category_id);
        submitData.append("content", content);
        submitData.append("is_featured", featured);
        submitData.append("is_published", published);

        // CRITICAL: Handle images properly for editing
        if (isEditMode && initialData?.id) {
            // For edit mode, we need to tell the backend what to do with images
            
            if (newImageFile instanceof File) {
                // Case 1: User uploaded a new image - replace the old one
                submitData.append("images", newImageFile);
                submitData.append("image_action", "replace");
                submitData.append("old_image", existingImageUrl);
            } else if (isImageRemoved && !existingImageUrl) {
                // Case 2: User removed the image - delete it
                submitData.append("image_action", "delete");
                submitData.append("old_image", initialData?.images?.[0] || "");
            } else if (existingImageUrl && !isImageRemoved) {
                // Case 3: Keep existing image (no changes)
                submitData.append("image_action", "keep");
                submitData.append("existing_images", JSON.stringify(initialData?.images || []));
                // Send the existing image URL to the backend
                if (typeof existingImageUrl === 'string') {
                    submitData.append("images", existingImageUrl);
                }
            }
        } else {
            // Create mode - just upload new image if exists
            if (newImageFile instanceof File) {
                submitData.append("images", newImageFile);
            } else if (existingImageUrl) {
                // This shouldn't happen in create mode, but handle it anyway
                submitData.append("images", existingImageUrl);
            }
        }

        startTransition(async () => {
            let result;
            if (isEditMode && initialData?.id) {
                result = await updateBlog(initialData.id, submitData);
            } else {
                result = await createBlog(submitData);
            }

            if (result?.error) {
                if (typeof result.error === 'string') {
                    toast.error(result.error);
                } else {
                    toast.error("Failed to save. Please check the fields.");
                    setErrors(result.error);
                }
            } else {
                toast.success(isEditMode ? "Blog updated successfully" : "Blog created successfully");
                router.push("/dashboard/admin/blogs");
            }
        });
    };

    // Determine which image to display
    const displayImage = useMemo(() => {
        if (newImageFile) {
            return null; // Preview is handled separately
        }
        if (existingImageUrl && !isImageRemoved) {
            return existingImageUrl;
        }
        return null;
    }, [newImageFile, existingImageUrl, isImageRemoved]);

    

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-20">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden font-sans ring-1 ring-black/5">
                <div className="p-8 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {isEditMode ? "Update Story" : "New Story"}
                        </h2>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={featured}
                                        onChange={(e) => setFeatured(e.target.checked)}
                                        className="w-5 h-5 rounded-lg border-gray-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" 
                                    />
                                    <span className="text-sm font-bold text-gray-600 group-hover:text-primary transition-colors capitalize">
                                        Featured
                                    </span>
                                </label>
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={published}
                                        onChange={(e) => setPublished(e.target.checked)}
                                        className="w-5 h-5 rounded-lg border-gray-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" 
                                    />
                                    <span className="text-sm font-bold text-gray-600 group-hover:text-primary transition-colors capitalize">
                                        Published
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Enter a compelling title..." 
                                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-medium text-gray-800" 
                            />
                            {errors.title && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> {errors.title.message}
                                </p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select 
                            value={category_id}
                            onChange={(e) => setCategory_id(e.target.value)}
                            required
                            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-gray-800 appearance-none cursor-pointer"
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> {errors.category_id.message}
                            </p>
                        )}
                        </div>
                    </div>
                    <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Slug <span className="text-red-500">*</span>
                            </label>
                            <input 
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                required
                                placeholder="url-friendly-slug" 
                                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-medium text-gray-800 font-mono text-sm" 
                            />
                            {errors.slug && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> {errors.slug.message}
                                </p>
                            )}
                        </div>

                    

                    {/* Content */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                            Content <span className="text-red-500">*</span>
                            <span className="text-[10px] font-normal text-gray-300 ml-2">(HTML Supported)</span>
                        </label>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows={12} 
                            className="w-full px-6 py-5 rounded-3xl border-2 border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-mono text-sm leading-relaxed" 
                            placeholder="Start writing your masterpiece here..." 
                        />
                        {errors.content && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> {errors.content.message}
                            </p>
                        )}
                    </div>

                    {/* Media Gallery */}
                    <div className="space-y-4">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Media Gallery</label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Existing Image */}
                            {displayImage && !isImageRemoved && !newImageFile && (
                                <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group bg-gray-50">
                                    <img 
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        width={500}
                                        height={500}
                                        src={displayImage.startsWith('http') ? displayImage : `https://app.xpacy.com/src/upload/blog/${displayImage}`} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                        alt="Existing" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={removeExistingImage} 
                                        className="absolute top-3 right-3 p-1.5 bg-red-500/90 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-90"
                                        aria-label="Remove image"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-blue-500 text-[10px] font-black text-white rounded-md shadow-sm uppercase tracking-tighter">
                                        Current
                                    </div>
                                </div>
                            )}

                            {/* New Image Preview */}
                            {imagePreviews.map((preview, idx) => (
                                <div key={`new-${idx}`} className="relative aspect-4/3 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group bg-gray-50">
                                    <img 
                                        src={preview} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                        alt={`Preview ${idx + 1}`} 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={removeNewImage} 
                                        className="absolute top-3 right-3 p-1.5 bg-red-500/90 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-90"
                                        aria-label="Remove image"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-green-400 text-[10px] font-black text-yellow-900 rounded-md shadow-sm uppercase tracking-tighter">
                                        New
                                    </div>
                                </div>
                            ))}

                            {/* Upload Button */}
                            <label className="aspect-4/3 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all group bg-gray-50/30">
                                <Camera className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black text-gray-400 mt-2 tracking-widest uppercase group-hover:text-primary/70">
                                    {displayImage ? "Replace" : "Upload"}
                                </span>
                                <input 
                                    type="file" 
                                    accept="image/jpeg,image/png,image/gif,image/webp" 
                                    onChange={handleImageChange} 
                                    className="hidden" 
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-400 ml-1">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP</p>
                        {isEditMode && (
                            <p className="text-xs text-blue-500 ml-1 mt-1">
                                Upload a new image to replace the current one, or click the X to remove it
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    {isEditMode ? (
                        <button 
                            type="button" 
                            onClick={() => router.back()} 
                            className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    ) : <div />}
                    <div className="flex items-center gap-4">
                        
                        <button 
                            type="submit" 
                            disabled={isPending} 
                            className="flex items-center gap-3 px-10 py-3.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
                        >
                            {isPending ? <SpinnerMini /> : <Save size={18} />}
                            {isEditMode ? "SAVE UPDATES" : "PUBLISH NOW"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}