"use client"
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation"
import { handleBookProperty } from "../_lib/action";

export default function BookShortletButton({ onClick, children, id, property_status, isAuthenticated }) {
    const router = useRouter();
    const pathname = usePathname();

    const handleClick = async (e) => {
        if (!isAuthenticated) {
            toast.error("Please log in to continue");
            if (onClick) onClick(e);
            return;
        }

        if (property_status === "Shortlet" || property_status === "Rent") {
            // let the modal wrapper (Modal.Open) handle it via onClick
            if (onClick) onClick(e);
        } else {
            // Direct booking logic...
            toast.promise(handleBookProperty(id), {
                loading: "Booking...",
                success: (data) => "Booking request sent successful",
                error: (err) => {
                    if (err.message.includes("Log in")) {
                        router.push(`/auth/log-in?redirectUrl=${encodeURIComponent(pathname)}`);
                    }
                    return err.message || "Please log in to book this property";
                }
            });
        }
    }

    return <button onClick={handleClick} className="py-2 px-4 w-full font-mono bg-primary rounded-lg text-white cursor-pointer">{children}</button>
}