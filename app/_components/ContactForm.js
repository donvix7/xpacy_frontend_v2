"use client"

import { useForm } from "react-hook-form";
import FormInput from "./FormInput";
import SpinnerMini from "./SpinnerMini";
import { useState, useTransition } from "react";
import Modal from "./NetworkTriggerModal";
import { handleContact } from "../_lib/action";

const ContactForm = ({ user }) => {
    const [open, setOpen] = useState(false)
    const [pending, startTransition] = useTransition()
    const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm({
        defaultValues: {
            email: user?.email,
            firstname: user?.firstname,
            lastname: user?.lastname,
        }
    });
    const onSubmit = (data) => {
       startTransition(async () => {
        const res = await handleContact(data);
        if(res.success) {
            setOpen(true)
            reset()
        }
       })
    }
    return (
        <>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex-1 flex md:items-center items-start gap-6 flex-col md:flex-row">
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
                    <input {...register("email", {
                        required: "Email is required", pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Provide a valid email address",
                        }
                    })} type={"email"} name={"email"} id={"email"} placeholder={"Enter your email address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${errors.email ? "border-error" : "border-primary-200"}`} />
                    {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
                </FormInput>
                <FormInput register={register} errors={errors} label={"Phone Number"} id={"phone"} >
                    <input {...register("phone", {
                        required: "phone number is required"
                    })} type={"text"} name={"phone"} id={"phone"} placeholder={"+234 0000000000"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${errors.email ? "border-error" : "border-primary-200"}`} />
                    {errors.phone && <span className="-mt-2 text-xs text-error">{errors.phone.message}</span>}
                </FormInput>
                <div className="flex flex-col gap-2 font-mono">
                    <label className="text-md">How can we help?</label>
                    <textarea name="message"
                        {...register("message", { required: "Please tell us how we can help here" })}
                        className={`h-[136px] rounded-lg border  px-3 py-2 ${errors.message ? "border-error" : "border-primary-200"}`}
                        placeholder="Type your message here">
                    </textarea>
                    {errors.message && <span className="-mt-2 text-xs text-error">{errors.message.message}</span>}
                </div>
                <button type="submit" disabled={pending} className="mt-6 bg-primary text-white  cursor-pointer  px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-primary-900 ">
                    
                    <span>{pending ? <SpinnerMini /> : <span>Send A Message</span>} </span>
                </button>
            </form>
            <Modal open={open} onOpen={setOpen}>
                <Modal.Window>
                    <div className="lg:px-12 lg:pb-16 lg:pt-10 p-4 w-[300px] lg:w-[350px] rounded-lg space-y-2 font-mono">
                        <h3 className="font-bold text-md ">Thank you for contacting us!</h3>
                        <p>We will get back to you shortly.</p>
                    </div>
                </Modal.Window>
            </Modal>
        </>
    );
};

export default ContactForm;