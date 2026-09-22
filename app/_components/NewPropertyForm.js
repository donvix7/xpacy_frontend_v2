"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  Building2, 
  Home, 
  Building, 
  Layers, 
  MapPin, 
  Globe, 
  Calendar, 
  Hash, 
  UserPlus, 
  X, 
  Check, 
  Sparkles, 
  Navigation, 
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { createPropertyNew } from "@/app/_lib/action";

const PROPERTY_TYPES = [
  { value: "RESIDENTIAL", label: "Residential", icon: Home, desc: "Apartments, houses, condos" },
  { value: "COMMERCIAL", label: "Commercial", icon: Building2, desc: "Offices, retail, shops" },
  { value: "INDUSTRIAL", label: "Industrial", icon: Building, desc: "Warehouses, factories" },
  { value: "MIXED_USE", label: "Mixed-Use", icon: Layers, desc: "Residential & commercial" },
];

export default function NewPropertyForm({ allOwners = [], allCities = [], defaultOrgId = "" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [customOwnerInput, setCustomOwnerInput] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      propertyType: "RESIDENTIAL",
      address: "",
      city: "",
      state: "",
      country: "Nigeria",
      postalCode: "",
      latitude: "",
      longitude: "",
      yearBuilt: new Date().getFullYear(),
      totalFloors: 1,
      totalUnits: 1,
      organizationId: defaultOrgId || "",
    }
  });

  const selectedType = watch("propertyType");

  // Fill in the exact schema sample data with one click
  function handleQuickFill() {
    setValue("name", "Sunrise Apartments");
    setValue("description", "Premium modern residential apartment complex located in the heart of the city with luxury finishes and 24/7 security.");
    setValue("propertyType", "RESIDENTIAL");
    setValue("address", "123 Main Street");
    setValue("city", "Lagos");
    setValue("state", "Lagos");
    setValue("country", "Nigeria");
    setValue("postalCode", "100001");
    setValue("latitude", 6.5244);
    setValue("longitude", 3.3792);
    setValue("yearBuilt", 2024);
    setValue("totalFloors", 5);
    setValue("totalUnits", 20);
    setValue("organizationId", defaultOrgId || "org_xpacy_001");

    if (allOwners.length > 0) {
      setSelectedOwners([allOwners[0].id || allOwners[0]._id || "owner_primary"]);
    } else {
      setSelectedOwners(["owner_001"]);
    }

    toast.success("Loaded sample property data!");
  }

  // Auto-detect browser geolocation
  function handleDetectLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", parseFloat(position.coords.latitude.toFixed(6)));
        setValue("longitude", parseFloat(position.coords.longitude.toFixed(6)));
        setIsLocating(false);
        toast.success("Coordinates updated from your current location");
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setIsLocating(false);
        toast.error("Could not retrieve your location. Please enter manually.");
      },
      { timeout: 8000 }
    );
  }

  // Add owner to list
  function handleAddOwner(ownerId) {
    if (!ownerId || !ownerId.trim()) return;
    const cleanId = ownerId.trim();
    if (!selectedOwners.includes(cleanId)) {
      setSelectedOwners((prev) => [...prev, cleanId]);
    }
    setCustomOwnerInput("");
  }

  // Remove owner
  function handleRemoveOwner(idToRemove) {
    setSelectedOwners((prev) => prev.filter((id) => id !== idToRemove));
  }

  async function onSubmit(data) {
    startTransition(async () => {
      const payload = {
        ...data,
        latitude: data.latitude === "" ? 0 : Number(data.latitude),
        longitude: data.longitude === "" ? 0 : Number(data.longitude),
        yearBuilt: Number(data.yearBuilt) || 0,
        totalFloors: Number(data.totalFloors) || 0,
        totalUnits: Number(data.totalUnits) || 0,
        owners: selectedOwners
      };

      const res = await createPropertyNew(payload);

      if (res.success) {
        toast.success(res.message || "Property created successfully!");
        router.push("/dashboard/admin/properties");
      } else {
        toast.error(res.message || "Failed to create property");
      }
    });
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Top Banner / Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-900 to-[#14232d] p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-primary-100 backdrop-blur-md border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              Admin Portal • Property Registration
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Add New Property
            </h1>
            <p className="text-sm text-primary-100/80 max-w-lg leading-relaxed">
              Register a new property development or building into the Xpacy inventory database.
            </p>
          </div>

          <button
            type="button"
            onClick={handleQuickFill}
            className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-white transition-all active:scale-95 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-secondary-500" />
            <span>Quick Fill Demo</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {/* SECTION 1: General Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-700" />
              Basic Information
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Provide the primary identity and classification of the property.
            </p>
          </div>

          {/* Property Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-gray-800">
              Property Name <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                placeholder="e.g., Sunrise Apartments"
                {...register("name", { required: "Property name is required" })}
                className={`w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.name ? "border-error focus:border-error" : "border-gray-200 focus:border-primary"
                }`}
              />
            </div>
            {errors.name && <span className="text-xs text-error">{errors.name.message}</span>}
          </div>

          {/* Property Type Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-800">
              Property Type <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PROPERTY_TYPES.map((type) => {
                const IconComponent = type.icon;
                const isSelected = selectedType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue("propertyType", type.value)}
                    className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary"
                        : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <span className="font-bold text-sm">{type.label}</span>
                    <span className="text-xs text-gray-500 mt-0.5">{type.desc}</span>
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register("propertyType", { required: true })} />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-semibold text-gray-800">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe the property, key features, amenities, environment, etc."
              {...register("description")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>
        </div>

        {/* SECTION 2: Location & Address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-700" />
                Location & Coordinates
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Pinpoint the physical location and regional jurisdiction of this building.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700 cursor-pointer transition-colors disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 text-primary-700 ${isLocating ? "animate-spin" : ""}`} />
              <span>{isLocating ? "Detecting GPS..." : "Auto-detect GPS"}</span>
            </button>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <label htmlFor="address" className="text-sm font-semibold text-gray-800">
              Street Address <span className="text-error">*</span>
            </label>
            <input
              id="address"
              type="text"
              placeholder="e.g., 123 Main Street"
              {...register("address", { required: "Street address is required" })}
              className={`w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.address ? "border-error focus:border-error" : "border-gray-200 focus:border-primary"
              }`}
            />
            {errors.address && <span className="text-xs text-error">{errors.address.message}</span>}
          </div>

          {/* City & State Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="city" className="text-sm font-semibold text-gray-800">
                City <span className="text-error">*</span>
              </label>
              <input
                id="city"
                type="text"
                placeholder="e.g., Lagos"
                {...register("city", { required: "City is required" })}
                className={`w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.city ? "border-error focus:border-error" : "border-gray-200 focus:border-primary"
                }`}
              />
              {errors.city && <span className="text-xs text-error">{errors.city.message}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="state" className="text-sm font-semibold text-gray-800">
                State / Region <span className="text-error">*</span>
              </label>
              <input
                id="state"
                type="text"
                placeholder="e.g., Lagos"
                {...register("state", { required: "State is required" })}
                className={`w-full rounded-xl border bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.state ? "border-error focus:border-error" : "border-gray-200 focus:border-primary"
                }`}
              />
              {errors.state && <span className="text-xs text-error">{errors.state.message}</span>}
            </div>
          </div>

          {/* Country & Postal Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="country" className="text-sm font-semibold text-gray-800">
                Country
              </label>
              <input
                id="country"
                type="text"
                placeholder="Nigeria"
                {...register("country")}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="postalCode" className="text-sm font-semibold text-gray-800">
                Postal Code
              </label>
              <input
                id="postalCode"
                type="text"
                placeholder="e.g., 100001"
                {...register("postalCode")}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Latitude & Longitude Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              <label htmlFor="latitude" className="text-xs font-semibold text-gray-600">
                Latitude
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                placeholder="0.000000"
                {...register("latitude")}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="longitude" className="text-xs font-semibold text-gray-600">
                Longitude
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                placeholder="0.000000"
                {...register("longitude")}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Building Specifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-700" />
              Building Specifications
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Structural dimensions, capacity, and construction timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Year Built */}
            <div className="flex flex-col gap-2">
              <label htmlFor="yearBuilt" className="text-sm font-semibold text-gray-800">
                Year Built
              </label>
              <input
                id="yearBuilt"
                type="number"
                min="1800"
                max="2100"
                placeholder="2024"
                {...register("yearBuilt")}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Total Floors */}
            <div className="flex flex-col gap-2">
              <label htmlFor="totalFloors" className="text-sm font-semibold text-gray-800">
                Total Floors
              </label>
              <input
                id="totalFloors"
                type="number"
                min="0"
                placeholder="0"
                {...register("totalFloors")}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Total Units */}
            <div className="flex flex-col gap-2">
              <label htmlFor="totalUnits" className="text-sm font-semibold text-gray-800">
                Total Units
              </label>
              <input
                id="totalUnits"
                type="number"
                min="0"
                placeholder="0"
                {...register("totalUnits")}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Organization & Ownership */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary-700" />
              Organization & Ownership
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Associate this property with your organization and registered property owners.
            </p>
          </div>

          {/* Organization ID */}
          <div className="flex flex-col gap-2">
            <label htmlFor="organizationId" className="text-sm font-semibold text-gray-800">
              Organization ID
            </label>
            <input
              id="organizationId"
              type="text"
              placeholder="e.g., org_c18f3a9"
              {...register("organizationId")}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-xs"
            />
          </div>

          {/* Owners Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-800">
              Property Owners
            </label>
            <p className="text-xs text-gray-500">
              Select from existing registered owners or enter custom owner identifiers.
            </p>

            {/* Existing Owners Dropdown */}
            {allOwners.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-600">Choose from registered owners:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddOwner(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  defaultValue=""
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Select an owner to add --</option>
                  {allOwners.map((owner, idx) => {
                    const id = owner.id || owner._id || `owner_${idx}`;
                    const name = owner.first_name || owner.name ? `${owner.first_name || ""} ${owner.last_name || owner.name || ""}`.trim() : owner.email || id;
                    return (
                      <option key={id} value={id}>
                        {name} ({owner.email || id})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Custom Owner ID Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customOwnerInput}
                onChange={(e) => setCustomOwnerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOwner(customOwnerInput);
                  }
                }}
                placeholder="Or type custom owner ID / email"
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => handleAddOwner(customOwnerInput)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Selected Owners Badges */}
            <div className="flex flex-wrap gap-2 mt-2 min-h-[36px] p-3 rounded-xl bg-gray-50 border border-gray-100">
              {selectedOwners.length === 0 ? (
                <span className="text-xs text-gray-400 italic">No owners attached yet.</span>
              ) : (
                selectedOwners.map((ownerId) => {
                  const matched = allOwners.find((o) => (o.id || o._id) === ownerId);
                  const displayName = matched 
                    ? `${matched.first_name || ""} ${matched.last_name || matched.name || ""}`.trim() || matched.email 
                    : ownerId;
                  return (
                    <span
                      key={ownerId}
                      className="inline-flex items-center gap-1.5 py-1 px-3 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-800 shadow-xs"
                    >
                      <span className="max-w-[200px] truncate">{displayName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOwner(ownerId)}
                        className="text-gray-400 hover:text-error transition-colors p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 py-4">
          <button
            type="button"
            onClick={() => {
              reset();
              setSelectedOwners([]);
            }}
            disabled={isPending}
            className="px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-sm text-gray-700 transition-all cursor-pointer disabled:opacity-50"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{isPending ? "Creating Property..." : "Create Property"}</span>
            <ArrowRight className={`w-4 h-4 ${isPending ? "animate-pulse" : ""}`} />
          </button>
        </div>
      </form>
    </div>
  );
}
