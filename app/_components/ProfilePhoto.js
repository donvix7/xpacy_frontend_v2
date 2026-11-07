"use client";

import Image from "next/image";
import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { uploadDisplayPhoto } from "../_lib/action";
import SpinnerMini from "./SpinnerMini";
import { compressImages } from "../_lib/image-compression";

export default function ProfilePhoto({
  profile,
  uploadAction,
  organizationId,
  organizationRole,
  organizationName,
}) {
  const fileInputRef = useRef(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = async (e) => {
    const image = e.target.files?.[0];
    if (!image) return;

    startTransition(async () => {
      try {
        const compressedImage = await compressImages(image);

        const formData = new FormData();
        formData.append("display_picture", compressedImage);

        const action = uploadAction || uploadDisplayPhoto;

        await toast.promise(action(formData), {
          loading: "Uploading...",
          success: (data) => data?.message ?? "Photo updated successfully",
          error: "Error uploading photo, please try again",
        });

        // Refresh server components so the new image appears
        router.refresh();
      } catch (error) {
        console.error("Compression/Upload error:", error);
        toast.error("An error occurred during upload.");
      } finally {
        // Allow selecting the same file again
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  return (
    <div className="flex lg:items-center gap-8 lg:gap-0 flex-col lg:flex-row lg:justify-between">
      <div className="grid grid-cols-[100px_1fr] grid-rows-[auto] gap-y-2 gap-x-4">
        <div className="w-[100px] h-[100px] relative row-span-2 bg-gray-200 rounded-full flex justify-center items-center">
          {isPending ? (
            <SpinnerMini />
          ) : (
            <Image
              src={
                profile?.display_picture
                  ? `https://app.xpacy.com/src/upload/display_img/${profile.display_picture}`
                  : "/avatar.png"
              }
              alt="avatar"
              fill
              className="object-contain rounded-full"
              unoptimized
            />
          )}
        </div>
        <span className="place-content-end font-mono">Profile photo</span>
        <span className="text-xs text-neutral-800 place-content-start font-mono">
          PNG, JPEG under 15MB
        </span>
      </div>

      <div className="flex flex-col items-start gap-3.5 lg:items-end">
        {organizationId && (
          <div className="text-right">
            {organizationName && <p className="text-xs text-gray-500">{organizationName}</p>}
            <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold capitalize text-primary">
              {organizationRole?.replace(/[_-]/g, " ") || "Role unavailable"}
            </span>
          </div>
        )}
        <label
          className="px-3.5 py-3 bg-primary font-bold rounded-lg flex items-center justify-center text-white font-mono cursor-pointer"
          htmlFor="profile"
        >
          <input
            ref={fileInputRef}
            disabled={isPending}
            type="file"
            id="profile"
            className="hidden"
            onChange={handleChange}
            accept="image/png, image/jpeg, image/webp"
          />
          <span>
            {profile?.display_picture ? "Replace Picture" : "Upload Picture"}
          </span>
        </label>
      </div>
    </div>
  );
}
