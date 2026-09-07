"use client";

import BackBtn from "@/app/_components/BackBtn";
import Logo from "@/app/_components/Logo";
import FormInput from "@/app/_components/FormInput";
import { formatCurrency } from "@/app/_lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useState, useTransition, useEffect } from "react";
import SpinnerMini from "@/app/_components/SpinnerMini";
import toast from "react-hot-toast";

// Example statuses that Admin might be able to edit a booking to.
const bookingStatuses = [
    { id: "pending", label: "Pending" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "failed", label: "Failed" },
    { id: "cancelled", label: "Cancelled" }
];

export default function EditBookingForm({ booking }) {
    const { user, property, amount, payment_status, status, start_date, end_date, createdAt, id, _id } = booking;
    const currentStatus = (payment_status || status || "pending").toLowerCase();

    const [isPending, startTransition] = useTransition();

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            status: bookingStatuses.find(s => s.id === currentStatus)?.id || currentStatus,
            amount: amount || property?.property_price || "",
            start_date: start_date ? format(new Date(start_date), "yyyy-MM-dd") : "",
            end_date: end_date ? format(new Date(end_date), "yyyy-MM-dd") : ""
        }
    });

    const onSubmit = (data) => {
        startTransition(async () => {
            try {
                // UI Stub: A real implementation would call an update/edit endpoint here.
                // const payload = { ...data, bookingId: id || _id };
                // const res = await updateAdminBooking(payload);
                
                // Simulating a network request for the UI stub
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                toast.success("Booking updated successfully (UI Stub)");
            } catch (error) {
                toast.error(error.message || "Failed to update booking");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-12 w-full max-w-[796px] mx-auto pb-12">
            
            {/* Header */}
            <header className="flex flex-col items-center justify-center gap-4 relative w-full">
                <h2 className="text-3xl font-bold text-primary">Edit Booking</h2>
                <span className="text-gray-500 font-mono text-sm">ID: #{_id || id}</span>
            </header>

            {/* Content Area */}
            <div className="p-8 flex flex-col gap-10 bg-white rounded-xl shadow-sm">
                
                {/* 1. Modify Details Section */}
                <div className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold text-primary border-b border-gray-100 pb-2">Modify Details</h3>
                    <div className="flex flex-col gap-6">
                        <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                            <FormInput label="Booking Status" id="status">
                                <select 
                                    {...register("status", { required: "Status is required" })}
                                    className={`rounded-lg border bg-gray-50 px-4.5 py-3 focus:outline-none w-full capitalize text-gray-700 font-mono transition-colors ${errors.status ? "border-error" : "border-primary-200"}`}
                                >
                                    {bookingStatuses.map(s => (
                                        <option key={s.id} value={s.id}>{s.label}</option>
                                    ))}
                                </select>
                            </FormInput>

                            <FormInput label="Amount Paid (₦)" id="amount">
                                <input 
                                    type="number" 
                                    {...register("amount", { required: "Amount is required" })}
                                    className={`rounded-lg border bg-gray-50 px-4.5 py-3 focus:outline-none w-full text-gray-700 font-mono transition-colors ${errors.amount ? "border-error" : "border-primary-200"}`}
                                />
                            </FormInput>
                        </div>

                        <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                            <FormInput label="Start Date" id="start_date">
                                <input 
                                    type="date" 
                                    {...register("start_date")}
                                    className="rounded-lg border border-primary-200 bg-gray-50 px-4.5 py-3 focus:outline-none w-full text-gray-700 font-mono transition-colors"
                                />
                            </FormInput>
                            <FormInput label="End Date" id="end_date">
                                <input 
                                    type="date" 
                                    {...register("end_date")}
                                    className="rounded-lg border border-primary-200 bg-gray-50 px-4.5 py-3 focus:outline-none w-full text-gray-700 font-mono transition-colors"
                                />
                            </FormInput>
                        </div>
                    </div>
                </div>


                {/* 2. Read-only Contextual Info Section */}
                <div className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold text-primary border-b border-gray-100 pb-2">Reference Context</h3>
                    
                    <div className="flex flex-col gap-6">
                        <FormInput label="Tenant" id="ref_tenant">
                            <div className="flex items-center gap-4 bg-gray-50 px-4.5 py-3 rounded-lg border border-primary-200 w-full text-gray-700 font-mono">
                                <div className="w-8 h-8 relative rounded-full overflow-hidden shrink-0">
                                    <Image src={user?.display_picture ? `https://app.xpacy.com/src/upload/display_img/${user.display_picture}` : "/avatar.png"} alt="User" fill className="object-cover" unoptimized />
                                </div>
                                <span className="truncate">
                                    {user?.firstname ? `${user.firstname} ${user.lastname || ''}` : "Guest User"} 
                                    <span className="text-gray-400 font-normal ml-2 text-sm hidden sm:inline-block">({user?.email || "No Email"})</span>
                                </span>
                            </div>
                        </FormInput>
                        
                        <FormInput label="Property" id="ref_property">
                            <div className="flex items-center gap-4 bg-gray-50 px-4.5 py-3 rounded-lg border border-primary-200 w-full text-gray-700 font-mono">
                                {property?.images?.[0] ? (
                                    <div className="w-10 h-8 relative rounded overflow-hidden shrink-0">
                                        <Image src={`https://app.xpacy.com/src/upload/properties/${property.images[0]}`} alt="Property" fill className="object-cover" unoptimized />
                                    </div>
                                ) : (
                                    <div className="w-10 h-8 bg-gray-200 rounded shrink-0"></div>
                                )}
                                <span className="truncate">
                                    {property?.property_name || "Unknown Property"}
                                </span>
                            </div>
                        </FormInput>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="mt-4 pt-8 border-t border-primary-100 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isPending}
                        className="bg-primary hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-mono font-bold transition-colors shadow-md flex items-center justify-center min-w-[160px] cursor-pointer disabled:opacity-50"
                    >
                        {isPending ? <SpinnerMini /> : "Save Changes"}
                    </button>
                </div>

            </div>
        </form>
    );
}
