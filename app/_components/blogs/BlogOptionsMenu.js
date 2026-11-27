"use client";

import { MoreVertical, Edit2, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteBlog } from "../../_lib/action";
import Modal from "../Modal";
import ConfirmDeleteModal from "../ConfirmDeleteModal";

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
                toast.error(
                    typeof result.error === "string"
                        ? result.error
                        : "Failed to delete blog post."
                );
            } else {
                toast.success("Blog deleted successfully");
                onClose?.();
                router.refresh();
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
    const menuRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isOpen]);

    const blogKey = slug || id;

    return (
        <Modal>
            <div ref={menuRef} className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-label="Blog actions"
                    aria-expanded={isOpen}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                    <MoreVertical className="h-4 w-4" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl">
                        <Link
                            href={`/blogs/${blogKey}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <Eye className="h-4 w-4 text-gray-400" />
                            View Details
                        </Link>
                        <Link
                            href={`/dashboard/admin/blogs/${blogKey}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <Edit2 className="h-4 w-4 text-gray-400" />
                            Edit Blog
                        </Link>
                        <div className="my-1 border-t border-gray-100" />
                        <Modal.Open name="delete-blog">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
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
