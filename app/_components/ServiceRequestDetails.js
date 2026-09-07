"use client";

import { format } from "date-fns";
import { HiOutlineDotsVertical } from "react-icons/hi";
import ServiceTimeline from "./ServiceTimeline";
import Link from "next/link";

export default function ServiceRequestDetails({ service }) {
    if (!service) return <div className="p-8 text-center text-gray-500 font-mono">Service request not found.</div>;

    const {
        service_type,
        service_status,
        address,
        scheduled_date,
        scheduled_time,
        service_description,
        building_type,
        user,
        assigned_provider,
        serviceProvider,
        createdAt
    } = service;

    const dateIssued = createdAt ? format(new Date(createdAt), "dd/MM/yy") : "N/A";
    const timeIssued = createdAt ? format(new Date(createdAt), "h:mma").toLowerCase() : "N/A";

    const timeline = [
        {
            date: createdAt ? format(new Date(createdAt), "MMM d, yyyy, h:mm a") : "",
            event: "Service request submitted by tenant.",
            completed: true
        },
        {
            date: createdAt ? format(new Date(createdAt), "MMM d, yyyy, h:mm a") : "",
            event: "Request reviewed by admin.",
            completed: true
        },
        {
            date: serviceProvider || assigned_provider ? "Just now" : "",
            event: serviceProvider || assigned_provider ? `${serviceProvider || assigned_provider} assigned to the job.` : "Provider assignment pending.",
            completed: !!(serviceProvider || assigned_provider)
        },
        {
            date: scheduled_date ? `${format(new Date(scheduled_date), "MMM d, yyyy")}, ${scheduled_time}` : "",
            event: "Service scheduled for repair to commence.",
            completed: !!scheduled_date
        }
    ].filter(item => item.date !== "");

    return (
        <div className="flex flex-col gap-10 pb-20 max-w-[800px] mx-auto">
            {/* Header Title and Dots */}
            <div className="flex items-center justify-between">
                <h1 className="text-[2.5rem] font-bold text-primary-900 font-mono tracking-tight">Service Request Details</h1>
                <button className="text-2xl text-gray-400 hover:text-gray-600 transition-colors">
                    <HiOutlineDotsVertical />
                </button>
            </div>

            {/* Issued Info */}
            <div className="flex items-center justify-between text-sm text-gray-500 font-mono">
                <p>Date Issued: {dateIssued}</p>
                <p>Time Issued: {timeIssued}</p>
            </div>

            {/* Form Content */}
            <div className="flex flex-col gap-8 mt-4">
                {/* Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldGroup label="First Name">
                        <input disabled value={user?.firstname || "N/A"} className="field-input" />
                    </FieldGroup>
                    <FieldGroup label="Last Name">
                        <input disabled value={user?.lastname || "N/A"} className="field-input" />
                    </FieldGroup>
                </div>

                {/* Email */}
                <FieldGroup label="Email">
                    <input disabled value={user?.email || "N/A"} className="field-input" />
                </FieldGroup>

                {/* Phone */}
                <FieldGroup label="Phone number">
                    <input disabled value={user?.phone_number || user?.phone || "N/A"} className="field-input" />
                </FieldGroup>

                {/* Address */}
                <FieldGroup label="Address">
                    <input disabled value={address || "N/A"} className="field-input" />
                </FieldGroup>

                {/* Service/Building Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldGroup label="Service Type">
                        <input disabled value={service_type || "N/A"} className="field-input" />
                    </FieldGroup>
                    <FieldGroup label="Building Type">
                        <input disabled value={building_type || "Residential"} className="field-input" />
                    </FieldGroup>
                </div>

                {/* Schedule Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldGroup label="Scheduled date">
                        <input disabled value={scheduled_date ? format(new Date(scheduled_date), "d/MM/yy") : "N/A"} className="field-input" />
                    </FieldGroup>
                    <FieldGroup label="Scheduled time">
                        <input disabled value={scheduled_time || "N/A"} className="field-input" />
                    </FieldGroup>
                </div>

                {/* Additional Information */}
                <FieldGroup label="Additional Information">
                    <textarea 
                        disabled 
                        value={service_description || "No additional information provided."} 
                        className="field-input h-32 resize-none leading-relaxed" 
                    />
                </FieldGroup>

                <Link href="#" className="text-primary font-bold font-mono underline text-sm mt-[-16px]">
                    View Attachments
                </Link>
            </div>

            <hr className="border-gray-100" />

            {/* Service Provider Details OR Assign Button */}
            {serviceProvider || assigned_provider ? (
                <div className="flex flex-col gap-8">
                    <h2 className="text-2xl font-bold text-primary-900 font-mono">Service provider details</h2>
                    
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center">
                            <span className="w-40 text-sm text-gray-500 font-mono">Service Provider</span>
                            <div className="flex-1">
                                <input disabled value={serviceProvider || assigned_provider} className="field-input" />
                            </div>
                        </div>

                        <div className="flex items-start">
                            <span className="w-40 text-sm text-gray-500 font-mono mt-4">Contact Info</span>
                            <div className="flex-1 flex flex-col gap-4">
                                <input disabled value={service.provider_phone || "+234 0000000000"} className="field-input" />
                                <input disabled value={service.provider_email || "N/A"} className="field-input" />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <span className="w-40 text-sm text-gray-500 font-mono">Service status</span>
                            <div className="flex-1">
                                <input disabled value={service_status || "Pending"} className="field-input capitalize" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button className="px-6 py-2.5 border border-gray-400 rounded-lg text-sm font-bold font-mono hover:bg-gray-50 transition-all">
                            Edit Service Status
                        </button>
                    </div>

                    <hr className="border-gray-100" />
                    {/* Timeline Section */}
                    <ServiceTimeline timeline={timeline} />
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    <Link href={`/admin/assign-service-provider`}>
                    <button className="w-full bg-[#1e293b] text-white py-4 rounded-lg flex items-center justify-center gap-3 font-bold font-mono hover:bg-[#0f172a] transition-all">
                            <span className="text-xl flex items-center gap-3">
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                <span>Assign Service Provider</span>
                            </span>
                    </button>
                    </Link>
                </div>
            )}

            <style jsx>{`
                .field-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background-color: #fcfcfc;
                    border: 1px solid #f1f1f1;
                    border-radius: 0.5rem;
                    color: #1a1a1a;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                    font-size: 0.875rem;
                }
                .field-input:disabled {
                    cursor: default;
                }
            `}</style>
        </div>
    );
}

function FieldGroup({ label, children }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-500 font-mono">{label}</label>
            {children}
        </div>
    );
}
