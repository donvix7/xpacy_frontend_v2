"use client";
import { useForm } from "react-hook-form";
import FormInput from "./FormInput";
import SpinnerMini from "./SpinnerMini";
import { useTransition } from "react";
import { handleRegisterOwner } from "../_lib/action";
import toast from "react-hot-toast";


export default function AddNewOwnerForm() {
    const [pending, startTransition] = useTransition();
    const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm()
    async function onSubmit(data) {
        startTransition(async () => {
            const response = await handleRegisterOwner(data);
            if (response.success) {
                toast.success(response.message)
                reset();
            };
            if (!response.success) toast.error(response.message);
        });
    }
    return (
        <div className="flex w-[539px]  p-16">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4  rounded-lg border border-primary-100 shadow-2xs p-6 font-mono">
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold">Create New Property Owner Account</h3>
                    <p className="text-neutral-700">Enter property owner’s details</p>
                </div>
                <FormInput label={"First Name"} id={"first_name"} >
                    <input {...register("first_name", {
                        required: "Please enter owner's first name"
                    })} type={"text"} name={"first_name"} id={"first_name"} placeholder={"Enter owner's first name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.first_name ? "border-error" : "border-primary-200"}`} />
                    {errors.first_name && <span className="-mt-2 text-xs text-error">{errors.first_name.message}</span>}
                </FormInput>
                <FormInput label={"Last Name"} id={"last_name"} >
                    <input {...register("last_name", {
                        required: "Please enter owner's last_name"
                    })} type={"text"} name={"last_name"} id={"last_name"} placeholder={"Enter owner's last name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.last_name ? "border-error" : "border-primary-200"}`} />
                    {errors.last_name && <span className="-mt-2 text-xs text-error">{errors.last_name.message}</span>}
                </FormInput>
                <FormInput register={register} errors={errors} label={"Email address"} id={"email"} >
                    <input {...register("email", {
                        required: "Email is required", pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Provide a valid email address",
                        }
                    })} type={"email"} name={"email"} id={"email"} placeholder={"Enter owner's email address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.email ? "border-error" : "border-primary-200"}`} />
                    {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
                </FormInput>
                <div className="self-end">
                    <button type="submit" disabled={pending} className="bg-primary text-white  cursor-pointer  px-3 py-2 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md disabled:bg-gray-900 disabled:cursor-not-allowed"> <span>Submit</span> <span>{pending && <SpinnerMini />}</span> </button>
                </div>
            </form>
        </div>
    )
}