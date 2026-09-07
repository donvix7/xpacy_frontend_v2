"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import ProgressBar from "./ProgressBar";
import FormInput from "./FormInput";
import SpinnerMini from "./SpinnerMini";
import toast from "react-hot-toast";
import { invitePropertyOwner } from "../_lib/action";
import { FaAngleLeft, FaAngleRight, FaEnvelopeOpenText } from "react-icons/fa6";

const inviteSteps = [
    { step: 1, label: "Owner Info" },
    { step: 2, label: "Invitation" },
    { step: 3, label: "Review & Send" },
];

const defaultMessage = "You have been invited to join Xpacy as a property owner. Please sign up to manage your properties.";

const InviteOwnerForm = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [isPending, setIsPending] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
            phone: "",
            message: defaultMessage,
        }
    });

    const watched = watch();

    const onSubmit = async (data) => {
        setIsPending(true);
        const formData = new FormData();
        formData.append("name", `${data.firstname} ${data.lastname}`);
        formData.append("email", data.email);
        formData.append("message", data.message || defaultMessage);

        toast.promise(invitePropertyOwner(formData), {
            loading: "Sending invitation...",
            success: () => {
                setIsPending(false);
                setActiveStep(1);
                reset();
                return "Invitation sent successfully!";
            },
            error: (error) => {
                setIsPending(false);
                return error?.message || "Failed to send invitation.";
            },
        });
    };

    return (
        <div className="flex flex-col gap-12 w-[796px] mx-auto pb-12">
            {/* Header */}
            <header className="flex flex-col items-center justify-center gap-4">
                <h2 className="text-3xl font-bold text-primary">Invite Property Owner</h2>
                <p className="font-mono">Send an invitation email to onboard a new property owner.</p>
            </header>
            {/* Progress bar */}
            <ProgressBar activeStep={activeStep} setActiveStep={setActiveStep} steps={inviteSteps} />
            {/* Form Steps */}
            <form className="p-6 flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
                {/* 1. Owner Info */}
                {activeStep === 1 && (
                    <>
                        <h3 className="text-lg">Owner Information</h3>
                        <div className="flex flex-col gap-6">
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"First Name"} id={"firstname"} >
                                    <input {...register("firstname", {
                                        required: "Please enter your first name"
                                    })} type={"text"} name={"firstname"} id={"firstname"} placeholder={"Enter your first name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.firstname ? "border-error" : "border-primary-200"}`} />
                                    {errors.firstname && <span className="-mt-2 text-xs text-error">{errors.firstname.message}</span>}
                                </FormInput>
                                <FormInput label={"Last Name"} id={"lastname"} >
                                    <input {...register("lastname", {
                                        required: "Please enter your last name"
                                    })} type={"text"} name={"lastname"} id={"lastname"} placeholder={"Enter your last name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lastname ? "border-error" : "border-primary-200"}`} />
                                    {errors.lastname && <span className="-mt-2 text-xs text-error">{errors.lastname.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Email address"} id={"email"} >
                                    <input {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /\S+@\S+\.\S+/,
                                            message: "Provide a valid email address",
                                        }
                                    })} type={"email"} name={"email"} id={"email"} placeholder={"Enter your email address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.email ? "border-error" : "border-primary-200"}`} />
                                    {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
                                </FormInput>
                                <FormInput label={"Phone number"} id={"phone"} >
                                    <input {...register("phone")} type={"phone"} name={"phone"} id={"phone"} placeholder={"Enter your phone number"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200`} />
                                </FormInput>
                            </div>
                        </div>
                    </>
                )}
                {/* 2. Invitation */}
                {activeStep === 2 && (
                    <>
                        <h3 className="text-lg">Invitation</h3>
                        <div className="flex flex-col gap-6">
                            <div className="flex gap-4 items-center p-4 rounded-lg border border-primary-100 bg-primary-100/40 font-mono text-sm text-gray-700">
                                <span className="text-xl text-primary"><FaEnvelopeOpenText /></span>
                                <p>An invitation email will be sent to <span className="font-bold text-primary">{watched.email || "the owner's email"}</span> with a link to join Xpacy as a property owner.</p>
                            </div>
                            <div className="md:flex-1 w-full flex flex-col space-y-2 font-mono">
                                <label htmlFor="message" className="text-sm text-black flex items-center gap-2">
                                    Invitation Message
                                    <span className="text-[10px] font-normal text-gray-500">(Optional)</span>
                                </label>
                                <textarea
                                    {...register("message")}
                                    id="message"
                                    rows={8}
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 resize-none focus:outline-none border-primary-200`}
                                    placeholder="Write a personal invitation message..."
                                />
                            </div>
                        </div>
                    </>
                )}
                {/* 3. Review & Send */}
                {activeStep === 3 && (
                    <>
                        <h3 className="text-lg">Review & Send</h3>
                        <div className="flex flex-col divide-y divide-gray-100 rounded-lg border border-primary-100 overflow-hidden">
                            <div className="flex items-center justify-between p-4 font-mono text-sm">
                                <span className="text-gray-500">Full Name</span>
                                <span className="font-bold text-gray-900">{watched.firstname} {watched.lastname}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 font-mono text-sm">
                                <span className="text-gray-500">Email</span>
                                <span className="font-bold text-gray-900">{watched.email}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 font-mono text-sm">
                                <span className="text-gray-500">Phone</span>
                                <span className="font-bold text-gray-900">{watched.phone || "—"}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4 p-4 font-mono text-sm">
                                <span className="text-gray-500 shrink-0">Message</span>
                                <span className="font-semibold text-gray-700 text-right">{watched.message || defaultMessage}</span>
                            </div>
                        </div>
                    </>
                )}
                {/* Navigation Buttons */}
                <div className={`${activeStep > 1 ? "flex items-center justify-between" : "self-end"}`}>
                    {activeStep > 1 && (
                        <button
                            type="button"
                            onClick={() => setActiveStep(prev => prev - 1)}
                            className="bg-white px-4 py-2 font-mono text-primary rounded-lg hover:bg-primary-100/80 cursor-pointer transition flex items-center gap-2"
                        >
                            <span><FaAngleLeft /></span>
                            <span>Previous</span>
                        </button>
                    )}
                    {activeStep < 3 ? (
                        <div type="button" onClick={() => setActiveStep(prev => prev + 1)} className="px-4 py-2 font-mono text-primary rounded-lg hover:bg-primary-100/80 cursor-pointer transition flex items-center gap-2">
                            <span>Next</span>
                            <span><FaAngleRight /></span>
                        </div>
                    ) : (
                        <button disabled={isPending} type="submit" className="px-4 py-2 bg-primary-200 font-mono text-primary rounded-lg hover:bg-primary-200/80 cursor-pointer transition flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <span>Send Invitation</span>
                            {isPending && <span><SpinnerMini /></span>}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default InviteOwnerForm;