"use client"
import { useForm } from "react-hook-form";
import FormInput from "./FormInput";
import { useTransition } from "react";
import SpinnerMini from "./SpinnerMini";
import { updateUserProfile } from "../_lib/action";
import toast from "react-hot-toast";


export default function ProfileForm({ profile, updateAction }) {
    const [pending, startTransition] = useTransition();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            firstname: profile?.firstname,
            lastname: profile?.lastname,
            email: profile?.email,
            phone_number: profile?.phone_number,
            address: profile?.address,
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
        });
    }
    return (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div className="w-full flex lg:items-center flex-col lg:flex-row gap-4">
                <FormInput label={"First Name"} id={"firstname"} >
                    <input {...register("firstname", {
                        required: "Please enter your first name"
                    })} type={"text"} name={"firstname"} id={"firstname"} placeholder={"Enter your first name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.firstname ? "border-error" : "border-primary-200"}`} />
                    {errors.firstname && <span className="-mt-2 text-xs text-error">{errors.firstname.message}</span>}
                </FormInput>
                <FormInput label={"Last Name"} id={"lastname"} >
                    <input {...register("lastname", {
                        required: "Please enter your lastname"
                    })} type={"text"} name={"lastname"} id={"lastname"} placeholder={"Enter your last name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lastname ? "border-error" : "border-primary-200"}`} />
                    {errors.lastname && <span className="-mt-2 text-xs text-error">{errors.lastname.message}</span>}
                </FormInput>
            </div>
            <FormInput register={register} errors={errors} label={"Email address"} id={"email"} >
                <input disabled {...register("email", {
                    required: "Email is required", pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Provide a valid email address",
                    }
                })} type={"email"} name={"email"} id={"email"} placeholder={"Enter your email address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none disabled:bg-gray-200 disabled:cursor-not-allowed ${errors.email ? "border-error" : "border-primary-200"}`} />
                {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
            </FormInput>
            <FormInput label={"Phone number"} id={"phone"} >
                <input {...register("phone_number", {
                })} type={"tel"} name={"phone_number"} id={"phone"} placeholder={"+2340000000000"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.confirmPassword ? "border-error" : "border-primary-200"}`} />
                {errors.phone_number && <span className="-mt-2 text-xs text-error">{errors.phone_number.message}</span>}
            </FormInput>
            <FormInput label={"Address"} id={"address"} >
                <input {...register("address", {
                    required: "Please enter your lastname"
                })} type={"text"} name={"address"} id={"address"} placeholder={"Enter your address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.confirmPassword ? "border-error" : "border-primary-200"}`} />
                {errors.address && <span className="-mt-2 text-xs text-error">{errors.address.message}</span>}
            </FormInput>
            <div className="flex items-center justify-center gap-4 mt-6 ">
                <button type="submit" disabled={pending} className="bg-primary text-white  cursor-pointer  px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md disabled:bg-gray-900 disabled:cursor-not-allowed"> <span>Save Changes</span> <span>{pending && <SpinnerMini />}</span> </button>
            </div>
        </form>
    )
}