"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe2,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { createOrganization } from "@/app/_lib/action";
import AdminHeader from "@/app/_components/AdminHeader";

// ---------- Constants ----------
const inputClass =
  "w-full rounded-lg border border-primary-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-gray-50 dark:border-line dark:bg-card dark:text-ink";

const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236b7280%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`;

const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "NGN", label: "NGN — Nigerian Naira" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC — Coordinated Universal Time" },
  { value: "Africa/Abidjan", label: "Africa/Abidjan (GMT)" },
  { value: "Africa/Accra", label: "Africa/Accra (GMT)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (EET)" },
  { value: "Africa/Casablanca", label: "Africa/Casablanca (WET)" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (SAST)" },
  { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi (EAT)" },
];

const stepMeta = [
  {
    id: 1,
    title: "Identity",
    description: "Name and slug — how the organization is identified.",
  },
  {
    id: 2,
    title: "Contact",
    description: "Email, phone and mailing address.",
  },
  {
    id: 3,
    title: "Preferences",
    description: "Timezone and billing currency.",
  },
];

const fields = [
  "name",
  "slug",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "country",
  "timezone",
  "currency",
];

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Field({ label, htmlFor, required, error, children, action }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {action}
      </div>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function AddNewOrganizationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    timezone: "Africa/Lagos",
    currency: "NGN",
  });

  const [isSlugManual, setIsSlugManual] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Field change handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setForm((prev) => {
      const shouldAutoSlug =
        !isSlugManual || !prev.slug || prev.slug === slugify(prev.name);
      return {
        ...prev,
        name: newName,
        slug: shouldAutoSlug ? slugify(newName) : prev.slug,
      };
    });
    if (validationErrors.name) {
      setValidationErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleSlugChange = (e) => {
    const manualSlug = slugify(e.target.value);
    setIsSlugManual(true);
    setForm((prev) => ({
      ...prev,
      slug: manualSlug,
    }));
    if (validationErrors.slug) {
      setValidationErrors((prev) => ({ ...prev, slug: "" }));
    }
  };

  const handleResetSlug = () => {
    setIsSlugManual(false);
    setForm((prev) => ({
      ...prev,
      slug: slugify(prev.name),
    }));
  };

  // Completion calculation
  const filled = fields.filter((k) => String(form[k] || "").trim() !== "").length;
  const completion = Math.round((filled / fields.length) * 100);
  const stepTitle = stepMeta.find((s) => s.id === step)?.title;

  // Step transitions
  const handleNext = () => {
    setError("");
    const errs = {};
    if (step === 1) {
      if (!form.name.trim()) errs.name = "Organization name is required.";
      if (!form.slug.trim()) errs.slug = "Organization slug is required.";
    }
    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      return;
    }
    setValidationErrors({});
    setStep((s) => Math.min(s + 1, 3));
  };

  const handlePrev = () => {
    setError("");
    setValidationErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleStepClick = (targetStep) => {
    if (targetStep > step) {
      if (step === 1 && (!form.name.trim() || !form.slug.trim())) {
        const errs = {};
        if (!form.name.trim()) errs.name = "Organization name is required.";
        if (!form.slug.trim()) errs.slug = "Organization slug is required.";
        setValidationErrors(errs);
        return;
      }
    }
    setError("");
    setValidationErrors({});
    setStep(targetStep);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.slug.trim()) {
      setStep(1);
      setValidationErrors({
        name: !form.name.trim() ? "Organization name is required." : "",
        slug: !form.slug.trim() ? "Organization slug is required." : "",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createOrganization(form);
      const organization =
        result?.data?.organization ||
        result?.data ||
        result?.organization ||
        result;
      const id = organization?.id || organization?._id;

      if (
        result?.success === false ||
        result?.error ||
        (result?.statusCode && result.statusCode >= 400)
      ) {
        const msg = Array.isArray(result?.message)
          ? result.message.join(", ")
          : result?.message || result?.error || "Could not create the organization.";
        setError(msg);
        setIsSubmitting(false);
        return;
      }

      router.push(
        id
          ? `/dashboard/admin/organizations/${id}`
          : "/dashboard/admin/organizations"
      );
      router.refresh();
    } catch (err) {
      setError(
        err?.message ||
          "An unexpected error occurred while creating the organization."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-canvas text-ink">
      {/* ---------- Navigation ---------- */}
      <AdminHeader
        title="New Organization"
        backHref="/dashboard/admin/organizations"
      />

      {/* ---------- Three-column layout ---------- */}
      <main className="grid w-full flex-1 grid-cols-1 items-start gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[280px_minmax(0,1fr)_400px] lg:px-8 xl:grid-cols-[300px_minmax(0,1fr)_440px]">
        {/* ---------- LEFT: Steps rail ---------- */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-primary-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] dark:border-line dark:bg-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-mute">
              Create organization
            </p>
            <p className="mt-1 text-[13.5px] font-semibold text-ink">
              What you'll fill in
            </p>

            <ol className="mt-4 flex flex-col gap-1">
              {stepMeta.map((s) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => handleStepClick(s.id)}
                      className={`group flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors ${
                        isActive
                          ? "bg-primary-50 dark:bg-primary/10"
                          : "hover:bg-primary-50/60 dark:hover:bg-primary/5"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${
                          isDone || isActive
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-700 dark:bg-soft dark:text-mute"
                        }`}
                      >
                        {isDone ? "✓" : s.id}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-[13px] font-semibold ${
                            isActive
                              ? "text-primary-700 dark:text-primary-400"
                              : "text-ink"
                          }`}
                        >
                          {s.title}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] leading-relaxed text-gray-500 dark:text-mute">
                          {s.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-5 border-t border-primary-200/60 pt-3 dark:border-line">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-mute">
                  Progress
                </p>
                <span className="text-[11px] font-semibold tabular-nums text-primary-700 dark:text-primary-400">
                  {filled}/{fields.length}
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary-100 dark:bg-soft"
                role="progressbar"
                aria-valuenow={completion}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-primary-600 transition-[width] duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-primary-200/60 bg-white/60 px-3 py-2.5 dark:border-line dark:bg-card/60">
            <CheckCircle2
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-700 dark:text-primary-400"
              aria-hidden="true"
            />
            <p className="text-[11.5px] leading-relaxed text-gray-600 dark:text-gray-400">
              You can change any of these later from the organization settings.
            </p>
          </div>
        </aside>

        {/* ---------- MIDDLE: Form ---------- */}
        <section className="flex flex-col rounded-2xl border border-primary-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] dark:border-line dark:bg-card">
          <div className="flex items-start justify-between gap-3 border-b border-primary-200/60 px-5 py-4 sm:px-7 sm:py-5 dark:border-line">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary/10 dark:text-primary-400">
                <Building2 className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-ink">
                  Organization details
                </p>
                <p className="mt-0.5 text-[12.5px] text-gray-500 dark:text-mute">
                  Step {step} of {stepMeta.length} · {stepTitle}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700 sm:mx-7 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 sm:p-7">
            {/* Step 1: Identity */}
            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-1">
                <Field
                  label="Organization name"
                  htmlFor="name"
                  required
                  error={validationErrors.name}
                >
                  <input
                    id="name"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Acme Properties Ltd"
                    className={inputClass}
                  />
                </Field>
                <Field
                  label="Slug"
                  htmlFor="slug"
                  required
                  error={validationErrors.slug}
                  action={
                    isSlugManual && (
                      <button
                        type="button"
                        onClick={handleResetSlug}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        title="Reset slug to auto-generate from name"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Auto-sync
                      </button>
                    )
                  }
                >
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-gray-400">
                      /
                    </span>
                    <input
                      id="slug"
                      name="slug"
                      required
                      value={form.slug}
                      onChange={handleSlugChange}
                      placeholder="acme-properties"
                      className={`${inputClass} pl-6`}
                    />
                  </div>
                  <p className="text-[11.5px] text-gray-500 dark:text-mute">
                    Used for unique public URLs and team routing. Automatically
                    generated from the organization name.
                  </p>
                </Field>
              </div>
            )}

            {/* Step 2: Contact */}
            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-1">
                <Field label="Email" htmlFor="email">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="contact@acmeproperties.com"
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone" htmlFor="phone">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+234 800 000 0000"
                    className={inputClass}
                  />
                </Field>
                <Field label="Address" htmlFor="address">
                  <input
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="123 Marina Street, Victoria Island"
                    className={inputClass}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="City" htmlFor="city">
                    <input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Lagos"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="State / Province" htmlFor="state">
                    <input
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="Lagos State"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="Country" htmlFor="country">
                  <input
                    id="country"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Nigeria"
                    className={inputClass}
                  />
                </Field>
              </div>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <div className="grid gap-5 sm:grid-cols-1">
                <Field label="Timezone" htmlFor="timezone">
                  <select
                    id="timezone"
                    name="timezone"
                    value={form.timezone}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select a timezone
                    </option>
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Currency" htmlFor="currency">
                  <select
                    id="currency"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select a currency
                    </option>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap justify-between gap-3 border-t border-primary-200/60 pt-5 dark:border-line">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5 dark:border-primary-400 dark:text-primary-400"
                >
                  Previous
                </button>
              ) : (
                <Link
                  href="/dashboard/admin/organizations"
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-line dark:text-mute dark:hover:bg-soft"
                >
                  Cancel
                </Link>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating organization...
                    </>
                  ) : (
                    "Create organization"
                  )}
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ---------- RIGHT: Live Preview ---------- */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-primary-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] dark:border-line dark:bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-primary-200/60 px-4 py-3 dark:border-line">
              <div className="flex items-center gap-2">
                <Sparkles
                  className="h-3.5 w-3.5 text-primary-700 dark:text-primary-400"
                  aria-hidden="true"
                />
                <p className="text-[12.5px] font-semibold text-ink">
                  Live preview
                </p>
              </div>
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10.5px] font-semibold tabular-nums text-primary-700 dark:bg-primary/10 dark:text-primary-400">
                {completion}% complete
              </span>
            </div>

            <div className="flex flex-col gap-4 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary/10 dark:text-primary-400">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold text-ink">
                    {form.name || "Untitled organization"}
                  </h3>
                  <p className="mt-0.5 truncate text-[12px] text-gray-500 dark:text-mute">
                    {form.slug ? `/${form.slug}` : "Slug not set"}
                  </p>
                </div>
              </div>

              {form.email && (
                <div className="flex items-center gap-2 border-t border-primary-200/60 pt-3 text-[12.5px] text-gray-600 dark:border-line dark:text-gray-300">
                  <Mail
                    className="h-3.5 w-3.5 shrink-0 text-primary-700 dark:text-primary-400"
                    aria-hidden="true"
                  />
                  <span className="truncate">{form.email}</span>
                </div>
              )}

              {form.phone && (
                <div className="flex items-center gap-2 text-[12.5px] text-gray-600 dark:text-gray-300">
                  <Phone
                    className="h-3.5 w-3.5 shrink-0 text-primary-700 dark:text-primary-400"
                    aria-hidden="true"
                  />
                  <span className="truncate">{form.phone}</span>
                </div>
              )}

              {(form.address || form.city || form.state || form.country) && (
                <div className="flex items-start gap-2 border-t border-primary-200/60 pt-3 text-[12.5px] text-gray-600 dark:border-line dark:text-gray-300">
                  <MapPin
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-700 dark:text-primary-400"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    {form.address && (
                      <span className="block truncate">{form.address}</span>
                    )}
                    {(form.city || form.state || form.country) && (
                      <span className="block text-gray-500 dark:text-mute">
                        {[form.city, form.state, form.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-1.5 border-t border-primary-200/60 pt-3 dark:border-line">
                {form.timezone && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary-200/70 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:border-line dark:bg-card dark:text-gray-300">
                    <Globe2
                      className="h-3 w-3 text-primary-700 dark:text-primary-400"
                      aria-hidden="true"
                    />
                    {form.timezone}
                  </span>
                )}
                {form.currency && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary-200/70 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:border-line dark:bg-card dark:text-gray-300">
                    <DollarSign
                      className="h-3 w-3 text-primary-700 dark:text-primary-400"
                      aria-hidden="true"
                    />
                    {form.currency}
                  </span>
                )}
                {!form.timezone && !form.currency && (
                  <span className="text-[11.5px] text-gray-500 dark:text-mute">
                    Timezone and currency not set
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="mt-2 flex items-start gap-1.5 px-1 text-[11.5px] leading-relaxed text-gray-500 dark:text-mute">
            <ArrowRight
              className="mt-0.5 h-3 w-3 shrink-0"
              aria-hidden="true"
            />
            This is how the organization will appear across the admin console.
          </p>
        </aside>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AddNewOrganizationContent />
    </Suspense>
  );
}
