"use client"
import Image from "next/image";
import { useRef, useTransition } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { uploadDisplayPhoto } from "../_lib/action";
import SpinnerMini from "./SpinnerMini";
import toast from "react-hot-toast";
import { compressImages } from "../_lib/image-compression";

export default function ProfilePhoto({ profile, uploadAction }) {
    const fileInputRef = useRef(null)
    const [isPending, startTransition] = useTransition();
    const handleChange = async (e) => {
        const image = e.target.files[0]
        if (!image) return;

        startTransition(async () => {
            try {
                const compressedImage = await compressImages(image);
                const formData = new FormData();
                formData.append("display_picture", compressedImage);

                const action = uploadAction || uploadDisplayPhoto;
                await toast.promise(action(formData), {
                    loading: "Uploading...",
                    success: (data) => `${data.message}`,
                    error: "Error uploading photo, please try again"
                });
            } catch (error) {
                console.error("Compression/Upload error:", error);
                toast.error("An error occurred during upload.");
            }
        });
    }
    return (
        <div className="flex lg:items-center gap-8 lg:gap-0 flex-col lg:flex-row lg:justify-between">
            <div className="grid grid-cols-[100px_1fr] grid-rows-[auto] gap-y-2 gap-x-4">
                <div className="w-[100px] h-[100px] relative row-span-2 bg-gray-200 rounded-full flex justify-center items-center ">
                    {
                        isPending ?
                            <SpinnerMini />
                            :
                            <Image src={profile?.display_picture ? `https://app.xpacy.com/src/upload/display_img/${profile?.display_picture}` : "/avatar.png"} alt="avatar" fill className="object-contain rounded-full" unoptimized />

                    }
                </div>
                <span className="place-content-end font-mono">Profile photo</span>
                <span className="text-xs text-neutral-800 place-content-start font-mono">PNG, JPEG under 15MB</span>
            </div>
            <div className="flex items-center gap-3.5">
                <label className="px-3.5 py-3 bg-primary font-bold rounded-lg flex items-center justify-center text-white font-mono cursor-pointer" htmlFor="profile">
                    <input ref={fileInputRef} disabled={isPending} type="file" id="profile" className="hidden" onChange={handleChange} accept="image/png, image/jpeg, image/webp" />
                    <span>{profile?.display_picture ? "Replace Picture" : "Upload Picture"}</span>
                </label>
                <span className="flex items-center justify-center p-3 text-2xl border border-primary-100 rounded-lg">
                    <RiDeleteBin6Line />
                </span>
            </div>
        </div>
    )
}