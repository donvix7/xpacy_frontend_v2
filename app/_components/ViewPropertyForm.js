"use client";

import { useEffect, useState, useTransition, useRef, useCallback, useMemo } from "react";
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
import { usePathname } from "next/navigation";

// Move static data outside component to prevent re-renders
const propertyType = [
    { id: 1, type: "Commercial" },
    { id: 2, type: "Residential" },
    { id: 3, type: "Terrace" },
    { id: 4, type: "Flat/Apartment" },
    { id: 5, type: "Duplex" },
    { id: 6, type: "Semi-detached" },
    { id: 7, type: "Fully-detached" },
    { id: 9, type: "Villa" },
];

const availabilityStatus = [
    { id: 1, status: "Available" },
    { id: 2, status: "Unavailable" },
    { id: 3, status: "Sold" },
];

const propertyStatus = [
    { id: 1, status: "Sale" },
    { id: 2, status: "Rent" },
    { id: 3, status: "Lease" },
    { id: 4, status: "Shortlet" },
];

const bedroomCounts = [
    { id: 1, count: 1 },
    { id: 2, count: 2 },
    { id: 3, count: 3 },
    { id: 4, count: 4 },
    { id: 5, count: 5 },
    { id: 6, count: 6 },
];

const bathroomCounts = [
    { id: 1, count: 1 },
    { id: 2, count: 2 },
    { id: 3, count: 3 },
    { id: 4, count: 4 },
    { id: 5, count: 5 },
    { id: 6, count: 6 },
];

const toiletCounts = [
    { id: 1, count: 1 },
    { id: 2, count: 2 },
    { id: 3, count: 3 },
    { id: 4, count: 4 },
    { id: 5, count: 5 },
    { id: 6, count: 6 },
];

const parkingAreaCount = [
    { id: 1, count: "Fit 1 car" },
    { id: 2, count: "Fit 2 cars" },
    { id: 3, count: "Fit 3 cars" },
    { id: 4, count: "Fit 4 cars" },
    { id: 5, count: "Fit 5 cars" },
];

const EditPropertyForm = ({ 
    allOwners, 
    allCities, 
    token, 
    preSelectedOwner, 
    initialData, 
    isEditMode = false,
    propertyOwnerInfo = null, 
    disableSearch, 
    propertyObj = {},
    isReadOnly = false
}) => {
    // Simplify prop merging logic
    const effectiveOwner = preSelectedOwner || propertyOwnerInfo || null;
    const effectiveData = useMemo(() => {
        if (initialData && Object.keys(initialData).length > 0) return initialData;
        if (propertyObj && Object.keys(propertyObj).length > 0) return propertyObj;
        return {};
    }, [initialData, propertyObj]);

    // Calculate minimum step based on whether owner is pre-selected
    const minStep = effectiveOwner ? 2 : 1;
    const [activeStep, setActiveStep] = useState(effectiveOwner ? 2 : 1);
    const [propertyOwner, setPropertyOwner] = useState(() => effectiveOwner);
    const [propertyAmenities, setPropertyAmenities] = useState(() => effectiveData?.property_amenities || []);
    
    // Separate existing images URLs from new file objects
    const [existingImages, setExistingImages] = useState(() => {
        if (effectiveData?.images && Array.isArray(effectiveData.images)) {
            return effectiveData.images;
        }
        return [];
    });
    const [newFiles, setNewFiles] = useState([]);
    const [isFeatured, setIsFeatured] = useState(() => effectiveData?.isFeatured || effectiveData?.is_featured || false);
    const [isPending, setIsPending] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [uploadingProgress, setUploadingProgress] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(0);
    const controllerRef = useRef(null);
    const pathname = usePathname();
    
    // State for live preview
    const [showPreview, setShowPreview] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
        defaultValues: {
            firstname: propertyOwner?.first_name || "",
            lastname: propertyOwner?.last_name || "",
            email: propertyOwner?.email || "",
            phone: propertyOwner?.phone || "",
            owner_address: propertyOwner?.address || "",
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

    // Watch description for live preview
    const description = watch("description");

    // Navigation functions - simplified
    const goToPreviousStep = useCallback(() => {
        setActiveStep(prev => Math.max(prev - 1, minStep));
    }, [minStep]);

    const goToNextStep = useCallback(() => {
        setActiveStep(prev => Math.min(prev + 1, 4));
    }, []);

    // Handle file changes from DragnDrop
    const handleFilesChange = useCallback((files) => {
        setNewFiles(files);
    }, []);

    // Handle removing existing images
    const handleRemoveExistingImage = useCallback((indexToRemove) => {
        setExistingImages(prev => prev.filter((_, index) => index !== indexToRemove));
    }, []);

    // Helper function to insert HTML tags at cursor position
    const insertTag = (textarea, openTag, closeTag = "") => {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        
        let newText;
        if (selectedText) {
            newText = text.substring(0, start) + openTag + selectedText + closeTag + text.substring(end);
        } else {
            newText = text.substring(0, start) + openTag + closeTag + text.substring(end);
        }
        
        // Update the form value
        textarea.value = newText;
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
        
        // Set cursor position inside the tags
        setTimeout(() => {
            if (selectedText) {
                textarea.selectionStart = start + openTag.length;
                textarea.selectionEnd = end + openTag.length;
            } else {
                textarea.selectionStart = start + openTag.length;
                textarea.selectionEnd = start + openTag.length;
            }
            textarea.focus();
        }, 0);
    };

    const onSubmit = useCallback(async (data) => {
        // Remove owner fields from property data
        const { firstname, lastname, email, phone, owner_address, ...propertyData } = data;
        
        // Validation
        if (!data.state) return toast.error("State is required");
        if (!data.property_type) return toast.error("Property Type is required");
        if (!data.availability_status) return toast.error("Availability Status is required");
        if (!data.property_status) return toast.error("Property Status is required");
        if (!data.total_bedrooms) return toast.error("Number of bedrooms is required");
        if (!data.total_bathrooms) return toast.error("Number of bathrooms is required");
        if (!data.total_toilets) return toast.error("Number of toilets is required");
        if (!data.parking_area) return toast.error("Parking Area is required");
        if (!propertyOwner?.id) return toast.error("Property owner is required");

        // Handle images: In edit mode, only send new files if there are any
        let imagesToSend = [];
        
        if (isEditMode) {
            // For edit mode: send existing image URLs that weren't removed, plus new files
            imagesToSend = [...existingImages];
            if (newFiles.length > 0) {
                imagesToSend.push(...newFiles);
            }
        } else {
            // For create mode: only send new files
            imagesToSend = newFiles;
        }

        const propertyInfo = {
            ...propertyData,
            property_owner_id: propertyOwner.id,
            property_amenities: propertyAmenities,
            isFeatured: isFeatured,
            total_bathrooms: Number(data.total_bathrooms),
            total_bedrooms: Number(data.total_bedrooms),
            total_toilets: Number(data.total_toilets),
            property_price: Number(data.property_price),
            reserve_amount: Number(data.reserve_amount || 0),
            long: Number(data.long),
            lat: Number(data.lat),
            images: imagesToSend,
        };

        setIsPending(true);
        
        toast.promise(submitForm(propertyInfo), {
            loading: isEditMode ? 'Updating property...' : 'Adding new property...',
            success: (response) => {
                setActiveStep(minStep);
                setIsPending(false);
                if (!response.success) throw new Error(response.message || response.errors?.[0]?.message || `Failed to ${isEditMode ? 'update' : 'add'} property.`);
                reset();
                setIsOpenModal(false);
                setNewFiles([]);
                if (!isEditMode) setExistingImages([]);
                return `Property ${isEditMode ? 'updated' : 'added'} successfully!`;
            },
            error: (error) => {
                setIsPending(false);
                setIsOpenModal(false);
                if (error.message === "canceled" || error.message === "Upload cancelled") return "Upload cancelled.";
                return `${error.message || `Failed to ${isEditMode ? 'update' : 'add'} property.`}`;
            },
        });
    }, [propertyOwner, propertyAmenities, isFeatured, isEditMode, existingImages, newFiles, reset, minStep]);

    const submitForm = useCallback(async (propertyInfo) => {
        controllerRef.current = new AbortController();
        const formData = new FormData();
        
        Object.entries(propertyInfo).forEach(([key, value]) => {
            if (value === null || value === undefined) return;
            
            if (key === 'images' && Array.isArray(value)) {
                // Handle images specially - send each image appropriately
                value.forEach((item, index) => {
                    if (item instanceof File) {
                        // This is a new file upload
                        formData.append(`images`, item);
                    } else if (typeof item === 'string' && item.startsWith('http')) {
                        // This is an existing image URL - send as string
                        formData.append(`existing_images`, item);
                    } else if (typeof item === 'string') {
                        // This might be a filename from server
                        formData.append(`existing_images`, item);
                    }
                });
            } else if (Array.isArray(value)) {
                // Handle other arrays (like property_amenities)
                value.forEach((item) => {
                    formData.append(`${key}[]`, item);
                });
            } else {
                formData.append(key, value);
            }
        });

        const startTime = new Date();
        const propertyId = effectiveData?.id || effectiveData?._id;
        
        // Determine API endpoint
        let apiUrl;
        if (isEditMode && propertyId) {
            apiUrl = `${url}/property/update-property/${propertyId}`;
        } else if (isEditMode && !propertyId) {
            throw new Error("Property ID is missing for update operation");
        } else {
            apiUrl = `${url}/property/create-property`;
        }

        try {
            const response = await axios({
                method: isEditMode ? 'PUT' : 'POST',
                url: apiUrl,
                data: formData,
                headers: {
                    Authorization: `Bearer ${token?.value}`,
                    'Content-Type': 'multipart/form-data',
                },
                signal: controllerRef.current.signal,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        progress(progressEvent, setIsOpenModal, setUploadingProgress, setEstimatedTime, startTime);
                    }
                }
            });
            
            if (controllerRef.current.signal.aborted) throw new Error("Upload cancelled");
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) {
                throw new Error("Upload cancelled");
            }
            console.error("Error submitting form:", error);
            throw new Error(error?.response?.data?.message || error.message || "An error occurred. Please try again.");
        }
    }, [isEditMode, effectiveData, token]);

    // Update form values when propertyOwner changes
    useEffect(() => {
        if (propertyOwner) {
            setValue("firstname", propertyOwner.first_name || "");
            setValue("lastname", propertyOwner.last_name || "");
            setValue("email", propertyOwner.email || "");
            setValue("phone", propertyOwner.phone || "");
            setValue("owner_address", propertyOwner.address || "");
        }
    }, [propertyOwner, setValue]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, []);

    // Determine page title and behavior
    const isPropertyDetailsPage = useMemo(() => {
        const pathParts = pathname.split("/");
        const isDetailsPage = pathname.includes("property-details") || 
                             (pathname.includes("/dashboard/property-owner/properties/") && !pathname.includes("/add"));
        return isDetailsPage;
    }, [pathname]);

    const pageTitle = useMemo(() => {
        if (isPropertyDetailsPage) return "Property Details";
        if (pathname.includes("edit-property") || isEditMode) return "Edit Property";
        return "Add New Property";
    }, [isPropertyDetailsPage, pathname, isEditMode]);

    const showProgressBar = !isPropertyDetailsPage && !isEditMode;

    // Get image URL base from environment variable
    const imageUrlBase = process.env.NEXT_PUBLIC_IMAGE_URL || 'https://app.xpacy.com/src/upload/properties';

    return (
        <div className="flex flex-col gap-12 w-[796px] mx-auto pb-12">
            {/* Header */}
            <header className="flex flex-col items-center justify-center gap-4">
                <h2 className="text-3xl font-bold text-primary">
                    {pageTitle}
                </h2>
                {!isPropertyDetailsPage && !isEditMode && (
                    <p className="font-mono">Fill in the correct detailed information for the new property.</p>
                )}
            </header>
            
            {/* Progress bar - only show for new property creation */}
            {showProgressBar && (
                <ProgressBar activeStep={activeStep} setActiveStep={setActiveStep} />
            )}
            
            {/* Form Steps */}
            <form className="p-6 flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
                {/* 1. Owner Info */}
                {activeStep === 1 && (
                    <>
                        <h3 className="text-lg">Owner Information</h3>
                        <SearchPropertyOwner 
                            disabled={disableSearch || isReadOnly} 
                            propertyOwner={propertyOwner} 
                            setPropertyOwner={setPropertyOwner} 
                            allOwners={allOwners} 
                        />
                        <div className="flex flex-col gap-6">
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"First Name"} id={"firstname"}>
                                    <input 
                                        disabled={isReadOnly} 
                                        {...register("firstname", {
                                            required: "Please enter your first name"
                                        })} 
                                        type={"text"} 
                                        id={"firstname"} 
                                        placeholder={"Enter your first name"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.firstname ? "border-error" : "border-primary-200"}`} 
                                    />
                                    {errors.firstname && <span className="-mt-2 text-xs text-error">{errors.firstname.message}</span>}
                                </FormInput>
                                <FormInput label={"Last Name"} id={"lastname"}>
                                    <input 
                                        disabled={isReadOnly} 
                                        {...register("lastname", {
                                            required: "Please enter your lastname"
                                        })} 
                                        type={"text"} 
                                        id={"lastname"} 
                                        placeholder={"Enter your last name"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lastname ? "border-error" : "border-primary-200"}`} 
                                    />
                                    {errors.lastname && <span className="-mt-2 text-xs text-error">{errors.lastname.message}</span>}
                                </FormInput>
                            </div>
                            <FormInput label={"Email address"} id={"email"}>
                                <input 
                                    disabled={isReadOnly} 
                                    {...register("email", {
                                        required: "Email is required", 
                                        pattern: {
                                            value: /\S+@\S+\.\S+/,
                                            message: "Provide a valid email address",
                                        }
                                    })} 
                                    type={"email"} 
                                    id={"email"} 
                                    placeholder={"Enter your email address"} 
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.email ? "border-error" : "border-primary-200"}`} 
                                />
                                {errors.email && <span className="-mt-2 text-xs text-error">{errors.email.message}</span>}
                            </FormInput>
                            <FormInput label={"Phone number"} id={"phone"}>
                                <input 
                                    disabled={isReadOnly} 
                                    {...register("phone")} 
                                    type={"tel"} 
                                    id={"phone"} 
                                    placeholder={"Enter your phone number"} 
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.phone ? "border-error" : "border-primary-200"}`} 
                                />
                                {errors.phone && <span className="-mt-2 text-xs text-error">{errors.phone.message}</span>}
                            </FormInput>
                            <FormInput label={"Address"} id={"owner_address"}>
                                <input 
                                    disabled={isReadOnly} 
                                    {...register("owner_address")} 
                                    type={"text"} 
                                    id={"owner_address"} 
                                    placeholder={"Enter your address"} 
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.owner_address ? "border-error" : "border-primary-200"}`} 
                                />
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
                            <FormInput label={"Property Name"} id={"property_name"}>
                                <input 
                                    disabled={isReadOnly} 
                                    {...register("property_name", {
                                        required: "Property Name is required",
                                    })} 
                                    type={"text"} 
                                    id={"property_name"} 
                                    placeholder={"Enter your property name"} 
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.property_name ? "border-error" : "border-primary-200"}`} 
                                />
                                {errors.property_name && <span className="-mt-2 text-xs text-error">{errors.property_name.message}</span>}
                            </FormInput>
                            <FormInput label={"Property Address"} id={"address"}>
                                <input 
                                    disabled={isReadOnly} 
                                    {...register("address", {
                                        required: "Property Address is required",
                                    })} 
                                    type={"text"} 
                                    id={"address"} 
                                    placeholder={"Enter your property address"} 
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.address ? "border-error" : "border-primary-200"}`} 
                                />
                                {errors.address && <span className="-mt-2 text-xs text-error">{errors.address.message}</span>}
                            </FormInput>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"State"} id={"state"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        {...register("state", {
                                            required: "State is required",
                                        })} 
                                        id={"state"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.state ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a state</option>
                                        {allCities.map(city => (
                                            <option key={city.id} value={city.location}>{city.location}</option>
                                        ))}
                                    </select>
                                    {errors.state && <span className="-mt-2 text-xs text-error">{errors.state.message}</span>}
                                </FormInput>
                                <FormInput label={"City/Town"} id={"city"}>
                                    <input 
                                        disabled={isReadOnly} 
                                        {...register("city", {
                                            required: "City/Town is required",
                                        })} 
                                        type={"text"} 
                                        id={"city"} 
                                        placeholder={"Enter your city/town"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.city ? "border-error" : "border-primary-200"}`} 
                                    />
                                    {errors.city && <span className="-mt-2 text-xs text-error">{errors.city.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Property Type"} id={"property_type"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        {...register("property_type", {
                                            required: "Property Type is required",
                                        })} 
                                        id={"property_type"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.property_type ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a property type</option>
                                        {propertyType.map(item => (
                                            <option key={item.id} value={item.type}>{item.type}</option>
                                        ))}
                                    </select>
                                    {errors.property_type && <span className="-mt-2 text-xs text-error">{errors.property_type.message}</span>}
                                </FormInput>
                                <FormInput label={"Availability Status"} id={"availability_status"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        {...register("availability_status", {
                                            required: "Availability Status is required",
                                        })} 
                                        id={"availability_status"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.availability_status ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select an availability status</option>
                                        {availabilityStatus.map(item => (
                                            <option key={item.id} value={item.status}>{item.status}</option>
                                        ))}
                                    </select>
                                    {errors.availability_status && <span className="-mt-2 text-xs text-error">{errors.availability_status.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Property Price"} id={"property_price"}>
                                    <div className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.property_price ? "border-error" : "border-primary-200"}`}>
                                        <span><FaNairaSign /></span>
                                        <input 
                                            disabled={isReadOnly} 
                                            {...register("property_price", {
                                                required: "Property Price is required",
                                            })} 
                                            type={"number"} 
                                            id={"property_price"} 
                                            placeholder={"Enter your property price"} 
                                            className={`focus:outline-none flex-1`} 
                                        />
                                    </div>
                                    {errors.property_price && <span className="-mt-2 text-xs text-error">{errors.property_price.message}</span>}
                                </FormInput>
                                <FormInput label={"Reserve Amount"} id={"reserve_amount"}>
                                    <div className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.reserve_amount ? "border-error" : "border-primary-200"}`}>
                                        <span><FaNairaSign /></span>
                                        <input 
                                            disabled={isReadOnly} 
                                            {...register("reserve_amount")} 
                                            type={"number"} 
                                            id={"reserve_amount"} 
                                            placeholder={"Enter reserve amount"} 
                                            className={`focus:outline-none flex-1`} 
                                        />
                                    </div>
                                    {errors.reserve_amount && <span className="-mt-2 text-xs text-error">{errors.reserve_amount.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Property Status"} id={"property_status"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        {...register("property_status", {
                                            required: "Property Status is required",
                                        })} 
                                        id={"property_status"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.property_status ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a property status</option>
                                        {propertyStatus.map(item => (
                                            <option key={item.id} value={item.status}>{item.status}</option>
                                        ))}
                                    </select>
                                    {errors.property_status && <span className="-mt-2 text-xs text-error">{errors.property_status.message}</span>}
                                </FormInput>
                                {isEditMode && (
                                    <FormInput label={"Views"} id={"views"}>
                                        <input 
                                            disabled={true} 
                                            value={effectiveData?.views || 0} 
                                            type={"number"} 
                                            id={"views"} 
                                            className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200`} 
                                        />
                                    </FormInput>
                                )}
                            </div>
                            
                            {/* Property Description with Live Preview */}
                            <div className="md:flex-1 w-full flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="description" className="text-sm text-black flex items-center gap-2">
                                        Property Description
                                        <span className="text-[10px] font-normal text-gray-500">(HTML Supported)</span>
                                    </label>
                                  
                                </div>
                                
                                       <div className="border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                                        <div 
                                            className="prose prose-sm max-w-none p-4 min-h-[300px]"
                                            dangerouslySetInnerHTML={{ 
                                                __html: description && description.trim() !== "" 
                                                    ? description 
                                                    : "<em class='text-gray-400'>No content yet. Start writing your description...</em>"
                                            }}
                                        />
                                    </div>
                                        
                                  
                                
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
                                <FormInput label={"Bedrooms"} id={"total_bedrooms"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        {...register("total_bedrooms", {
                                            required: "Number of bedrooms is required",
                                        })} 
                                        id={"total_bedrooms"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.total_bedrooms ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a bedroom count</option>
                                        {bedroomCounts.map(item => (
                                            <option key={item.id} value={item.count}>{item.count}</option>
                                        ))}
                                    </select>
                                    {errors.total_bedrooms && <span className="-mt-2 text-xs text-error">{errors.total_bedrooms.message}</span>}
                                </FormInput>
                                <FormInput label={"Bathrooms"} id={"total_bathrooms"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        {...register("total_bathrooms", {
                                            required: "Number of bathrooms is required",
                                        })} 
                                        id={"total_bathrooms"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.total_bathrooms ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a bathroom count</option>
                                        {bathroomCounts.map(item => (
                                            <option key={item.id} value={item.count}>{item.count}</option>
                                        ))}
                                    </select>
                                    {errors.total_bathrooms && <span className="-mt-2 text-xs text-error">{errors.total_bathrooms.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Toilets"} id={"total_toilets"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        {...register("total_toilets", {
                                            required: "Number of toilets is required",
                                        })} 
                                        id={"total_toilets"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.total_toilets ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a toilet count</option>
                                        {toiletCounts.map(item => (
                                            <option key={item.id} value={item.count}>{item.count}</option>
                                        ))}
                                    </select>
                                    {errors.total_toilets && <span className="-mt-2 text-xs text-error">{errors.total_toilets.message}</span>}
                                </FormInput>
                                <FormInput label={"Parking Area"} id={"parking_area"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        {...register("parking_area", {
                                            required: "Parking area is required",
                                        })} 
                                        id={"parking_area"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.parking_area ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a parking area</option>
                                        {parkingAreaCount.map(item => (
                                            <option key={item.id} value={item.count}>{item.count}</option>
                                        ))}
                                    </select>
                                    {errors.parking_area && <span className="-mt-2 text-xs text-error">{errors.parking_area.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Property size (square area)"} id={"property_square_area"}>
                                    <div className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.property_square_area ? "border-error" : "border-primary-200"}`}>
                                        <span>sqm²</span>
                                        <input 
                                            disabled={isReadOnly} 
                                            {...register("property_square_area")} 
                                            type={"number"} 
                                            id={"property_square_area"} 
                                            placeholder={"Enter your property square area"} 
                                            className={`focus:outline-none flex-1`} 
                                        />
                                    </div>
                                    {errors.property_square_area && <span className="-mt-2 text-xs text-error">{errors.property_square_area.message}</span>}
                                </FormInput>
                                <FormInput label={"Land area"} id={"land_area"}>
                                    <div className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.land_area ? "border-error" : "border-primary-200"}`}>
                                        <span>sqm²</span>
                                        <input 
                                            disabled={isReadOnly} 
                                            {...register("land_area")} 
                                            type={"number"} 
                                            id={"land_area"} 
                                            placeholder={"Enter your land area"} 
                                            className={`focus:outline-none flex-1`} 
                                        />
                                    </div>
                                    {errors.land_area && <span className="-mt-2 text-xs text-error">{errors.land_area.message}</span>}
                                </FormInput>
                            </div>
                            <SelectAmeneties 
                                readOnly={isReadOnly} 
                                propertyAmenities={propertyAmenities} 
                                setPropertyAmenities={setPropertyAmenities} 
                            />
                        </div>
                    </>
                )}
                
                {/* 4. Media */}
                {activeStep === 4 && (
                    <>
                        <h3 className="text-lg">Media</h3>
                        {isPropertyDetailsPage ? (
                            <>
                                <p className="font-mono">Photos</p>
                                <div className="grid grid-cols-3 gap-x-6 gap-y-12">
                                    {existingImages.map((file, index) => (
                                        <img 
                                            key={index} 
                                            src={`${imageUrlBase}/${file}`} 
                                            alt={`Property Image ${index + 1}`} 
                                            className="object-cover rounded-lg" 
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <DragnDrop 
                                isReadOnly={isReadOnly} 
                                files={newFiles} 
                                setFiles={handleFilesChange} 
                                maxFiles={9} 
                                existingImages={existingImages}
                                onRemoveExisting={handleRemoveExistingImage}
                                imageUrlBase={imageUrlBase}
                            />
                        )}
                        <FormInput label={"Property Video Tour (Optional)"} id={"virtual_tour_url"}>
                            <input  
                                {...register("virtual_tour_url")} 
                                type={"text"} 
                                id={"virtual_tour_url"} 
                                placeholder={"Enter your property video tour link"} 
                                className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.virtual_tour_url ? "border-error" : "border-primary-200"}`} 
                            />
                            {errors.virtual_tour_url && <span className="-mt-2 text-xs text-error">{errors.virtual_tour_url.message}</span>}
                        </FormInput>
                        <div className="flex flex-col gap-6">
                            <span className="font-mono font-medium">
                                Location Coordinates 
                                <a className="text-blue-500 font-medium ml-1" href="https://www.latlong.net" target="_blank" rel="noopener noreferrer">(Get coordinates)</a>
                            </span>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Latitude"} id={"lat"}>
                                    <input 
                                        disabled={isReadOnly}  
                                        {...register("lat")} 
                                        type={"text"} 
                                        id={"lat"} 
                                        placeholder={"Enter your property latitude"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lat ? "border-error" : "border-primary-200"}`} 
                                    />
                                    {errors.lat && <span className="-mt-2 text-xs text-error">{errors.lat.message}</span>}
                                </FormInput>
                                <FormInput label={"Longitude"} id={"long"}>
                                    <input 
                                        disabled={isReadOnly}  
                                        {...register("long")} 
                                        type={"text"} 
                                        id={"long"} 
                                        placeholder={"Enter your property longitude"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.long ? "border-error" : "border-primary-200"}`} 
                                    />
                                    {errors.long && <span className="-mt-2 text-xs text-error">{errors.long.message}</span>}
                                </FormInput>
                            </div>
                            <div className="flex items-center justify-between font-mono">
                                <span>Feature this property</span>
                                <CustomToogle 
                                    disabled={isReadOnly} 
                                    checked={isFeatured} 
                                    onChange={setIsFeatured} 
                                />
                            </div>
                        </div>
                    </>
                )}
                
                {/* Navigation Buttons */}
                <div className={`${activeStep > minStep ? "flex items-center justify-between" : "self-end"}`}>
                    {activeStep > minStep && (
                        <button 
                            type="button" 
                            onClick={goToPreviousStep} 
                            className={`bg-white px-4 py-2 font-mono text-primary rounded-lg hover:bg-primary-100/80 cursor-pointer transition flex items-center gap-2 ${activeStep === 2 && effectiveOwner ? "invisible" : ""}`}
                        >
                            <span><FaAngleLeft /></span>
                            <span>Previous</span>
                        </button>
                    )}
                    {activeStep < 4 ? (
                        <button 
                            type="button" 
                            onClick={goToNextStep} 
                            className="px-4 py-2 font-mono text-primary rounded-lg hover:bg-primary-100/80 cursor-pointer transition flex items-center gap-2"
                        >
                            <span>Next</span>
                            <span><FaAngleRight /></span>
                        </button>
                    ) : (
                        !isPropertyDetailsPage && (
                            <button 
                                disabled={isPending} 
                                type="submit" 
                                className="px-4 py-2 bg-primary-200 font-mono text-primary rounded-lg hover:bg-primary-200/80 cursor-pointer transition flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span>{isEditMode ? "Update Property" : "Finish"}</span>
                                {isPending && <span><SpinnerMini /></span>}
                            </button>
                        )
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

export default EditPropertyForm;