"use client"
import { useForm } from "react-hook-form";
import SelectCity from "./SelectCity";
import { useTransition } from "react";
import { updateUserProfile } from "../_lib/action";
import SpinnerMini from "./SpinnerMini";
import toast from "react-hot-toast";

export default function LocationForm({ profile, cities, updateAction }) {
    const [pending, startTransition] = useTransition()
    const { handleSubmit, register, formState: { errors } } = useForm({
        defaultValues: {
            state: profile?.state
        }
    })
    async function onSubmit(data) {
        startTransition(async () => {
             const action = updateAction || updateUserProfile;
            const response = await action(data);
            if (response.success) {
                toast.success(response.message)
            };
            if (!response.success) toast.error(response.message);
        })
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className=" flex flex-col space-y-2 font-mono">
                <label htmlFor={"location"} className="text-sm text-black">Choose a location</label>
                <SelectCity cities={cities} register={register} errors={errors} />
            </div>
            <div className="flex items-center justify-center gap-4 mt-6 ">
                <button type="submit" disabled={pending} className="bg-primary text-white  cursor-pointer  px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md disabled:bg-gray-900 disabled:cursor-not-allowed"> <span>Save Changes</span> <span>{pending && <SpinnerMini />}</span> </button>
            </div>
        </form>
    )
}