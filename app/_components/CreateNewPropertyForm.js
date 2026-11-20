"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Autocomplete, TextField } from "@mui/material";
import toast from "react-hot-toast";
import { addProperty } from "@/app/_lib/action";

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
  latitude: "",
  longitude: "",
  yearBuilt: new Date().getFullYear(),
  totalFloors: 1,
  totalUnits: 1,
  organizationId: "",
};

const inputClass =
  "w-full rounded-lg border border-primary-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-gray-50 dark:border-line dark:bg-card dark:text-ink";

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
    </div>
  );
}

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
  onChange,
  step,
  onStepChange,
}) {
  const router = useRouter();
  const defaultOwnerId = currentOwner ? getOwnerId(currentOwner) : "";

  const [form, setForm] = useState(() => ({
    ...initialForm,
    organizationId: organizationId || "",
  }));

  const [selectedOwners, setSelectedOwners] = useState(() =>
    defaultOwnerId ? [defaultOwnerId] : []
  );
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

  // Controlled/uncontrolled step: if `step` prop is provided, use it.
  const [localStep, setLocalStep] = useState(1);
  const activeStep = step ?? localStep;
  const setActiveStep = (updater) => {
    const next =
      typeof updater === "function" ? updater(activeStep) : updater;
    if (onStepChange) onStepChange(next);
    else setLocalStep(next);
  };

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

  // Lookup map so we can turn selected IDs into full owner objects,
  // preserving the order in which the user picked them.
  const ownerById = useMemo(
    () => new Map(uniqueOwners.map((owner) => [getOwnerId(owner), owner])),
    [uniqueOwners],
  );

  const selectedOwnerOptions = selectedOwners
    .map((id) => ownerById.get(id))
    .filter(Boolean);

  // Notify parent of preview changes.
  useEffect(() => {
    if (!onChange) return;
    const ownerNames = selectedOwners
      .map((id) => ownerById.get(id))
      .filter(Boolean)
      .map((o) => getOwnerName(o));

    onChange({
      title: form.name,
      description: form.description,
      property_type: form.propertyType,
      city: form.city,
      state: form.state,
      address: form.address,
      country: form.country,
      owners: ownerNames,
    });
  }, [form, selectedOwners, onChange, ownerById]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  function validateStep(currentStep) {
    if (currentStep === 1 && !selectedOwners.length) {
      return "Select at least one property owner.";
    }
    if (currentStep === 2) {
      if (!form.name.trim()) return "Property name is required.";
      if (!form.propertyType) return "Property type is required.";
    }
    if (currentStep === 3) {
      if (!form.address.trim()) return "Address is required.";
      if (!form.city.trim()) return "City is required.";
      if (!form.state.trim()) return "State / Province is required.";
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
    setActiveStep((s) => Math.min(s + 1, 3));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Prioritize the current step, then check the rest.
    const error =
      validateStep(activeStep) || [1, 2, 3].map(validateStep).find(Boolean);

    if (error) {
      toast.error(error);
      return;
    }

    // Build an array of owner objects, preserving selection order.
    const ownersPayload = selectedOwners.map((id, index) => {
      const owner = ownerById.get(id) || {};
      return {
        id,
        role: index === 0 ? "PRIMARY" : "CO_OWNER",
        first_name: owner.first_name || owner.firstname || owner.firstName || "",
        last_name: owner.last_name || owner.lastname || owner.lastName || "",
        email: owner.email || "",
      };
    });
    const parsedYear = parseInt(form.yearBuilt, 10);
    const validYear =
      Number.isFinite(parsedYear) && parsedYear >= 1800
        ? parsedYear
        : new Date().getFullYear();

    const cleanOrgId = form.organizationId
      ? String(form.organizationId).trim()
      : "";

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      propertyType: form.propertyType,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim() || "Nigeria",
      postalCode: form.postalCode.trim(),
      latitude:
        form.latitude !== "" && !Number.isNaN(Number(form.latitude))
          ? Number(form.latitude)
          : 0,
      longitude:
        form.longitude !== "" && !Number.isNaN(Number(form.longitude))
          ? Number(form.longitude)
          : 0,
      yearBuilt: validYear || 0,
      totalFloors: Number(form.totalFloors) || 0,
      totalUnits: Number(form.totalUnits) || 0,
      owners: ownersPayload,
      ...(cleanOrgId ? { organizationId: cleanOrgId } : {}),
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

      toast.success(result?.message || "Property created successfully!");
      setForm({ ...initialForm, organizationId });
      setSelectedOwners(defaultOwnerId ? [defaultOwnerId] : []);
      setActiveStep(1);

      // Redirect to properties view after brief delay so user can see toast
      const redirectPath =
        userRole === "propertyowner"
          ? "/dashboard/property-owner/properties"
          : "/dashboard/admin/properties";

      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
    } catch (error) {
      toast.error(error?.message || "Could not create the property.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col">
      <div className="grid gap-5 md:grid-cols-2">
        {activeStep === 1 && (
          <div className="md:col-span-2">
            <Field label="Owners *" htmlFor="owners">
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
              <p className="mt-1 text-xs text-gray-500 dark:text-mute">
                Search and select one or more property owners. The first owner is primary.
              </p>
            </Field>
          </div>
        )}

        {activeStep === 2 && (
          <>
            <div className="md:col-span-2">
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
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {organizations.length > 0 && (
                <Field label="Organization" htmlFor="organizationId">
                  <select
                    id="organizationId"
                    name="organizationId"
                    value={form.organizationId}
                    onChange={updateField}
                    className={inputClass}
                  >
                    <option value="">Personal (No organization)</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Year built" htmlFor="yearBuilt">
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
              </Field>
              <Field label="Total floors" htmlFor="totalFloors">
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
              </Field>
              <Field label="Total units" htmlFor="totalUnits">
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
              </Field>
            </div>

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
                placeholder="e.g. 6.5244"
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
                placeholder="e.g. 3.3792"
              />
            </Field>
          </>
        )}
      </div>

      <div className="mt-8 flex justify-between border-t border-gray-100 pt-5 dark:border-line">
        {activeStep > 1 ? (
          <button
            type="button"
            onClick={() => setActiveStep((s) => Math.max(s - 1, 1))}
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
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Next step
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "Creating property..." : "Publish property"}
          </button>
        )}
      </div>
    </form>
  );
}
