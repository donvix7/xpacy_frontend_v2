"use client"
import { GoHeart, GoHeartFill } from "react-icons/go";
import { handleSaveProperty } from "../_lib/action";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { useRouter, useParams, usePathname } from "next/navigation";
export default function PropertySaveBtn({ isSaved, propertyId, isPropertyCard }) {
    // const params = useParams();
    // const {propertyId}  = params;
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();
    const handleSave = () => {
        startTransition( () => {
            const savePromise = handleSaveProperty(propertyId);
            toast.promise(savePromise, {
                loading: "Saving..",
                success: (data) => ` ${data.message}`,
                error: (err) => {
                    if (err.message === "Please log in to continue") {
                        router.push(`/auth/log-in?redirectUrl=${encodeURIComponent(pathname)}`);
                        return `Please log-in to continue`
                    }
                    return `${err.message}`
                }
            });

            savePromise.then(() => {
                router.push("/dashboard/user/saved-properties");
            }).catch((err) => {
               console.error("Save Error:", err)
            });

        })
    }
    return (
        <>
            {
                isPropertyCard ? 
                (
                    <button disabled={isSaved || isPending} onClick={handleSave} className="rounded-full bg-gray-300 p-3 z-40 disabled:cursor-not-allowed disabled:bg-primary-200">
                        {isSaved ? <span className="text-2xl text-primary"><GoHeartFill /> </span> : <span className="text-2xl"><GoHeart /> </span>}
                    </button>
                ) :
                (
                    <button disabled={isSaved || isPending} onClick={handleSave} className="flex items-center border border-primary-200 rounded-lg gap-2 py-1.5 px-2 text-black text-xs font-mono cursor-pointer hover:bg-primary-200 disabled:cursor-not-allowed disabled:bg-primary-200">
                        {isSaved ? <span className="text-base text-primary"><GoHeartFill /> </span> : <span className="text-base"><GoHeart /> </span>}
                        {isSaved ? "Saved" : "Save"}
                    </button>
                ) 
            }
        
        </>
    )
}