"use client";

import { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import toast from "react-hot-toast";
import { addProperty } from "@/app/_lib/action";
import ProgressBar from "@/app/_components/ProgressBar";

const propertyTypes = [
    { value: "RESIDENTIAL", label: "Residential" },
    { value: "COMMERCIAL", label: "Commercial" },
    { value: "INDUSTRIAL", label: "Industrial" },
    { value: "MIXED_USE", label: "Mixed use" },
    { value: "LAND", label: "Land" },
];

const initialForm = {
    name: "",
    description: "",
    propertyType: "RESIDENTIAL",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    postalCode: "",
    latitude: "0",
    longitude: "0",
    yearBuilt: "0",
    totalFloors: "0",
    totalUnits: "0",
    organizationId: "",
};

const inputClass =
    "w-full rounded-lg border border-primary-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-gray-50";

function Field({ label, htmlFor, children }) {
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
                {label}
            </label>
            {children}
        </div>
    );
}

export default function CreateNewPropertyForm({ owners = [], organizationId = "" }) {
    const [form, setForm] = useState({ ...initialForm, organizationId });
    const [selectedOwners, setSelectedOwners] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const selectedOwnerOptions = owners.filter((owner) =>
        selectedOwners.includes(String(owner.id || owner._id))
    );

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    function validateStep(step) {
        if (step === 1 && !selectedOwners.length)
            return "Select at least one property owner.";
        if (step === 2) {
            if (!form.name.trim()) return "Property name is required.";
            if (!form.propertyType) return "Property type is required.";
            if (!form.organizationId) return "Select an organization during login proceed before creating a property.";
        }
        if (step === 3) {
            if (!form.address.trim()) return "Address is required.";
            if (!form.city.trim()) return "City is required.";
            if (!form.state.trim()) return "State is required.";
            if (!form.country.trim()) return "Country is required.";
        }
        return null;
    }

    function goToNextStep() {
        const error = validateStep(activeStep);
        if (error) {
            toast.error(error);
            return;
        }
        setActiveStep((step) => Math.min(step + 1, 3));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const error = [1, 2, 3].map(validateStep).find(Boolean);
        if (error) {
            toast.error(error);
            return;
        }

        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            propertyType: form.propertyType,
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            country: form.country.trim(),
            postalCode: form.postalCode.trim(),
            latitude: Number(form.latitude) || 0,
            longitude: Number(form.longitude) || 0,
            yearBuilt: Number(form.yearBuilt) || 0,
            totalFloors: Number(form.totalFloors) || 0,
            totalUnits: Number(form.totalUnits) || 0,
            organizationId: form.organizationId.trim(),
            owners: selectedOwners,
        };

        setIsSubmitting(true);
        try {
            const result = await addProperty(payload);
            if (result?.success === false || result?.error) {
                toast.error(
                    result.message || result.error || "Could not create the property."
                );
                return;
            }
            toast.success(result?.message || "Property created successfully.");
            setForm({ ...initialForm, organizationId });
            setSelectedOwners([]);
            setActiveStep(1);
        } catch (error) {
            toast.error(error?.message || "Could not create the property.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-4xl rounded-2xl border border-primary-200 bg-white p-5 sm:p-8"
        >
            <div className="mb-5">
                <h1 className="text-2xl font-bold text-primary sm:text-3xl">
                    Add New Property
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    Complete each step to add a property and assign its owners.
                </p>
            </div>

            <ProgressBar
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                steps={[
                    { step: 1, label: "Owners" },
                    { step: 2, label: "Property" },
                    { step: 3, label: "Location" },
                ]}
            />

            <div className="grid gap-5 md:grid-cols-2">
                {activeStep === 1 && (
                    <div className="md:col-span-2">
                        <Field label="Owners *" htmlFor="owners">
                            <Autocomplete
                                id="owners"
                                multiple
                                options={owners}
                                value={selectedOwnerOptions}
                                onChange={(_, selected) =>
                                    setSelectedOwners(selected.map((owner) => String(owner.id || owner._id)))
                                }
                                getOptionLabel={(owner) => {
                                    const name = [
                                        owner.first_name || owner.firstname,
                                        owner.last_name || owner.lastname,
                                    ].filter(Boolean).join(" ");
                                    return name || owner.email || "Unnamed owner";
                                }}
                                isOptionEqualToValue={(option, value) =>
                                    String(option.id || option._id) === String(value.id || value._id)
                                }
                                renderInput={(autocompleteParams) => (
                                    <TextField
                                        {...autocompleteParams}
                                        placeholder="Search owner by name or email"
                                    />
                                )}
                                sx={{
                                    width: "100%",
                                    "& .MuiOutlinedInput-root": { borderRadius: "8px", fontFamily: "inherit" },
                                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#DADADA" },
                                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#DADADA" },
                                }}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Search and select one or more property owners.
                            </p>
                        </Field>
                    </div>
                )}

                {activeStep === 2 && (
                    <>
                        <Field label="Property name *" htmlFor="name">
                            <input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={updateField}
                                className={inputClass}
                                placeholder="Sunrise Apartments"
                                required
                            />
                        </Field>
                        <Field label="Property type *" htmlFor="propertyType">
                            <select
                                id="propertyType"
                                name="propertyType"
                                value={form.propertyType}
                                onChange={updateField}
                                className={inputClass}
                                required
                            >
                                {propertyTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Organization ID" htmlFor="organizationId">
                            <input
                                id="organizationId"
                                name="organizationId"
                                value={form.organizationId}
                                className={inputClass}
                                placeholder="No organization selected"
                                readOnly
                            />
                            {!form.organizationId && <p className="text-xs text-amber-700">Choose an organization during login proceed to create a property.</p>}
                        </Field>
                        <Field label="Year built" htmlFor="yearBuilt">
                            <input
                                id="yearBuilt"
                                name="yearBuilt"
                                type="number"
                                min="0"
                                value={form.yearBuilt}
                                onChange={updateField}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Total floors" htmlFor="totalFloors">
                            <input
                                id="totalFloors"
                                name="totalFloors"
                                type="number"
                                min="0"
                                value={form.totalFloors}
                                onChange={updateField}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Total units" htmlFor="totalUnits">
                            <input
                                id="totalUnits"
                                name="totalUnits"
                                type="number"
                                min="0"
                                value={form.totalUnits}
                                onChange={updateField}
                                className={inputClass}
                            />
                        </Field>
                        <div className="md:col-span-2">
                            <Field label="Description" htmlFor="description">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={form.description}
                                    onChange={updateField}
                                    className={`${inputClass} resize-y`}
                                    placeholder="Describe the property"
                                />
                            </Field>
                        </div>
                    </>
                )}

                {activeStep === 3 && (
                    <>
                        <div className="md:col-span-2">
                            <Field label="Address *" htmlFor="address">
                                <input
                                    id="address"
                                    name="address"
                                    value={form.address}
                                    onChange={updateField}
                                    className={inputClass}
                                    placeholder="123 Main Street"
                                    required
                                />
                            </Field>
                        </div>
                        <Field label="City *" htmlFor="city">
                            <input
                                id="city"
                                name="city"
                                value={form.city}
                                onChange={updateField}
                                className={inputClass}
                                placeholder="Lagos"
                                required
                            />
                        </Field>
                        <Field label="State / Province *" htmlFor="state">
                            <input
                                id="state"
                                name="state"
                                value={form.state}
                                onChange={updateField}
                                className={inputClass}
                                placeholder="Lagos"
                                required
                            />
                        </Field>
                        <Field label="Country *" htmlFor="country">
                            <input
                                id="country"
                                name="country"
                                value={form.country}
                                onChange={updateField}
                                className={inputClass}
                                required
                            />
                        </Field>
                        <Field label="Postal code" htmlFor="postalCode">
                            <input
                                id="postalCode"
                                name="postalCode"
                                value={form.postalCode}
                                onChange={updateField}
                                className={inputClass}
                                placeholder="Postal code"
                            />
                        </Field>
                        <Field label="Latitude" htmlFor="latitude">
                            <input
                                id="latitude"
                                name="latitude"
                                type="number"
                                step="any"
                                value={form.latitude}
                                onChange={updateField}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Longitude" htmlFor="longitude">
                            <input
                                id="longitude"
                                name="longitude"
                                type="number"
                                step="any"
                                value={form.longitude}
                                onChange={updateField}
                                className={inputClass}
                            />
                        </Field>
                    </>
                )}
            </div>

            <div className="mt-8 flex justify-between border-t border-gray-100 pt-5">
                {activeStep > 1 ? (
                    <button
                        type="button"
                        onClick={() =>
                            setActiveStep((step) => Math.max(step - 1, 1))
                        }
                        className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
                    >
                        Previous
                    </button>
                ) : (
                    <span />
                )}
                {activeStep < 3 ? (
                    <button
                        type="button"
                        onClick={goToNextStep}
                        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Creating property..." : "Create property"}
                    </button>
                )}
            </div>
        </form>
    );
}
