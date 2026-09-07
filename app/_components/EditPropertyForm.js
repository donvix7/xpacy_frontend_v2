"use client";

import { useEffect, useState, useTransition, useRef, useCallback, useMemo } from "react";
import ProgressBar from "./ProgressBar";
import SearchPropertyOwner from "./SearchPropertyOwner";
import FormInput from "./FormInput";

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

const propertyTypes = [
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
    const [existingImages, setExistingImages] = useState(() => effectiveData?.images || []);
    const [newFiles, setNewFiles] = useState([]);
    const [isFeatured, setIsFeatured] = useState(() => effectiveData?.isFeatured || effectiveData?.is_featured || false);
    const [isPending, setIsPending] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [uploadingProgress, setUploadingProgress] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(0);
    const controllerRef = useRef(null);
    const pathname = usePathname();

    // RAW STATE for all form fields (like BlogForm)
    const [propertyName, setPropertyName] = useState(effectiveData?.property_name || "");
    const [address, setAddress] = useState(effectiveData?.address || "");
    const [state, setState] = useState(effectiveData?.state || "");
    const [city, setCity] = useState(effectiveData?.city || "");
    const [propertyType, setPropertyType] = useState(effectiveData?.property_type || "");
    const [availabilityStatusValue, setAvailabilityStatusValue] = useState(effectiveData?.availability_status || "");
    const [propertyPrice, setPropertyPrice] = useState(effectiveData?.property_price || "");
    const [reserveAmount, setReserveAmount] = useState(effectiveData?.reserve_amount || "");
    const [propertyStatusValue, setPropertyStatusValue] = useState(effectiveData?.property_status || "");
    const [description, setDescription] = useState(effectiveData?.description || "");
    const [totalBedrooms, setTotalBedrooms] = useState(effectiveData?.total_bedrooms || "");
    const [totalBathrooms, setTotalBathrooms] = useState(effectiveData?.total_bathrooms || "");
    const [totalToilets, setTotalToilets] = useState(effectiveData?.total_toilets || "");
    const [parkingArea, setParkingArea] = useState(effectiveData?.parking_area || "");
    const [propertySquareArea, setPropertySquareArea] = useState(effectiveData?.property_square_area || "");
    const [landArea, setLandArea] = useState(effectiveData?.land_area || "");
    const [virtualTourUrl, setVirtualTourUrl] = useState(effectiveData?.virtual_tour_url || "");
    const [lat, setLat] = useState(effectiveData?.lat || "");
    const [lng, setLng] = useState(effectiveData?.long || "");
    
    // Owner info raw state
    const [firstName, setFirstName] = useState(propertyOwner?.first_name || "");
    const [lastName, setLastName] = useState(propertyOwner?.last_name || "");
    const [email, setEmail] = useState(propertyOwner?.email || "");
    const [phone, setPhone] = useState(propertyOwner?.phone || "");
    const [ownerAddress, setOwnerAddress] = useState(propertyOwner?.address || "");

    // Validation errors
    const [errors, setErrors] = useState({});

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

    // Validate current step
    const validateStep = useCallback((step, formData) => {
        const newErrors = {};
        
        if (step === 1) {
            if (!firstName) newErrors.firstName = "First name is required";
            if (!lastName) newErrors.lastName = "Last name is required";
            if (!email) newErrors.email = "Email is required";
            if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Provide a valid email address";
            if (!propertyOwner?.id) newErrors.propertyOwner = "Please select a property owner";
        } else if (step === 2) {
            if (!propertyName) newErrors.propertyName = "Property name is required";
            if (!address) newErrors.address = "Property address is required";
            if (!state) newErrors.state = "State is required";
            if (!city) newErrors.city = "City/Town is required";
            if (!propertyType) newErrors.propertyType = "Property type is required";
            if (!availabilityStatusValue) newErrors.availabilityStatus = "Availability status is required";
            if (!propertyPrice) newErrors.propertyPrice = "Property price is required";
            if (!propertyStatusValue) newErrors.propertyStatus = "Property status is required";
            if (!description) newErrors.description = "Property description is required";
        } else if (step === 3) {
            if (!totalBedrooms) newErrors.totalBedrooms = "Number of bedrooms is required";
            if (!totalBathrooms) newErrors.totalBathrooms = "Number of bathrooms is required";
            if (!totalToilets) newErrors.totalToilets = "Number of toilets is required";
            if (!parkingArea) newErrors.parkingArea = "Parking area is required";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [firstName, lastName, email, propertyOwner, propertyName, address, state, city, 
        propertyType, availabilityStatusValue, propertyPrice, propertyStatusValue, description,
        totalBedrooms, totalBathrooms, totalToilets, parkingArea]);

    // Handle next button click with validation
    const handleNextStep = useCallback(() => {
        if (validateStep(activeStep, {})) {
            goToNextStep();
        } else {
            toast.error("Please fix the errors before proceeding");
        }
    }, [activeStep, validateStep, goToNextStep]);

    const onSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        // Validate all steps before submission
        const isStep1Valid = validateStep(1, {});
        const isStep2Valid = validateStep(2, {});
        const isStep3Valid = validateStep(3, {});
        
        if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
            toast.error("Please fill in all required fields");
            // Find first step with errors
            if (!isStep1Valid) setActiveStep(1);
            else if (!isStep2Valid) setActiveStep(2);
            else if (!isStep3Valid) setActiveStep(3);
            return;
        }
        
        if (!propertyOwner?.id) {
            toast.error("Property owner is required");
            setActiveStep(1);
            return;
        }

        const propertyInfo = {
            property_name: propertyName,
            address: address,
            state: state,
            city: city,
            property_type: propertyType,
            availability_status: availabilityStatusValue,
            property_price: Number(propertyPrice),
            reserve_amount: Number(reserveAmount || 0),
            property_status: propertyStatusValue,
            description: description, // Raw HTML content
            total_bedrooms: Number(totalBedrooms),
            total_bathrooms: Number(totalBathrooms),
            total_toilets: Number(totalToilets),
            parking_area: parkingArea,
            property_square_area: propertySquareArea ? Number(propertySquareArea) : null,
            land_area: landArea ? Number(landArea) : null,
            virtual_tour_url: virtualTourUrl || null,
            lat: lat ? Number(lat) : null,
            long: lng ? Number(lng) : null,
            property_owner_id: propertyOwner.id,
            property_amenities: propertyAmenities,
            isFeatured: isFeatured,
            images: isEditMode ? [...existingImages, ...newFiles] : newFiles,
        };

        setIsPending(true);
        
        toast.promise(submitForm(propertyInfo), {
            loading: isEditMode ? 'Updating property...' : 'Adding new property...',
            success: (response) => {
                setActiveStep(minStep);
                setIsPending(false);
                if (!response.success) throw new Error(response.message || response.errors?.[0]?.message || `Failed to ${isEditMode ? 'update' : 'add'} property.`);
                // Reset form
                if (!isEditMode) {
                    setPropertyName("");
                    setAddress("");
                    setState("");
                    setCity("");
                    setPropertyType("");
                    setAvailabilityStatusValue("");
                    setPropertyPrice("");
                    setReserveAmount("");
                    setPropertyStatusValue("");
                    setDescription("");
                    setTotalBedrooms("");
                    setTotalBathrooms("");
                    setTotalToilets("");
                    setParkingArea("");
                    setPropertySquareArea("");
                    setLandArea("");
                    setVirtualTourUrl("");
                    setLat("");
                    setLng("");
                    setNewFiles([]);
                    setExistingImages([]);
                    setIsFeatured(false);
                }
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
    }, [propertyName, address, state, city, propertyType, availabilityStatusValue, propertyPrice, 
        reserveAmount, propertyStatusValue, description, totalBedrooms, totalBathrooms, totalToilets, 
        parkingArea, propertySquareArea, landArea, virtualTourUrl, lat, lng, propertyOwner, 
        propertyAmenities, isFeatured, isEditMode, existingImages, newFiles, minStep, validateStep]);

    const submitForm = useCallback(async (propertyInfo) => {
        controllerRef.current = new AbortController();
        const formData = new FormData();
        
        Object.entries(propertyInfo).forEach(([key, value]) => {
            if (value === null || value === undefined) return;
            
            if (key === 'images' && Array.isArray(value)) {
                value.forEach((item) => {
                    if (item instanceof File) {
                        formData.append('images', item);
                    } else if (typeof item === 'string') {
                        formData.append('existing_images', item);
                    }
                });
            } else if (Array.isArray(value)) {
                value.forEach((item) => {
                    formData.append(`${key}[]`, item);
                });
            } else {
                formData.append(key, value);
            }
        });

        const startTime = new Date();
        const propertyId = effectiveData?.id || effectiveData?._id;
        const apiUrl = isEditMode && propertyId
            ? `${url}/property/update-property/${propertyId}`
            : `${url}/property/create-property`;

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
                onUploadProgress: (progressEvent) => progress(progressEvent, setIsOpenModal, setUploadingProgress, setEstimatedTime, startTime)
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

    // Update owner fields when propertyOwner changes
    useEffect(() => {
        if (propertyOwner) {
            setFirstName(propertyOwner.first_name || "");
            setLastName(propertyOwner.last_name || "");
            setEmail(propertyOwner.email || "");
            setPhone(propertyOwner.phone || "");
            setOwnerAddress(propertyOwner.address || "");
        }
    }, [propertyOwner]);

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
        return pathname.includes("property-details") || 
               (pathname.includes("/dashboard/property-owner/properties/") && !pathname.includes("/add"));
    }, [pathname]);

    const pageTitle = useMemo(() => {
        if (isPropertyDetailsPage) return "Property Details";
        if (pathname.includes("edit-property") || isEditMode) return "Edit Property";
        return "Add New Property";
    }, [isPropertyDetailsPage, pathname, isEditMode]);

    const showProgressBar = !isPropertyDetailsPage && !isEditMode;

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
            <form className="p-6 flex flex-col gap-8" onSubmit={onSubmit}>
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
                        {errors.propertyOwner && (
                            <span className="-mt-4 text-xs text-error">{errors.propertyOwner}</span>
                        )}
                        <div className="flex flex-col gap-6">
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"First Name"} id={"firstname"}>
                                    <input 
                                        disabled={isReadOnly} 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        type={"text"} 
                                        id={"firstname"} 
                                        placeholder={"Enter your first name"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.firstName ? "border-error" : "border-primary-200"}`} 
                                    />
                                    {errors.firstName && <span className="-mt-2 text-xs text-error">{errors.firstName}</span>}
                                </FormInput>
                                <FormInput label={"Last Name"} id={"lastname"}>
                                    <input 
                                        disabled={isReadOnly} 
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        type={"text"} 
                                        id={"lastname"} 
                                        placeholder={"Enter your last name"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lastName ? "border-error" : "border-primary-200"}`} 
                                    />
                                    {errors.lastName && <span className="-mt-2 text-xs text-error">{errors.lastName}</span>}
                                </FormInput>
                            </div>
                            <FormInput label={"Email address"} id={"email"}>
                                <input 
                                    disabled={isReadOnly} 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type={"email"} 
                                    id={"email"} 
                                    placeholder={"Enter your email address"} 
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.email ? "border-error" : "border-primary-200"}`} 
                                />
                                {errors.email && <span className="-mt-2 text-xs text-error">{errors.email}</span>}
                            </FormInput>
                            <FormInput label={"Phone number"} id={"phone"}>
                                <input 
                                    disabled={isReadOnly} 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    type={"tel"} 
                                    id={"phone"} 
                                    placeholder={"Enter your phone number"} 
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.phone ? "border-error" : "border-primary-200"}`} 
                                />
                                {errors.phone && <span className="-mt-2 text-xs text-error">{errors.phone}</span>}
                            </FormInput>
                            <FormInput label={"Address"} id={"owner_address"}>
                                <input 
                                    disabled={isReadOnly} 
                                    value={ownerAddress}
                                    onChange={(e) => setOwnerAddress(e.target.value)}
                                    type={"text"} 
                                    id={"owner_address"} 
                                    placeholder={"Enter your address"} 
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.ownerAddress ? "border-error" : "border-primary-200"}`} 
                                />
                                {errors.ownerAddress && <span className="-mt-2 text-xs text-error">{errors.ownerAddress}</span>}
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
                                    value={propertyName}
                                    onChange={(e) => setPropertyName(e.target.value)}
                                    type={"text"} 
                                    id={"property_name"} 
                                    placeholder={"Enter your property name"} 
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.propertyName ? "border-error" : "border-primary-200"}`} 
                                />
                                {errors.propertyName && <span className="-mt-2 text-xs text-error">{errors.propertyName}</span>}
                            </FormInput>
                            <FormInput label={"Property Address"} id={"address"}>
                                <input 
                                    disabled={isReadOnly} 
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    type={"text"} 
                                    id={"address"} 
                                    placeholder={"Enter your property address"} 
                                    className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.address ? "border-error" : "border-primary-200"}`} 
                                />
                                {errors.address && <span className="-mt-2 text-xs text-error">{errors.address}</span>}
                            </FormInput>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"State"} id={"state"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        id={"state"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.state ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a state</option>
                                        {allCities.map(city => (
                                            <option key={city.id} value={city.location}>{city.location}</option>
                                        ))}
                                    </select>
                                    {errors.state && <span className="-mt-2 text-xs text-error">{errors.state}</span>}
                                </FormInput>
                                <FormInput label={"City/Town"} id={"city"}>
                                    <input 
                                        disabled={isReadOnly} 
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        type={"text"} 
                                        id={"city"} 
                                        placeholder={"Enter your city/town"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.city ? "border-error" : "border-primary-200"}`} 
                                    />
                                    {errors.city && <span className="-mt-2 text-xs text-error">{errors.city}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Property Type"} id={"property_type"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        value={propertyType}
                                        onChange={(e) => setPropertyType(e.target.value)}
                                        id={"property_type"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.propertyType ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a property type</option>
                                        {propertyTypes.map(item => (
                                            <option key={item.id} value={item.type}>{item.type}</option>
                                        ))}
                                    </select>
                                    {errors.propertyType && <span className="-mt-2 text-xs text-error">{errors.propertyType}</span>}
                                </FormInput>
                                <FormInput label={"Availability Status"} id={"availability_status"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        value={availabilityStatusValue}
                                        onChange={(e) => setAvailabilityStatusValue(e.target.value)}
                                        id={"availability_status"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.availabilityStatus ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select an availability status</option>
                                        {availabilityStatus.map(item => (
                                            <option key={item.id} value={item.status}>{item.status}</option>
                                        ))}
                                    </select>
                                    {errors.availabilityStatus && <span className="-mt-2 text-xs text-error">{errors.availabilityStatus}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Property Price"} id={"property_price"}>
                                    <div className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.propertyPrice ? "border-error" : "border-primary-200"}`}>
                                        <span><FaNairaSign /></span>
                                        <input 
                                            disabled={isReadOnly} 
                                            value={propertyPrice}
                                            onChange={(e) => setPropertyPrice(e.target.value)}
                                            type={"number"} 
                                            id={"property_price"} 
                                            placeholder={"Enter your property price"} 
                                            className={`focus:outline-none flex-1`} 
                                        />
                                    </div>
                                    {errors.propertyPrice && <span className="-mt-2 text-xs text-error">{errors.propertyPrice}</span>}
                                </FormInput>
                                <FormInput label={"Reserve Amount"} id={"reserve_amount"}>
                                    <div className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.reserveAmount ? "border-error" : "border-primary-200"}`}>
                                        <span><FaNairaSign /></span>
                                        <input 
                                            disabled={isReadOnly} 
                                            value={reserveAmount}
                                            onChange={(e) => setReserveAmount(e.target.value)}
                                            type={"number"} 
                                            id={"reserve_amount"} 
                                            placeholder={"Enter reserve amount"} 
                                            className={`focus:outline-none flex-1`} 
                                        />
                                    </div>
                                    {errors.reserveAmount && <span className="-mt-2 text-xs text-error">{errors.reserveAmount}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Property Status"} id={"property_status"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        value={propertyStatusValue}
                                        onChange={(e) => setPropertyStatusValue(e.target.value)}
                                        id={"property_status"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.propertyStatus ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a property status</option>
                                        {propertyStatus.map(item => (
                                            <option key={item.id} value={item.status}>{item.status}</option>
                                        ))}
                                    </select>
                                    {errors.propertyStatus && <span className="-mt-2 text-xs text-error">{errors.propertyStatus}</span>}
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
                            {/* Property Description - with proper HTML support and rendering */}
<div className="md:flex-1 w-full flex flex-col space-y-2">
    <label htmlFor="description" className="text-sm text-black flex items-center gap-2">
        Property Description
       
    </label>
    
    {isReadOnly ? (
        // Display mode - render the HTML
        <div 
            className="prose prose-sm max-w-none rounded-lg border border-gray-200 bg-gray-50 px-4.5 py-3 min-h-[200px]"
            dangerouslySetInnerHTML={{ 
                __html: description && description.trim() !== "" 
                    ? description 
                    : "<em class='text-gray-400'>No description provided.</em>"
            }}
        />
    ) : (
        // Edit mode - textarea for raw HTML
        <>
            <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                id="description"
                rows={12} 
                className={`text-sm rounded-lg border bg-[#FCFEFF] px-4.5 py-3 resize-none focus:outline-none font-mono text-sm ${errors.description ? "border-error" : "border-primary-200"}`} 
                placeholder="Enter your property description here.&#10;&#10;You can use HTML tags like:&#10;&lt;strong&gt;bold text&lt;/strong&gt;&#10;&lt;em&gt;italic text&lt;/em&gt;&#10;&lt;ul&gt;&lt;li&gt;bullet points&lt;/li&gt;&lt;/ul&gt;&#10;&lt;p&gt;paragraphs&lt;/p&gt;" 
            />

        </>
    )}
    
    {errors.description && (
        <span className="text-xs text-error">{errors.description}</span>
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
                                        value={totalBedrooms}
                                        onChange={(e) => setTotalBedrooms(e.target.value)}
                                        id={"total_bedrooms"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.totalBedrooms ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a bedroom count</option>
                                        {bedroomCounts.map(item => (
                                            <option key={item.id} value={item.count}>{item.count}</option>
                                        ))}
                                    </select>
                                    {errors.totalBedrooms && <span className="-mt-2 text-xs text-error">{errors.totalBedrooms}</span>}
                                </FormInput>
                                <FormInput label={"Bathrooms"} id={"total_bathrooms"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        value={totalBathrooms}
                                        onChange={(e) => setTotalBathrooms(e.target.value)}
                                        id={"total_bathrooms"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.totalBathrooms ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a bathroom count</option>
                                        {bathroomCounts.map(item => (
                                            <option key={item.id} value={item.count}>{item.count}</option>
                                        ))}
                                    </select>
                                    {errors.totalBathrooms && <span className="-mt-2 text-xs text-error">{errors.totalBathrooms}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Toilets"} id={"total_toilets"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        value={totalToilets}
                                        onChange={(e) => setTotalToilets(e.target.value)}
                                        id={"total_toilets"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.totalToilets ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a toilet count</option>
                                        {toiletCounts.map(item => (
                                            <option key={item.id} value={item.count}>{item.count}</option>
                                        ))}
                                    </select>
                                    {errors.totalToilets && <span className="-mt-2 text-xs text-error">{errors.totalToilets}</span>}
                                </FormInput>
                                <FormInput label={"Parking Area"} id={"parking_area"}>
                                    <select 
                                        disabled={isReadOnly} 
                                        value={parkingArea}
                                        onChange={(e) => setParkingArea(e.target.value)}
                                        id={"parking_area"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.parkingArea ? "border-error" : "border-primary-200"}`}>
                                        <option value="">Select a parking area</option>
                                        {parkingAreaCount.map(item => (
                                            <option key={item.id} value={item.count}>{item.count}</option>
                                        ))}
                                    </select>
                                    {errors.parkingArea && <span className="-mt-2 text-xs text-error">{errors.parkingArea}</span>}
                                </FormInput>
                            </div>
                            <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                <FormInput label={"Property size (square area)"} id={"property_square_area"}>
                                    <div className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.propertySquareArea ? "border-error" : "border-primary-200"}`}>
                                        <span>sqm²</span>
                                        <input 
                                            disabled={isReadOnly} 
                                            value={propertySquareArea}
                                            onChange={(e) => setPropertySquareArea(e.target.value)}
                                            type={"number"} 
                                            id={"property_square_area"} 
                                            placeholder={"Enter your property square area"} 
                                            className={`focus:outline-none flex-1`} 
                                        />
                                    </div>
                                    {errors.propertySquareArea && <span className="-mt-2 text-xs text-error">{errors.propertySquareArea}</span>}
                                </FormInput>
                                <FormInput label={"Land area"} id={"land_area"}>
                                    <div className={`flex items-center gap-2 rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.landArea ? "border-error" : "border-primary-200"}`}>
                                        <span>sqm²</span>
                                        <input 
                                            disabled={isReadOnly} 
                                            value={landArea}
                                            onChange={(e) => setLandArea(e.target.value)}
                                            type={"number"} 
                                            id={"land_area"} 
                                            placeholder={"Enter your land area"} 
                                            className={`focus:outline-none flex-1`} 
                                        />
                                    </div>
                                    {errors.landArea && <span className="-mt-2 text-xs text-error">{errors.landArea}</span>}
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
                                            src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://app.xpacy.com/src/upload/properties'}/${file}`} 
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
                                onRemoveExisting={(index) => {
                                    setExistingImages(prev => prev.filter((_, i) => i !== index));
                                }}
                            />
                        )}
                        <FormInput label={"Property Video Tour (Optional)"} id={"virtual_tour_url"}>
                            <input  
                                value={virtualTourUrl}
                                onChange={(e) => setVirtualTourUrl(e.target.value)}
                                type={"text"} 
                                id={"virtual_tour_url"} 
                                placeholder={"Enter your property video tour link"} 
                                className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.virtualTourUrl ? "border-error" : "border-primary-200"}`} 
                            />
                            {errors.virtualTourUrl && <span className="-mt-2 text-xs text-error">{errors.virtualTourUrl}</span>}
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
                                        value={lat}
                                        onChange={(e) => setLat(e.target.value)}
                                        type={"text"} 
                                        id={"lat"} 
                                        placeholder={"Enter your property latitude"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lat ? "border-error" : "border-primary-200"}`} 
                                    />
                                    {errors.lat && <span className="-mt-2 text-xs text-error">{errors.lat}</span>}
                                </FormInput>
                                <FormInput label={"Longitude"} id={"long"}>
                                    <input 
                                        disabled={isReadOnly}  
                                        value={lng}
                                        onChange={(e) => setLng(e.target.value)}
                                        type={"text"} 
                                        id={"long"} 
                                        placeholder={"Enter your property longitude"} 
                                        className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.lng ? "border-error" : "border-primary-200"}`} 
                                    />
                                    {errors.lng && <span className="-mt-2 text-xs text-error">{errors.lng}</span>}
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
                            onClick={handleNextStep} 
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