"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import ProgressBar from "./ProgressBar";
import SearchPropertyOwner from "./SearchPropertyOwner";
import FormInput from "./FormInput";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import axios from "axios";
import SpinnerMini from "./SpinnerMini";
import { url } from "../_lib/constants";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import { addProperty } from "../_lib/action";

// Property type enum (must match backend)
const propertyType = [
  { id: 1, value: "RESIDENTIAL", label: "Residential" },
  { id: 2, value: "COMMERCIAL", label: "Commercial" },
  { id: 3, value: "INDUSTRIAL", label: "Industrial" },
  { id: 4, value: "MIXED_USE", label: "Mixed Use" },
  { id: 5, value: "LAND", label: "Land" },
];

const emptyForm = {
  name: "",
  description: "",
  propertyType: "",
  address: "",
  city: "",
  state: "",
  country: "Nigeria",
  postalCode: "",
  latitude: "",
  longitude: "",
  yearBuilt: "",
  totalFloors: "",
  totalUnits: "",
  organizationId: "",
};

const AddNewPropertyForm = ({
  allOwners = [],
  allCities = [],
  token,
  preSelectedOwner,
  initialData,
  isEditMode = false,
  propertyOwnerInfo = null,
  disableSearch,
  propertyObj = {},
  isReadOnly = false,
}) => {
  const effectiveOwner = preSelectedOwner || propertyOwnerInfo || null;
  const effectiveData =
    initialData ||
    (Object.keys(propertyObj).length > 0 ? propertyObj : null) ||
    {};

  const [activeStep, setActiveStep] = useState(effectiveOwner ? 2 : 1);

  // Selected owners (array of owner IDs)
  const [owners, setOwners] = useState(() => {
    if (effectiveOwner?.id) return [effectiveOwner.id];
    if (Array.isArray(effectiveData?.owners)) {
      // owners may come back as array of ids OR array of objects
      return effectiveData.owners.map((o) =>
        typeof o === "string" ? o : o.id
      );
    }
    return [];
  });

  // Primary owner used to display form fields in step 1
  const [propertyOwner, setPropertyOwner] = useState(() => effectiveOwner);

  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(effectiveData?.name && { name: effectiveData.name }),
    ...(effectiveData?.description && { description: effectiveData.description }),
    ...(effectiveData?.propertyType && { propertyType: effectiveData.propertyType }),
    ...(effectiveData?.address && { address: effectiveData.address }),
    ...(effectiveData?.city && { city: effectiveData.city }),
    ...(effectiveData?.state && { state: effectiveData.state }),
    ...(effectiveData?.country && { country: effectiveData.country }),
    ...(effectiveData?.postalCode && { postalCode: effectiveData.postalCode }),
    ...(effectiveData?.latitude !== undefined && { latitude: effectiveData.latitude }),
    ...(effectiveData?.longitude !== undefined && { longitude: effectiveData.longitude }),
    ...(effectiveData?.yearBuilt !== undefined && { yearBuilt: effectiveData.yearBuilt }),
    ...(effectiveData?.totalFloors !== undefined && { totalFloors: effectiveData.totalFloors }),
    ...(effectiveData?.totalUnits !== undefined && { totalUnits: effectiveData.totalUnits }),
    ...(effectiveData?.organizationId && { organizationId: effectiveData.organizationId }),
  }));

  const [isPending, setIsPending] = useState(false);
  const pathname = usePathname();

  // Sync owner form fields when selected owner changes
  useEffect(() => {
    if (propertyOwner?.id && !owners.includes(propertyOwner.id)) {
      setOwners([propertyOwner.id]);
    }
  }, [propertyOwner]); // eslint-disable-line

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Build the exact payload the API expects
  const buildPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    propertyType: form.propertyType,
    address: form.address.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    country: form.country.trim() || "Nigeria",
    postalCode: form.postalCode.trim(),
    latitude: Number(form.latitude) || 0,
    longitude: Number(form.longitude) || 0,
    yearBuilt: Number(form.yearBuilt) || 0,
    totalFloors: Number(form.totalFloors) || 0,
    totalUnits: Number(form.totalUnits) || 0,
    organizationId: form.organizationId || "",
    owners,
  });

  const validate = () => {
    if (!owners.length) return "Please select at least one property owner.";
    if (!form.name.trim()) return "Property name is required.";
    if (!form.propertyType) return "Property type is required.";
    if (!form.address.trim()) return "Address is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.state.trim()) return "State is required.";
    return null;
  };

  // ---- API call ----

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) return toast.error(error);

    const payload = buildPayload();
    setIsPending(true);

    try {
      const data = await toast.promise(addProperty(payload), {
        loading: isEditMode ? "Updating property..." : "Adding new property...",
        success: (res) =>
          res?.message ||
          (isEditMode
            ? "Property updated successfully!"
            : "Property added successfully!"),
        error: (err) =>
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save property.",
      });

      // Optional: reset on create
      if (!isEditMode && data?.success !== false) {
        setForm({ ...emptyForm });
        setOwners([]);
        setPropertyOwner(null);
        setActiveStep(1);
      }
    } catch (err) {
      // toast.promise already handled the error toast
      console.error("addProperty error:", err);
    } finally {
      setIsPending(false);
    }
  };

  // Determine header text
  const isDetailsView =
    pathname.includes("property-details") && !pathname.includes("/add");
  const headerTitle = isDetailsView
    ? "Property Details"
    : isEditMode
    ? "Edit Property"
    : "Add New Property";

  return (
    <div className="flex flex-col gap-12 w-[796px] mx-auto pb-12">
      {/* Header */}
      <header className="flex flex-col items-center justify-center gap-4">
        <h2 className="text-3xl font-bold text-primary">{headerTitle}</h2>
        {!isDetailsView && !isEditMode && (
          <p className="font-mono">
            Fill in the correct detailed information for the new property.
          </p>
        )}
      </header>

      {/* Progress bar */}
      <ProgressBar activeStep={activeStep} setActiveStep={setActiveStep} />

      {/* Form */}
      <form className="p-6 flex flex-col gap-8" onSubmit={handleSubmit}>
        {/* ---------- STEP 1: Owner ---------- */}
        {activeStep === 1 && (
          <>
            <h3 className="text-lg">Owner Information</h3>
            <SearchPropertyOwner
              disabled={disableSearch}
              propertyOwner={propertyOwner}
              setPropertyOwner={setPropertyOwner}
              allOwners={allOwners}
            />

            <div className="flex flex-col gap-6">
              <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                <FormInput label="First Name" id="firstname">
                  <input
                    disabled
                    value={propertyOwner?.first_name || ""}
                    readOnly
                    type="text"
                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                  />
                </FormInput>
                <FormInput label="Last Name" id="lastname">
                  <input
                    disabled
                    value={propertyOwner?.last_name || ""}
                    readOnly
                    type="text"
                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                  />
                </FormInput>
              </div>

              <FormInput label="Email address" id="email">
                <input
                  disabled
                  value={propertyOwner?.email || ""}
                  readOnly
                  type="email"
                  className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                />
              </FormInput>

              <FormInput label="Phone number" id="phone">
                <input
                  disabled
                  value={propertyOwner?.phone || ""}
                  readOnly
                  type="tel"
                  className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                />
              </FormInput>

              <FormInput label="Address" id="owner_address">
                <input
                  disabled
                  value={propertyOwner?.address || ""}
                  readOnly
                  type="text"
                  className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                />
              </FormInput>
            </div>
          </>
        )}

        {/* ---------- STEP 2: Property Overview ---------- */}
        {activeStep === 2 && (
          <>
            <h3 className="text-lg">Property Overview</h3>
            <div className="flex flex-col gap-6">
              <FormInput label="Property Name" id="name">
                <input
                  disabled={isReadOnly}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  type="text"
                  id="name"
                  placeholder="Enter property name"
                  className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                />
              </FormInput>

              <FormInput label="Property Address" id="address">
                <input
                  disabled={isReadOnly}
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  type="text"
                  id="address"
                  placeholder="Enter property address"
                  className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                />
              </FormInput>

              <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                <FormInput label="State" id="state">
                  <select
                    disabled={isReadOnly}
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    id="state"
                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                  >
                    <option value="">Select a state</option>
                    {allCities.map((city) => (
                      <option key={city.id} value={city.location}>
                        {city.location}
                      </option>
                    ))}
                  </select>
                </FormInput>

                <FormInput label="City/Town" id="city">
                  <input
                    disabled={isReadOnly}
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    type="text"
                    id="city"
                    placeholder="Enter city/town"
                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                  />
                </FormInput>
              </div>

              <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                <FormInput label="Property Type" id="propertyType">
                  <select
                    disabled={isReadOnly}
                    value={form.propertyType}
                    onChange={(e) => updateField("propertyType", e.target.value)}
                    id="propertyType"
                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                  >
                    <option value="">Select a property type</option>
                    {propertyType.map((item) => (
                      <option key={item.id} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </FormInput>

                <FormInput label="Postal Code" id="postalCode">
                  <input
                    disabled={isReadOnly}
                    value={form.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    type="text"
                    id="postalCode"
                    placeholder="Enter postal code"
                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                  />
                </FormInput>
              </div>

              <FormInput label="Country" id="country">
                <input
                  disabled={isReadOnly}
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  type="text"
                  id="country"
                  placeholder="Enter country"
                  className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                />
              </FormInput>

              <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                <FormInput label="Year Built" id="yearBuilt">
                  <input
                    disabled={isReadOnly}
                    value={form.yearBuilt}
                    onChange={(e) => updateField("yearBuilt", e.target.value)}
                    type="number"
                    id="yearBuilt"
                    placeholder="e.g. 2020"
                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                  />
                </FormInput>

                <FormInput label="Total Floors" id="totalFloors">
                  <input
                    disabled={isReadOnly}
                    value={form.totalFloors}
                    onChange={(e) => updateField("totalFloors", e.target.value)}
                    type="number"
                    id="totalFloors"
                    placeholder="e.g. 3"
                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                  />
                </FormInput>

                <FormInput label="Total Units" id="totalUnits">
                  <input
                    disabled={isReadOnly}
                    value={form.totalUnits}
                    onChange={(e) => updateField("totalUnits", e.target.value)}
                    type="number"
                    id="totalUnits"
                    placeholder="e.g. 20"
                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                  />
                </FormInput>
              </div>

              <FormInput label="Organization ID" id="organizationId">
                <input
                  disabled={isReadOnly}
                  value={form.organizationId}
                  onChange={(e) =>
                    updateField("organizationId", e.target.value)
                  }
                  type="text"
                  id="organizationId"
                  placeholder="Enter organization ID"
                  className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                />
              </FormInput>

              <div className="md:flex-1 w-full flex flex-col space-y-2 font-mono">
                <label
                  htmlFor="description"
                  className="text-sm text-black flex items-center gap-2"
                >
                  Property Description
                  <span className="text-[10px] font-normal text-gray-500">
                    (HTML Supported)
                  </span>
                </label>
                <textarea
                  disabled={isReadOnly}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  id="description"
                  rows={8}
                  className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 resize-none focus:outline-none border-primary-200"
                  placeholder="Enter property description here..."
                />
              </div>
            </div>
          </>
        )}

        {/* ---------- STEP 3: Location Coordinates ---------- */}
        {activeStep === 3 && (
          <>
            <h3 className="text-lg">Location Coordinates</h3>
            <div className="flex flex-col gap-6">
              <span className="font-mono font-medium">
                Coordinates{" "}
                <a
                  className="text-blue-500 font-medium"
                  href="https://www.latlong.net"
                  target="_blank"
                  rel="noreferrer"
                >
                  (Get coordinates)
                </a>
              </span>

              <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                <FormInput label="Latitude" id="latitude">
                  <input
                    disabled={isReadOnly}
                    value={form.latitude}
                    onChange={(e) => updateField("latitude", e.target.value)}
                    type="number"
                    step="any"
                    id="latitude"
                    placeholder="e.g. 6.5244"
                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                  />
                </FormInput>
                <FormInput label="Longitude" id="longitude">
                  <input
                    disabled={isReadOnly}
                    value={form.longitude}
                    onChange={(e) => updateField("longitude", e.target.value)}
                    type="number"
                    step="any"
                    id="longitude"
                    placeholder="e.g. 3.3792"
                    className="rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200"
                  />
                </FormInput>
              </div>
            </div>
          </>
        )}

        {/* ---------- Navigation ---------- */}
        <div
          className={`${
            activeStep > 1 ? "flex items-center justify-between" : "self-end"
          }`}
        >
          {activeStep > 1 && (
            <button
              type="button"
              onClick={() =>
                setActiveStep((prev) =>
                  prev > (preSelectedOwner ? 2 : 1)
                    ? prev - 1
                    : preSelectedOwner
                    ? 2
                    : 1
                )
              }
              className={`bg-white px-4 py-2 font-mono text-primary rounded-lg hover:bg-primary-100/80 cursor-pointer transition flex items-center gap-2 ${
                activeStep === 2 && preSelectedOwner ? "invisible" : ""
              }`}
            >
              <FaAngleLeft />
              <span>Previous</span>
            </button>
          )}

          {activeStep < 3 ? (
            <button
              type="button"
              onClick={() =>
                setActiveStep((prev) => (prev < 3 ? prev + 1 : 3))
              }
              className="px-4 py-2 font-mono text-primary rounded-lg hover:bg-primary-100/80 cursor-pointer transition flex items-center gap-2"
            >
              <span>Next</span>
              <FaAngleRight />
            </button>
          ) : (
            !isDetailsView && (
              <button
                disabled={isPending}
                type="submit"
                className="px-4 py-2 bg-primary-200 font-mono text-primary rounded-lg hover:bg-primary-200/80 cursor-pointer transition flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{isEditMode ? "Save Changes" : "Finish"}</span>
                {isPending && <SpinnerMini />}
              </button>
            )
          )}
        </div>
      </form>
    </div>
  );
};

export default AddNewPropertyForm;