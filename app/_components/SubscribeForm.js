"use client"
import { useTransition, useEffect } from "react";
import { submitSubscribe } from "../_lib/action";
import SpinnerMini from "./SpinnerMini";
import {toast} from "react-hot-toast"
export default function SubscribeForm(){
    const [isPending, startTransition] = useTransition();
    const handleSubmit = async (formData) => {
        startTransition(async () => {
            const result = await submitSubscribe(formData);
            if(result.success) {
                toast.success(result.data.message)
            } else {
                toast.error(result.data.message)
            };  
        })
    }
    
    return (
        <form className="flex flex-col space-y-4 font-mono" action={handleSubmit}>
            <input type="email" required name="email" placeholder="Enter you email address"  className="px-4 py-5 bg-white rounded-lg focus:outline-secondary"/>
            <button disabled={isPending} className="p-4 flex space-x-2 items-center justify-center font-bold text-base bg-secondary rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:filter"><span>Subscribe Now</span> <span>{isPending && <SpinnerMini/>}</span></button>
        </form>
    )
}