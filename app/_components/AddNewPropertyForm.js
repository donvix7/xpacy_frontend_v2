"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import ProgressBar from "./ProgressBar";
import SearchPropertyOwner from "./SearchPropertyOwner";
import FormInput from "./FormInput";
import { useForm } from "react-hook-form";

import { FaAngleLeft, FaAngleRight, FaNairaSign } from "react-icons/fa6";
import SelectAmeneties from "./SelectAmeneties";
import DragnDrop from './DragnDrop';
import CustomToogle from "./CustomToogle";
import axios from "axios";
import SpinnerMini from "./SpinnerMini";
import { url } from "../_lib/data-services";
import toast from "react-hot-toast";
import { progress } from "../_lib/utils";
import UploadingFileModal from "./UploadingFileModal";
import { useCompressImage } from "../_hooks/useCompressImage";
import { usePathname } from "next/navigation";
import { createProperty, updateProperty } from "../_lib/action";



// options for property type
const propertyType = [
    {
        id: 1,
        type: "Commercial",
    },
    {
        id: 2,
        type: "Residential",
    },
    {
        id: 3,
        type: "Terrace",
    },
    {
        id: 4,
        type: "Flat/Apartment",
    },
    {
        id: 5,
        type: "Duplex",
    },
    {
        id: 6,
        type: "Semi-detached",
    },
    {
        id: 7,
        type: "Fully-detached",
    },
    {
        id: 9,
        type: "Villa",
    },
    {
        id: 10,
        type: "Office Space",
    },
    {
        id: 11,
        type: "Conference room",
    },
    
];
// Options for availability status
const availabilityStatus = [
    {
        id: 1,
        status: "Available",
    },
    {
        id: 2,
        status: "Unavailable",
    },
    {
        id: 3,
        status: "Sold",
    },
];
const propertyStatus = [
    {
        id: 1,
        status: "Sale",
    },
    {
        id: 2,
        status: "Rent",
    },
    {
        id: 3,
        status: "Lease",
    },
    {
        id: 4,
        status: "Shortlet",
    },
];
const roomCount = [
    {
        id: 1,
        count: 1,
    },
    {
        id: 2,
        count: 2,
    },
    {
        id: 3,
        count: 3,
    },
    {
        id: 4,
        count: 4,
    },
    {
        id: 5,
        count: 5,
    },
    {
        id: 6,
        count: 6,
    },
];
const bathroomCounts = [
    {
        id: 1,
        count: 1,
    },
    {
        id: 2,
        count: 2,
    },
    {
        id: 3,
        count: 3,
    },
    {
        id: 4,
        count: 4,
    },
    {
        id: 5,
        count: 5,
    },
    {
        id: 6,
        count: 6,
    },
];
const toiletCounts = [
    {
        id: 1,
        count: 1,
    },
    {
        id: 2,
        count: 2,
    },
    {
        id: 3,
        count: 3,
    },
    {
        id: 4,
        count: 4,
    },
    {
        id: 5,
        count: 5,
    },
    {
        id: 6,
        count: 6,
    },
];
const parkingAreaCount = [
    {
        id: 1,
        count: "Fit 1 car",
    },
    {
        id: 2,
        count: "Fit 2 cars",
    },
    {
        id: 3,
        count: "Fit 3 cars",
    },
    {
        id: 4,
        count: "Fit 4 cars",
    },
    {
        id: 5,
        count: "Fit 5 cars",
    },
];
const AddNewPropertyForm = ({ 
    allOwners, 
    allCities, 
    token, 
    // HEAD props
    preSelectedOwner, 
    initialData, 
    isEditMode = false,
    // Incoming props
    propertyOwnerInfo = null, 
    disableSearch, 
    propertyObj = {},
    isReadOnly = false
}) => {
    // Merge props logic
    const effectiveOwner = preSelectedOwner || propertyOwnerInfo || null;
    // propertyObj defaults to {} which is truthy, so check if it has keys or just use logical OR if initialData is present
    const effectiveData = initialData || (Object.keys(propertyObj).length > 0 ? propertyObj : null) || {};

    const [activeStep, setActiveStep] = useState(effectiveOwner ? 2 : 1);
    const [propertyOwner, setPropertyOwner] = useState(() => effectiveOwner);
    const [propertyAmenities, setPropertyAmenities] = useState(() => effectiveData?.property_amenities || []);
    
    // Initialize files if editing (assuming initialData.images handles preview or we skip valid file check)
    // For now we might not pre-fill files as handling remote URLs in file input is complex, user can re-upload
    const [files, setFiles] = useState(() => effectiveData?.images || []); 
    const [isFeatured, setIsFeatured] = useState(() => effectiveData?.isFeatured || effectiveData?.is_featured || false);
    const [isPending, setIsPending] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [uploadingProgress, setUploadingProgress] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(0);
    const controllerRef = useRef(null);
    console.log(propertyObj)
    const { register, handleSubmit, formState: { errors }, reset, getValues, setValue } = useForm({
        defaultValues: {
            firstname: propertyOwner?.first_name,
            lastname: propertyOwner?.last_name,
            email: propertyOwner?.email,
            phone: propertyOwner?.phone || "",
            owner_address: propertyOwner?.address || "",
            // Property defaults from initialData/propertyObj
            property_name: effectiveData?.property_name || "",
            address: effectiveData?.address || "",
            state: effectiveData?.state || "",
            city: effectiveData?.city || "",
            property_type: effectiveData?.property_type || "",
            availability_status: effectiveData?.availability_status || "",
            property_price: effectiveData?.property_price || "",
            reserve_amount: effectiveData?.reserve_amount || "",
            property_status: effectiveData?.property_status || "",
            description: effectiveData?.description || "",
            total_bedrooms: effectiveData?.total_bedrooms || "",
            total_bathrooms: effectiveData?.total_bathrooms || "",
            total_toilets: effectiveData?.total_toilets || "",
            parking_area: effectiveData?.parking_area || "",
            property_square_area: effectiveData?.property_square_area || "",
            land_area: effectiveData?.land_area || "",
            virtual_tour_url: effectiveData?.virtual_tour_url || "",
            lat: effectiveData?.lat || "",
            long: effectiveData?.long || "",
        }
    });

    const onSubmit = (data) => {
        delete data.firstname;
        delete data.lastname;
        delete data.email;
        delete data.phone;
        delete data.owner_address;
        const propertyInfo = {
            ...data,
            property_owner_id: propertyOwner?.id,
            property_amenities: propertyAmenities,
            // Only update images if new ones are selected, otherwise backend should handle keeping old ones
            // If isEditMode and no new files, we might need a different strategy.
            // For MVP edit: requiring re-upload or handling distinct update logic. 
            // As per instructions, we prioritize "means to edit".
            images: files, 
            isFeatured: isFeatured,
            total_bathrooms: Number(data.total_bathrooms),
            total_bedrooms: Number(data.total_bedrooms),
            total_toilets: Number(data.total_toilets),
            property_price: Number(data.property_price),
            reserve_amount: Number(data.reserve_amount || 0),
            long: Number(data.long),
            lat: Number(data.lat),
        }
        if (!data.state) return toast.error("State is required");
        if (!data.property_type) return toast.error("Property Type is required");
        if (!data.availability_status) return toast.error("Availability Status is required");
        if (!data.property_status) return toast.error("Property Status is required");
        if (!data.total_bedrooms) return toast.error("Number of bedrooms is required");
        if (!data.total_bathrooms) return toast.error("Number of bathrooms is required");
        if (!data.total_toilets) return toast.error("Number of toilets is required");
        if (!data.parking_area) return toast.error("Parking Area is required");

        setIsPending(true);
        toast.promise(submitForm(propertyInfo), {
            loading: 'Adding new property...',
            success: (data) => {
                setActiveStep(1);
                setIsPending(false);
                if (!data.success) throw new Error(data.message || data.errors[0].message || "Failed to add property.");
                reset();
                setIsOpenModal(false);
                return "Property added successfully!";
            },
            error: (error) => {
                setIsPending(false);
                setIsOpenModal(false);
                if (error.message === "canceled" || error.message === "Upload cancelled") return "Upload cancelled.";
                return `${error.message || "Failed to add property."}`
            },
        })
    }
    const submitForm = async (propertyInfo) => {
        controllerRef.current = new AbortController();
        const formData = new FormData();
        Object.entries(propertyInfo).forEach(([key, value]) => {
            if (key === "property_amenities") {
                formData.append(key, JSON.stringify(value));
            } else if (Array.isArray(value)) {
                // Handle image arrays separately
                value.forEach((item) => {
                    formData.append(key, item); 
                });
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });
        const startTime = new Date();
        
        try {
            // We use axios directly here to maintain progress tracking, but we use the centralized structure logic
            const response = await axios({
                method: isEditMode ? 'PUT' : 'POST',
                url: isEditMode && initialData?.id 
                    ? `${url}/property/update-property/${initialData.id}` 
                    : `${url}/property/create-property`,
                data: formData,
                headers: {
                    Authorization: `Bearer ${token?.value}`,
                },
                signal: controllerRef.current.signal,
                onUploadProgress: (progressEvent) => progress(progressEvent, setIsOpenModal, setUploadingProgress, setEstimatedTime, startTime)
            });
            if (controllerRef.current.signal.aborted) throw new Error("Upload cancelled")

            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) {
                throw new Error("Upload cancelled");
            }
            console.log("Error submitting form:", error);
            throw new Error(error?.response?.data?.message || error.message || "An error occurred. Please try again.");
        }
    }

    useEffect(() => {
        if (propertyOwner) {
            setValue("firstname", propertyOwner.first_name || "");
            setValue("lastname", propertyOwner.last_name || "");
            setValue("email", propertyOwner.email || "");
            setValue("phone", propertyOwner.phone || "");
            setValue("owner_address", propertyOwner.address || "");
        }
    }, [propertyOwner, setValue]);

    useEffect(() => {
        // Files are managed inside DragnDrop's useCompressImage hook object URLs
    }, []);

    const pathname = usePathname();
    console.log(pathname.split("/")[2])

    return (
        <div className="flex flex-col gap-12 w-[796px] mx-auto pb-12">
            {/* Header */}
            <header className="flex flex-col items-center justify-center gap-4">
                <h2 className="text-3xl font-bold text-primary">
                    {
                        pathname.includes("property-details") || pathname.includes("/dashboard/property-owner/properties/") && !pathname.includes("/add") ? "Property Details" : 
                        pathname.includes("edit-property") || isEditMode ? "Edit Property" : 
                        "Add New Property"
                    }
                </h2>
                {pathname.includes("property-details") || (pathname.includes("/dashboard/property-owner/properties/") && !pathname.includes("/add")) || isEditMode ? null : <p className="font-mono">Fill in the correct detailed information for the new property.</p>}
            </header>
            {/* Progress bar */}
            <ProgressBar activeStep={activeStep} setActiveStep={setActiveStep} />
            {/* Form Steps */}
            <form className="p-6 flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
                {/* 1. Owner Info */}
                {activeStep === 1 && (
                    <>
                        <h3 className="text-lg">Owner Information</h3>
                        <SearchPropertyOwner disabled={disableSearch} propertyOwner={propertyOwner} setPropertyOwner={setPropertyOwner} allOwners={allOwners} />
                        <div className="flex flex-col gap-6">
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"First Name"} id={"firstname"} >
                                    <input disabled {...register("firstname", {
                                        required: "Please enter your first name"
                                    })} type={"text"} name={"firstname"} id={"firstname"} placeholder={"Enter your first name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.firstname ? "border-error" : "border-primary-200"}`} />
                                    {errors.firstname && <span className="-mt-2 text-xs text-error">{errors.firstname.message}</span>}
                                </FormInput>
                                <FormInput label={"Last Name"} id={"lastname"} >
                                    <input disabled {...register("lastname", {
                                        required: "Please enter your lastname"
                                    })} type={"text"} name={"lastname"} id={"lastname"} placeholder={"Enter your last name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lastname ? "border-error" : "border-primary-200"}`} />
                                    {errors.lastname && <span className="-mt-2 text-xs text-error">{errors.lastname.message}</span>}
                                </FormInput>
                            </div>
                            <FormInput label={"Email address"} id={"email"} >
                                <input disabled {...register("email", {
                                    required: "Email is required", pattern: {
                                        value: /\S+@\S+\.\S+/,
                                        message: "Provide a valid email address",
                                    }
                                })} type={"email"} name={"email"} id={"email"} placeholder={"Enter your email address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.phone ? "border-error" : "border-primary-200"}`} />
                                {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
                            </FormInput>
                            <FormInput label={"Phone number"} id={"phone"} >
                                <input disabled {...register("phone", {
                                    required: "Please enter your phone number"
                                })} type={"phone"} name={"phone"} id={"phone"} placeholder={"Enter your phone number"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.phone ? "border-error" : "border-primary-200"}`} />
                                {errors.phone && <span className="-mt-2 text-xs text-error">{errors.phone.message}</span>}
                            </FormInput>
                            <FormInput label={"Address"} id={"address"} >
                                <input disabled {...register("owner_address", {
                                    required: "Please enter an owner address"
                                })} type={"text"} name={"address"} id={"address"} placeholder={"Enter your address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.owner_address ? "border-error" : "border-primary-200"}`} />
                                {errors.owner_address && <span className="-mt-2 text-xs text-error">{errors.owner_address.message}</span>}
                            </FormInput>
                        </div>
                    </>
                )}
                {/* 2. Property Overview */}
                {activeStep === 2 && (
                    <>
                        <h3 className="text-lg">Property Overview</h3>
                        <div className="flex flex-col gap-6">
                            <FormInput label={"Property Name"} id={"property_name"} >
                                <input disabled={isReadOnly}  {...register("property_name", {
                                    required: "Property Name is required",
                                })} type={"text"} name={"property_name"} id={"property_name"} placeholder={"Enter your property name"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.property_name ? "border-error" : "border-primary-200"}`} />
                                {errors.property_name && <span className="-mt-2 text-xs text-error">{errors.property_name.message}</span>}
                            </FormInput>
                            <FormInput label={"Property Address"} id={"address"} >
                                <input disabled={isReadOnly}  {...register("address", {
                                    required: "Property Address is required",
                                })} type={"text"} name={"address"} id={"address"} placeholder={"Enter your property address"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.address ? "border-error" : "border-primary-200"}`} />
                                {errors.address && <span className="-mt-2 text-xs text-error">{errors.address.message}</span>}
                            </FormInput>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">

                                <FormInput label={"State"} id={"state"} >
                                    <select disabled={isReadOnly} {...register("state", {
                                        required: "State is required",
                                    })} type={"text"} name={"state"} id={"state"} placeholder={"Enter your state"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.state ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a state</option>
                                        {allCities.map(city => (
                                            <option key={city.id} value={city.location}>{city.location}</option>
                                        ))}
                                    </select>
                                    {errors.state && <span className="-mt-2 text-xs text-error">{errors.state.message}</span>}
                                </FormInput>
                                <FormInput label={"City/Town"} id={"city"} >
                                    <input disabled={isReadOnly}  {...register("city", {
                                        required: "City/Town is required",
                                    })} type={"text"} name={"city"} id={"city"} placeholder={"Enter your city/town"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.city ? "border-error" : "border-primary-200"}`} />
                                    {errors.city && <span className="-mt-2 text-xs text-error">{errors.city.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Property Type"} id={"property_type"} >
                                    <select disabled={isReadOnly} {...register("property_type", {
                                        required: "Property Type is required",
                                    })} name={"property_type"} id={"property_type"} placeholder={"Enter your property type"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.property_type ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a property type</option>
                                        {propertyType.map(item => (
                                            <option key={item.id} value={item.type}>{item.type}</option>
                                        ))}
                                    </select>
                                    {errors.property_type && <span className="-mt-2 text-xs text-error">{errors.property_type.message}</span>}
                                </FormInput>
                                <FormInput label={"Availability Status"} id={"availability_status"} >
                                    <select disabled={isReadOnly} {...register("availability_status", {
                                        required: "Availability Status is required",
                                    })} name={"availability_status"} id={"availability_status"} placeholder={"Enter your availability status"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.availability_status ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select an availability status</option>
                                        {availabilityStatus.map(item => (
                                            <option key={item.id} value={item.status}>{item.status}</option>
                                        ))}
                                    </select>
                                    {errors.availability_status && <span className="-mt-2 text-xs text-error">{errors.availability_status.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Property Price"} id={"property_price"} >
                                    <div className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.property_price ? "border-error" : "border-primary-200"}`}>
                                        <span><FaNairaSign /></span>
                                        <input disabled={isReadOnly}  {...register("property_price", {
                                            required: "Property Price is required",
                                        })} type={"number"} name={"property_price"} id={"property_price"} placeholder={"Enter your property price"} className={`focus:outline-none flex-1`} />
                                    </div>
                                    {errors.property_price && <span className="-mt-2 text-xs text-error">{errors.property_price.message}</span>}
                                </FormInput>
                                <FormInput label={"Reserve Amount"} id={"reserve_amount"} >
                                    <div className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.reserve_amount ? "border-error" : "border-primary-200"}`}>
                                        <span><FaNairaSign /></span>
                                        <input disabled={isReadOnly}  {...register("reserve_amount", {
                                            required: "Reserve Amount is required",
                                        })} type={"number"} name={"reserve_amount"} id={"reserve_amount"} placeholder={"Enter reserve amount"} className={`focus:outline-none flex-1`} />
                                    </div>
                                    {errors.reserve_amount && <span className="-mt-2 text-xs text-error">{errors.reserve_amount.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Property Status"} id={"property_status"} >
                                    <select disabled={isReadOnly} {...register("property_status", {
                                        required: "Property Status is required",
                                    })} name={"property_status"} id={"property_status"} placeholder={"Enter your property status"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.property_status ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a property status</option>
                                        {propertyStatus.map(item => (
                                            <option key={item.id} value={item.status}>{item.status}</option>
                                        ))}
                                    </select>
                                    {errors.property_status && <span className="-mt-2 text-xs text-error">{errors.property_status.message}</span>}
                                </FormInput>
                                <FormInput label={"Views"} id={"views"} >
                                    <input disabled={true} value={effectiveData?.views || 0} type={"number"} name={"views"} id={"views"} placeholder={"0"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200`} />
                                </FormInput>
                            </div>
                            <div className="md:flex-1 w-full flex flex-col space-y-2 font-mono">
                                <label htmlFor="description" className="text-sm text-black flex items-center gap-2">
                                    Property Description
                                    <span className="text-[10px] font-normal text-gray-500">(HTML Supported)</span>
                                </label>
                                <textarea 
                                    disabled={isReadOnly}
                                    {...register("description", {
                                        required: "Property Description is required",
                                    })}
                                    id="description"
                                    rows={12} 
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 resize-none focus:outline-none ${errors.description ? "border-error" : "border-primary-200"}`} 
                                    placeholder="Enter your property description here..." 
                                />
                                {errors.description && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.description.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
                )}
                {/* 3. Property Information */}
                {activeStep === 3 && (
                    <>
                        <h3 className="text-lg">Property Information</h3>
                        <div className="flex flex-col gap-6">
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Bedrooms"} id={"total_bedrooms"} >
                                    <select disabled={isReadOnly} {...register("total_bedrooms", {
                                        required: "Property Status is required",
                                    })} name={"total_bedrooms"} id={"total_bedrooms"} placeholder={"Enter your bedrooms"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.total_bedrooms ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a bedroom count</option>
                                        {roomCount.map(item => (
                                            <option key={item.id} value={item.count}>{item.count}</option>
                                        ))}
                                    </select>
                                    {errors.total_bedrooms && <span className="-mt-2 text-xs text-error">{errors.total_bedrooms.message}</span>}
                                </FormInput>
                                <FormInput label={"Bathrooms"} id={"total_bathrooms"} >
                                    <select disabled={isReadOnly} {...register("total_bathrooms", {
                                        required: "Property Status is required",
                                    })} name={"total_bathrooms"} id={"total_bathrooms"} placeholder={"Enter your bathrooms"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.total_bathrooms ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a bathroom count</option>
                                        {bathroomCounts.map(item => (
                                            <option key={item.id} value={item.count}>{item.count}</option>
                                        ))}
                                    </select>
                                    {errors.total_bathrooms && <span className="-mt-2 text-xs text-error">{errors.total_bathrooms.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Toilets"} id={"total_toilets"} >
                                    <select disabled={isReadOnly} {...register("total_toilets", {
                                        required: "Property Status is required",
                                    })} name={"total_toilets"} id={"total_toilets"} placeholder={"Enter your toilets"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.total_toilets ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a toilet count</option>
                                        {toiletCounts.map(item => (
                                            <option key={item.id} value={item.count}>{item.count}</option>
                                        ))}
                                    </select>
                                    {errors.total_toilets && <span className="-mt-2 text-xs text-error">{errors.total_toilets.message}</span>}
                                </FormInput>
                                <FormInput label={"Parking Area"} id={"parking_area"} >
                                    <select disabled={isReadOnly} {...register("parking_area", {
                                        required: "Property Status is required",
                                    })} name={"parking_area"} id={"parking_area"} placeholder={"Enter your parking area"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.parking_area ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a parking area</option>
                                        {parkingAreaCount.map(item => (
                                            <option key={item.id} value={item.count}>{item.count}</option>
                                        ))}
                                    </select>
                                    {errors.parking_area && <span className="-mt-2 text-xs text-error">{errors.parking_area.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Property size (square area)"} id={"property_square_area"} >
                                    <div className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.property_square_area ? "border-error" : "border-primary-200"}`}>
                                        <span>sqm2</span>
                                        <input disabled={isReadOnly}  {...register("property_square_area", {
                                            required: "Property size is required",
                                        })} type={"number"} name={"property_square_area"} id={"property_square_area"} placeholder={"Enter your property square area"} className={`focus:outline-none flex-1`} />
                                    </div>
                                    {errors.property_square_area && <span className="-mt-2 text-xs text-error">{errors.property_square_area.message}</span>}
                                </FormInput>
                                <FormInput label={"Land area"} id={"land_area"} >
                                    <div className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.land_area ? "border-error" : "border-primary-200"}`}>
                                        <span>sqm2</span>
                                        <input disabled={isReadOnly}  {...register("land_area", {
                                            required: "Land area is required",
                                        })} type={"number"} name={"land_area"} id={"land_area"} placeholder={"Enter your land area"} className={`focus:outline-none flex-1`} />
                                    </div>
                                    {errors.land_area && <span className="-mt-2 text-xs text-error">{errors.land_area.message}</span>}
                                </FormInput>
                            </div>
                            <SelectAmeneties readOnly={isReadOnly} propertyAmenities={propertyAmenities} setPropertyAmenities={setPropertyAmenities} />
                        </div>
                    </>
                )}
                {/* 4. Media */}
                {activeStep === 4 && (
                    <>
                        <h3 className="text-lg">Media</h3>
                        {pathname.split("/")[2] === "property-details" ?
                            <>
                                <p className="font-mono">Photos</p>
                                <div className="grid grid-cols-3 gap-x-6 gap-y-12">

                                    {files.map((file, index) => (
                                        <img key={index} src={`https://app.xpacy.com/src/upload/properties/${file}`} alt={`Property Image ${index + 1}`} className="object-cover rounded-lg" />
                                    ))}
                                </div>
                            </> :
                            <DragnDrop isReadOnly={isReadOnly} files={files} setFiles={setFiles} maxFiles={9} />}
                        <FormInput label={"Property Video Tour (Optional)"} id={"property_video_tour"} >
                            <input  {...register("virtual_tour_url", {
                                required: "Video Tour Link is required",
                            })} type={"text"} name={"virtual_tour_url"} id={"virtual_tour_url"} placeholder={"Enter your property video tour link"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.virtual_tour_url ? "border-error" : "border-primary-200"}`} />
                            {errors.virtual_tour_url && <span className="-mt-2 text-xs text-error">{errors.virtual_tour_url.message}</span>}
                        </FormInput>
                        <div className="flex flex-col gap-6">
                            <span className="font-mono font-medium">Location Coordinates <a className="text-blue-500 fonr-medium" href="https://www.latlong.net" target="_blank">(Get coordinates)</a></span>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Latitude"} id={"lat"} >
                                    <input disabled={isReadOnly}  {...register("lat", {
                                        required: "Latitude is required",
                                    })} type={"text"} name={"lat"} id={"lat"} placeholder={"Enter your property latitude"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lat ? "border-error" : "border-primary-200"}`} />
                                    {errors.lat && <span className="-mt-2 text-xs text-error">{errors.lat.message}</span>}
                                </FormInput>
                                <FormInput label={"Longitude"} id={"long"} >
                                    <input disabled={isReadOnly}  {...register("long", {
                                        required: "Longitude is required",
                                    })} type={"text"} name={"long"} id={"long"} placeholder={"Enter your property longitude"} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.long ? "border-error" : "border-primary-200"}`} />
                                    {errors.long && <span className="-mt-2 text-xs text-error">{errors.long.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex items-center justify-between font-mono">
                                <span>Feature this property</span>
                                <CustomToogle disabled={isReadOnly} checked={isFeatured} onChange={setIsFeatured} />
                            </div>
                        </div>
                    </>
                )}
                {/* Navigation Buttons */}
                <div className={`${activeStep > 1 ? "flex items-center justify-between" : "self-end"}`}>
                    {activeStep > 1 && (
                        <button 
                            type="button" 
                            onClick={() => setActiveStep(prev => prev > (preSelectedOwner ? 2 : 1) ? prev - 1 : (preSelectedOwner ? 2 : 1))} 
                            className={`bg-white px-4 py-2 font-mono text-primary rounded-lg hover:bg-primary-100/80 cursor-pointer transition flex items-center gap-2 ${activeStep === 2 && preSelectedOwner ? "invisible" : ""}`}
                        >
                        <span><FaAngleLeft /></span>
                        <span>Previous</span>
                    </button>)}
                    {activeStep < 4 ? (
                        <div type="button" onClick={() => setActiveStep(prev => prev < 4 ? prev + 1 : 4)} className="px-4 py-2 font-mono text-primary rounded-lg hover:bg-primary-100/80 cursor-pointer transition flex items-center gap-2">
                            <span>Next</span>
                            <span><FaAngleRight /></span>
                        </div>
                    ) : (
                        <>
                            {pathname.split("/")[2] === "property-details" ? null : (
                                <button disabled={isPending} type="submit" className=" px-4 py-2 bg-primary-200 font-mono text-primary rounded-lg hover:bg-primary-200/80 cursor-pointer transition flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <span>Finish</span>
                                    {isPending && <span><SpinnerMini /></span>}
                                </button>
                            )}
                        </>

                    )}
                </div>
            </form>
            <UploadingFileModal
                isOpenModal={isOpenModal}
                setIsOpenModal={setIsOpenModal}
                uploadingProgress={uploadingProgress}
                estimatedTime={estimatedTime}
                controller={controllerRef.current}
            />
        </div>
    );
};

export default AddNewPropertyForm;