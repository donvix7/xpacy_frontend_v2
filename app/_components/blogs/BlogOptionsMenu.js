"use client";

import { MoreVertical, Edit2, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteBlog } from "../../_lib/action";
import Modal from "../Modal";
import ConfirmDeleteModal from "../ConfirmDeleteModal";

// Extracted delete logic to match TableOptionsMenu pattern with Modal context
const DeleteBlogContent = ({ onClose, id, propsHandleDelete }) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const doDelete = async () => {
        if (propsHandleDelete) {
            propsHandleDelete();
            onClose?.();
            return;
        }

        startTransition(async () => {
            const result = await deleteBlog(id);
            if (result?.error) {
                toast.error(typeof result.error === "string" ? result.error : "Failed to delete blog post.");
            } else {
                toast.success("Blog deleted successfully");
                onClose?.();
                router.refresh(); // Refresh to update list
            }
        });
    };

    return (
        <ConfirmDeleteModal 
            title="Are you sure you want to delete this blog post?" 
            onConfirm={doDelete} 
            onClose={onClose} 
            isPending={isPending} 
        />
    );
};

export default function BlogOptionsMenu({ id, slug, handleDelete: propsHandleDelete }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Modal>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <Link
                            href={`/blogs/${slug}`}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            <Eye className="w-4 h-4 " />
                            View Details
                        </Link>
                        <Link
                            href={`/dashboard/admin/blogs/${slug}`}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Blog
                        </Link>
                        
                        <Modal.Open name="delete-blog">
                            <button
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Blog
                            </button>
                        </Modal.Open>
                        
                    </div>
                )}
                <Modal.Window name="delete-blog">
                    <DeleteBlogContent id={id} propsHandleDelete={propsHandleDelete} />
                </Modal.Window>
            </div>
        </Modal>
    );
}
