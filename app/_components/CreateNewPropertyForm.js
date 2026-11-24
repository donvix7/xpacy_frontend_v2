"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Autocomplete, TextField } from "@mui/material";
import { Building2 } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "@/app/_components/FormInput";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { addProperty, updateProperty } from "@/app/_lib/action";

const propertyStatuses = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "UNDER_MAINTENANCE", label: "Under Maintenance" },
  { value: "ARCHIVED", label: "Archived" },
];

const propertyTypes = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "MIXED_USE", label: "Mixed Use" },
  { value: "APARTMENT_COMPLEX", label: "Apartment Complex" },
  { value: "ESTATE", label: "Estate" },
  { value: "HOTEL", label: "Hotel" },
  { value: "OFFICE", label: "Office" },
  { value: "RETAIL", label: "Retail" },
  { value: "LAND", label: "Land" },
  { value: "VILLA", label: "Villa" },
  { value: "OTHER", label: "Other" },
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
  latitude: "",
  longitude: "",
  yearBuilt: new Date().getFullYear(),
  totalFloors: 1,
  totalUnits: 1,
  organizationId: "",
};

const inputClass =
  "rounded-lg border border-line px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink";

const getOwnerId = (owner) => String(owner?.id ?? owner?._id ?? "");

const getOwnerName = (owner) => {
  const name = [
    owner?.first_name || owner?.firstname || owner?.firstName,
    owner?.last_name || owner?.lastname || owner?.lastName,
  ]
    .filter(Boolean)
    .join(" ");
  return name || owner?.name || owner?.email || "Unnamed owner";
};

export default function CreateNewPropertyForm({
  owners = [],
  currentOwner = null,
  organizations = [],
  organizationId = "",
  userRole = "admin",
  initialData = null,
  isEditMode = false,
  returnTo = "",
}) {
  const router = useRouter();
  const defaultOwnerId = currentOwner ? getOwnerId(currentOwner) : "";
  const propertyId = initialData?.id || initialData?._id || "";

  const normalizedRole = String(userRole || "").toLowerCase().replace(/[_-\s]+/g, "");
  const backHref =
    returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : normalizedRole === "propertymanager" || normalizedRole === "manager"
        ? "/dashboard/property-manager/properties"
        : "/dashboard/property-owner/properties";

  const [form, setForm] = useState(() => ({
    ...initialForm,
    name: initialData?.name || "",
    description: initialData?.description || "",
    propertyType: initialData?.propertyType || "RESIDENTIAL",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    country: initialData?.country || "Nigeria",
    postalCode: initialData?.postalCode || "",
    latitude:
      initialData?.latitude !== null && initialData?.latitude !== undefined
        ? String(initialData.latitude)
        : "",
    longitude:
      initialData?.longitude !== null && initialData?.longitude !== undefined
        ? String(initialData.longitude)
        : "",
    yearBuilt: initialData?.yearBuilt ?? new Date().getFullYear(),
    totalFloors: initialData?.totalFloors ?? 1,
    totalUnits: initialData?.totalUnits ?? 1,
    organizationId: initialData?.organizationId || organizationId || "",
    status: (initialData?.status || "ACTIVE").toUpperCase(),
  }));

  const [selectedOwners, setSelectedOwners] = useState(() => {
    if (Array.isArray(initialData?.owners) && initialData.owners.length > 0) {
      return initialData.owners
        .map((o) => (typeof o === "string" ? o : getOwnerId(o)))
        .filter(Boolean);
    }
    return defaultOwnerId ? [defaultOwnerId] : [];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select current owner if set or updated
  useEffect(() => {
    if (defaultOwnerId) {
      setSelectedOwners((prev) => {
        if (!prev || prev.length === 0) {
          return [defaultOwnerId];
        }
        return prev;
      });
    }
  }, [defaultOwnerId]);

  useEffect(() => {
    if (organizationId && !form.organizationId) {
      setForm((prev) => ({ ...prev, organizationId }));
    }
  }, [organizationId, form.organizationId]);

  // Deduplicate owners by id (or email as fallback) and ensure currentOwner is included
  const uniqueOwners = useMemo(() => {
    const list = [...owners];
    if (currentOwner && getOwnerId(currentOwner)) {
      const exists = list.some(
        (o) => getOwnerId(o) === getOwnerId(currentOwner)
      );
      if (!exists) {
        list.unshift(currentOwner);
      }
    }
    const seen = new Set();
    return list.filter((owner) => {
      const id = getOwnerId(owner) || owner?.email || "";
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [owners, currentOwner]);

  const ownerById = useMemo(
    () => new Map(uniqueOwners.map((owner) => [getOwnerId(owner), owner])),
    [uniqueOwners]
  );

  const selectedOwnerOptions = selectedOwners
    .map((id) => ownerById.get(id))
    .filter(Boolean);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  function validateForm() {
    if (!String(form.organizationId || "").trim()) {
      return "Select an organization.";
    }
    if (!form.name.trim()) return "Property name is required.";
    if (!form.propertyType) return "Property type is required.";
    if (!form.address.trim()) return "Address is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.state.trim()) return "State / Province is required.";
    if (!form.country.trim()) return "Country is required.";

    if (form.latitude !== "") {
      const lat = Number(form.latitude);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        return "Latitude must be between -90 and 90 (e.g. 6.5244).";
      }
    }
    if (form.longitude !== "") {
      const lng = Number(form.longitude);
      if (Number.isNaN(lng) || lng < -180 || lng > 180) {
        return "Longitude must be between -180 and 180 (e.g. 3.3792).";
      }
    }
    return null;
  }

  async function handleSubmit(event) {
    event?.preventDefault?.();
    if (isSubmitting) return;

    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    const ownersPayload = selectedOwners
      .map((id) => String(id).trim())
      .filter(Boolean);

    const parsedYear = parseInt(form.yearBuilt, 10);
    const validYear =
      Number.isFinite(parsedYear) && parsedYear >= 1800 ? parsedYear : null;

    const cleanOrgId = form.organizationId
      ? String(form.organizationId).trim()
      : "";

    const hasLat = form.latitude !== "" && !Number.isNaN(Number(form.latitude));
    const hasLng = form.longitude !== "" && !Number.isNaN(Number(form.longitude));
    const totalFloors = Number(form.totalFloors);
    const totalUnits = Number(form.totalUnits);

    const payload = {
      name: form.name.trim(),
      propertyType: form.propertyType,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim() || "Nigeria",
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      ...(form.postalCode.trim() ? { postalCode: form.postalCode.trim() } : {}),
      ...(hasLat ? { latitude: Number(form.latitude) } : {}),
      ...(hasLng ? { longitude: Number(form.longitude) } : {}),
      ...(validYear ? { yearBuilt: validYear } : {}),
      ...(Number.isFinite(totalFloors) && totalFloors > 0 ? { totalFloors } : {}),
      ...(Number.isFinite(totalUnits) && totalUnits > 0 ? { totalUnits } : {}),
      ...(ownersPayload.length > 0 ? { owners: ownersPayload } : {}),
      ...(cleanOrgId ? { organizationId: cleanOrgId } : {}),
      ...(isEditMode && form.status ? { status: form.status } : {}),
    };

    setIsSubmitting(true);
    try {
      const result =
        isEditMode && propertyId
          ? await updateProperty(propertyId, payload)
          : await addProperty(payload);

      if (result?.success === false || result?.error) {
        toast.error(
          result.message ||
            result.error ||
            (isEditMode
              ? "Could not update the property."
              : "Could not create the property.")
        );
        return;
      }

      toast.success(
        result?.message ||
          (isEditMode
            ? "Property updated successfully!"
            : "Property created successfully!")
      );

      if (isEditMode) {
        router.refresh();
        const redirectPath =
          returnTo ||
          (normalizedRole === "propertymanager" || normalizedRole === "manager"
            ? `/dashboard/property-manager/properties/${propertyId}`
            : `/dashboard/property-owner/properties/${propertyId}`);
        setTimeout(() => {
          router.push(redirectPath);
        }, 600);
        return;
      }

      setForm({ ...initialForm, organizationId });
      setSelectedOwners(defaultOwnerId ? [defaultOwnerId] : []);
      router.refresh();

      setTimeout(() => {
        router.push(backHref);
      }, 600);
    } catch (err) {
      toast.error(
        err?.message ||
          (isEditMode
            ? "Could not update the property."
            : "Could not create the property.")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
    >
      {/* Property Details */}
      <div className="flex flex-col gap-6">
        <p className="text-base font-semibold text-ink border-b border-line pb-3">
          Property Details
        </p>

        <FormInput label="Property Name *" id="name">
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={updateField}
            className={inputClass}
            placeholder="e.g. Sunrise Apartments"
            required
          />
        </FormInput>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormInput label="Property Type *" id="propertyType">
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
          </FormInput>

          {organizations.length > 0 && (
            <FormInput label="Organization *" id="organizationId">
              <select
                id="organizationId"
                name="organizationId"
                value={form.organizationId}
                onChange={updateField}
                className={inputClass}
                required
              >
                <option value="">Select an organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </FormInput>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FormInput label="Year Built" id="yearBuilt">
            <input
              id="yearBuilt"
              name="yearBuilt"
              type="number"
              min="1800"
              max={new Date().getFullYear() + 5}
              value={form.yearBuilt}
              onChange={updateField}
              className={inputClass}
              placeholder={String(new Date().getFullYear())}
            />
          </FormInput>

          <FormInput label="Total Floors" id="totalFloors">
            <input
              id="totalFloors"
              name="totalFloors"
              type="number"
              min="1"
              value={form.totalFloors}
              onChange={updateField}
              className={inputClass}
              placeholder="1"
            />
          </FormInput>

          <FormInput label="Total Units" id="totalUnits">
            <input
              id="totalUnits"
              name="totalUnits"
              type="number"
              min="1"
              value={form.totalUnits}
              onChange={updateField}
              className={inputClass}
              placeholder="1"
            />
          </FormInput>
        </div>

        {isEditMode && (
          <FormInput label="Property Status" id="status">
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={updateField}
              className={inputClass}
            >
              {propertyStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormInput>
        )}

        <FormInput label="Description" id="description">
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={updateField}
            className={`${inputClass} resize-y`}
            placeholder="Describe the property, amenities, and key features"
          />
        </FormInput>
      </div>

      {/* Location */}
      <div className="flex flex-col gap-6">
        <p className="text-base font-semibold text-ink border-b border-line pb-3">
          Location
        </p>

        <FormInput label="Address *" id="address">
          <input
            id="address"
            name="address"
            type="text"
            value={form.address}
            onChange={updateField}
            className={inputClass}
            placeholder="e.g. 123 Main Street"
            required
          />
        </FormInput>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormInput label="City *" id="city">
            <input
              id="city"
              name="city"
              type="text"
              value={form.city}
              onChange={updateField}
              className={inputClass}
              placeholder="e.g. Lagos"
              required
            />
          </FormInput>

          <FormInput label="State / Province *" id="state">
            <input
              id="state"
              name="state"
              type="text"
              value={form.state}
              onChange={updateField}
              className={inputClass}
              placeholder="e.g. Lagos"
              required
            />
          </FormInput>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormInput label="Country *" id="country">
            <input
              id="country"
              name="country"
              type="text"
              value={form.country}
              onChange={updateField}
              className={inputClass}
              required
            />
          </FormInput>

          <FormInput label="Postal Code" id="postalCode">
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              value={form.postalCode}
              onChange={updateField}
              className={inputClass}
              placeholder="e.g. 100001"
            />
          </FormInput>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormInput label="Latitude (-90 to 90)" id="latitude">
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              min="-90"
              max="90"
              value={form.latitude}
              onChange={updateField}
              className={inputClass}
              placeholder="e.g. 6.5244"
            />
          </FormInput>

          <FormInput label="Longitude (-180 to 180)" id="longitude">
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              min="-180"
              max="180"
              value={form.longitude}
              onChange={updateField}
              className={inputClass}
              placeholder="e.g. 3.3792"
            />
          </FormInput>
        </div>
      </div>

      {/* Ownership */}
      <div className="flex flex-col gap-6">
        <p className="text-base font-semibold text-ink border-b border-line pb-3">
          Ownership
        </p>

        <FormInput label="Owners (Optional)" id="owners">
          <Autocomplete
            id="owners"
            multiple
            options={uniqueOwners}
            value={selectedOwnerOptions}
            onChange={(_, selected) =>
              setSelectedOwners(selected.map((owner) => getOwnerId(owner)))
            }
            getOptionLabel={getOwnerName}
            getOptionKey={(option) =>
              getOwnerId(option) || option?.email || ""
            }
            isOptionEqualToValue={(option, value) =>
              getOwnerId(option) === getOwnerId(value)
            }
            renderInput={(autocompleteParams) => (
              <TextField
                {...autocompleteParams}
                placeholder="Search owner by name or email"
              />
            )}
            sx={{
              width: "100%",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                fontFamily: "inherit",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--line, #DADADA)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--primary, #477899)",
              },
            }}
          />
          <span className="-mt-1 text-xs text-mute">
            Search and select one or more property owners. The first owner is primary.
          </span>
        </FormInput>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-line pt-6">
        <Link
          href={backHref}
          className="w-full sm:w-auto text-center rounded-lg border border-line px-6 py-3 font-mono text-sm font-medium text-ink hover:bg-canvas transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-mono text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer"
        >
          {isSubmitting ? (
            <SpinnerMini />
          ) : (
            <Building2 className="h-4 w-4" aria-hidden="true" />
          )}
          <span>
            {isSubmitting
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
                ? "Save Changes"
                : "Create Property"}
          </span>
        </button>
      </div>
    </form>
  );
}
