"use client"

import { useTransition } from "react";
import FormInput from "./FormInput"
import { useForm } from "react-hook-form";
import SpinnerMini from "./SpinnerMini";

export default function SupportForm({profile}) {
        const [pending, startTransition] = useTransition();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            firstname: profile?.firstname,
            lastname: profile?.lastname,
            email: profile?.email,
        }
    })
    async function onSubmit(data) {
        startTransition(async () => {
            // const response = await updateUserProfile(data);
            // if (response.success) {
            //     toast.success(response.message)
            // };
            // if (!response.success) toast.error(response.message);
        });
    }
    return (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div className="w-full flex lg:items-center flex-col lg:flex-row gap-4">
                <FormInput label={"First Name"} id={"firstname"} >
                    <input  {...register("firstname", {
                        required: "Please enter your first name"
                    })} type={"text"} name={"firstname"} id={"firstname"} placeholder={"Enter your first name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.firstname ? "border-error" : "border-primary-200"} disabled:bg-gray-200 disabled:cursor-not-allowed`} />
                    {errors.firstname && <span className="-mt-2 text-xs text-error">{errors.firstname.message}</span>}
                </FormInput>
                <FormInput label={"Last Name"} id={"lastname"} >
                    <input  {...register("lastname", {
                        required: "Please enter your lastname"
                    })} type={"text"} name={"lastname"} id={"lastname"} placeholder={"Enter your last name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lastname ? "border-error" : "border-primary-200"} disabled:bg-gray-200 disabled:cursor-not-allowed`} />
                    {errors.lastname && <span className="-mt-2 text-xs text-error">{errors.lastname.message}</span>}
                </FormInput>
            </div>
            <FormInput register={register} errors={errors} label={"Email address"} id={"email"} >
                <input disabled {...register("email", {
                    required: "Email is required", pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Provide a valid email address",
                    }
                })} type={"email"} name={"email"} id={"email"} placeholder={"Enter your email address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.email ? "border-error" : "border-primary-200"} disabled:bg-gray-200 disabled:cursor-not-allowed`} />
                {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
            </FormInput>
            <FormInput label={"Subject"} id={"subject"} >
                <input {...register("subject", {
                })} type={"text"} name={"subject"} id={"subject"} placeholder={"Enter the subject of your message"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.subject ? "border-error" : "border-primary-200"}`} />
                {errors.subject && <span className="-mt-2 text-xs text-error">{errors.subject.message}</span>}
            </FormInput>
            <FormInput label={"How can we help?"} id={"message"} >
                <textarea {...register("message", {
                    required: "Please enter your message"
                })} name={"message"} id={"message "} placeholder={"Type your message here"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.message ? "border-error" : "border-primary-200"}`}></textarea>
            </FormInput>
                <button type="submit" disabled={pending} className="bg-primary text-white  cursor-pointer  px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md disabled:bg-gray-900 disabled:cursor-not-allowed"> <span>Save A Message</span> <span>{pending && <SpinnerMini />}</span> </button>
        </form>
    )
}