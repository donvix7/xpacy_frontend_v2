"use client"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form";
import FormInput from "./FormInput";
import DatePicker from "react-datepicker";
import { FiUpload } from "react-icons/fi";
import "react-datepicker/dist/react-datepicker.css";
import SpinnerMini from "./SpinnerMini";
import { format } from "date-fns";
import { handleBookService } from "../_lib/action";
import toast from "react-hot-toast";


const services = ["Plumbing Services", "Painting and Wall Care", "Security Guard Services", "Lanscaping And Lawn Care", "Waste Management", "Electrical repairs"]
const buildingTypes = ["Commercial", "Residential"]
const BookServiceForm = ({user}) => {
    const [selectedDate, setSelectedDate] = useState("");
    const [pending, startTransition] = useTransition()
    const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm({defaultValues: {
        email: user?.email,
        firstname: user?.firstname,
        lastname: user?.lastname,
    }});
    const onSubmit = (data) => {
        const formData = {...data, scheduled_date: format(selectedDate, "MM/dd/yyyy")};
        startTransition(async () => {
            const response  = await handleBookService(formData);
            if(response.success) {
                toast.success(response.message || "Service request submitted successfully")
            } else {
                toast.error(response.message || "Failed to submit service request. Please try again.")
            }
        })
        reset();
        setSelectedDate("")
    }
    return (
        <div className="flex flex-col gap-12 lg:px-6">
            <form className="p-6 flex flex-col  gap-12 max-w-[769px]" onSubmit={handleSubmit(onSubmit)}>
                <header className="flex flex-col gap-4 text-center">
                    <h1 className="text-primary text-3xl font-bold">Ready To Experience Ease?</h1>
                    <p className="font-mono">Need us to manage your facility? Kindly fill out the form below, and we&apos;ll get back to you shortly.</p>
                </header>
                {/* firstName and lastName */}
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
                {/* email */}
                <FormInput register={register} errors={errors} label={"Email address"} id={"email"} >
                    <input {...register("email", {
                        required: "Email is required", pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Provide a valid email address",
                        }
                    })} type={"email"} name={"email"} id={"email"} disabled placeholder={"Enter your email address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${errors.email ? "border-error" : "border-primary-200"}`} />
                    {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
                </FormInput>
                {/* PropertyAddress */}
                <FormInput register={register} errors={errors} label={"Property address"} id={"email"} >
                    <input {...register("address", {
                        required: "Please enter your property address"
                    })} type={"text"} name={"address"} id={"address"} placeholder={"Enter your property address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.address ? "border-error" : "border-primary-200"}`} />
                    {errors.address && <span className="-mt-2 text-xs text-error">{errors.address.message}</span>}
                </FormInput>
                {/* Service type and building type */}
                <div className="flex-1 flex md:items-center items-start gap-6 flex-col md:flex-row">
                    {/* Service type */}
                    <div className="flex-1 w-full flex flex-col space-y-2 font-mono">
                        <label htmlFor={"service-type"} className="text-sm text-black">Service Type</label>
                        <select {...register("service_type", { required: "Please choose a type of service" })} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.service_type ? "border-error" : "border-primary-200"}`}>
                            <option value={""}>Choose a service</option>
                            {
                                services?.map((service) => {
                                    return <option key={service} name="service">{service}</option>
                                })
                            }
                        </select>
                        {errors.service_type && <span className="-mt-2 text-xs text-error">{errors.service_type.message}</span>}
                    </div>
                    {/* Building type */}
                    <div className="flex-1 w-full flex flex-col space-y-2 font-mono">
                        <label htmlFor={"service-type"} className="text-sm text-black">Building Type</label>
                        <select {...register("building_type", { required: "Please choose a type of building" })} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.building_type ? "border-error" : "border-primary-200"}`}>
                            <option value={""}>Choose type of building</option>
                            {
                                buildingTypes?.map((buildingType) => {
                                    return <option key={buildingType} name="building_type">{buildingType}</option>
                                })
                            }
                        </select>
                        {errors.building_type && <span className="-mt-2 text-xs text-error">{errors.building_type.message}</span>}
                    </div>
                </div>
                {/* Service date and time */}
                <div className="flex-1 flex md:items-center items-start gap-6 flex-col md:flex-row">
                    {/* Schedule Service Visit */}
                    <div className="lg:flex-1 w-full flex flex-col space-y-2 font-mono">
                        <label htmlFor={"service-type"} className="text-sm text-black">Schedule Service Visit</label>
                        <div className={`rounded-lg border bg-[#FCFEFF] focus:outline-none border-primary-200`}>
                            <DatePicker selected={selectedDate}
                                onChange={setSelectedDate}
                                placeholderText="Choose a date"
                                className="px-4.5 py-3 w-full focus:outline-none"
                            />
                        </div>
                    </div>
                    {/* Schedule Visit Time */}
                    <div className="flex-1 w-full flex flex-col space-y-2 font-mono">
                        <label htmlFor={"service-type"} className="text-sm text-black">Schedule Visit Time</label>
                        <div className={`rounded-lg border bg-[#FCFEFF]  focus:outline-none ${errors.scheduled_time ? "border-error" : "border-primary-200"}`}>
                            <input type="time" className="peer w-full px-4.5 py-3" {...register("scheduled_time", { required: "Please choose a scheduled time" })} />
                        </div>
                        {errors.scheduled_time && <span className="-mt-2 text-xs text-error">{errors.scheduled_time.message}</span>}
                    </div>

                </div>
                <div className="flex flex-col gap-2 font-mono">
                    <label className="text-md">Additional Information</label>
                    <p className="text-sm text-neutral-900">(Kindly include the description of your service request. E.g. a full cleaning service for a 3-bedroom and 4-bathroom apartment, including the balcony and staircase area.) </p>
                    <textarea name="service_description"
                        {...register("service_description", { required: "Please provide a description for the service here" })}
                        className={`h-50 rounded-lg border flex-1  px-3 py-2 ${errors.service_description ? "border-error" : "border-primary-200"}`}
                        placeholder="Type your message here">

                    </textarea>
                    {errors.service_description &&
                        <span className="-mt-2 text-xs text-error">{errors.service_description.message}</span>}
                </div>
                {/* Attachment */}
                <button type="button" className="flex items-center gap-2 text-primary font-mono font-bold text-sm lg:text-md">
                    <span className="text-[20px]"><FiUpload /></span>
                    <span>Attach necessary documents/photos <span className="text-neutral-900">(if applicable)</span> </span>
                </button>
                <button type="submit" disabled={pending} className="bg-primary text-white  cursor-pointer  px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-primary-900 ">
                    <span>Submit Service Request</span>
                    <span>{pending && <SpinnerMini />} </span>
                </button>
            </form>
        </div>
    );
};

export default BookServiceForm;