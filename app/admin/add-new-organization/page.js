"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Building2, RotateCcw } from "lucide-react";
import { createOrganization } from "@/app/_lib/action";
import AdminHeader from "@/app/_components/AdminHeader";
import FormInput from "@/app/_components/FormInput";
import SpinnerMini from "@/app/_components/SpinnerMini";

const inputClass = (hasError) =>
    `rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink ${
        hasError ? "border-error" : "border-line"
    }`;

const selectClass =
    "rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink border-line";

const CURRENCIES = [
    { code: "NGN", label: "NGN — Nigerian Naira" },
    { code: "USD", label: "USD — US Dollar" },
    { code: "GBP", label: "GBP — British Pound" },
    { code: "EUR", label: "EUR — Euro" },
];

const TIMEZONES = [
    { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
    { value: "UTC", label: "UTC — Coordinated Universal Time" },
    { value: "Africa/Abidjan", label: "Africa/Abidjan (GMT)" },
    { value: "Africa/Accra", label: "Africa/Accra (GMT)" },
    { value: "Africa/Cairo", label: "Africa/Cairo (EET)" },
    { value: "Africa/Casablanca", label: "Africa/Casablanca (WET)" },
    { value: "Africa/Johannesburg", label: "Africa/Johannesburg (SAST)" },
    { value: "Africa/Nairobi", label: "Africa/Nairobi (EAT)" },
];

function slugify(text) {
    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function AddNewOrganizationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawReturnTo = searchParams?.get("returnTo") || "";
    const backHref =
        rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
            ? rawReturnTo
            : "/dashboard/admin/organizations";

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
    const [isPending, setIsPending] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
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
        if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
    };

    const handleSlugChange = (e) => {
        setIsSlugManual(true);
        setForm((prev) => ({ ...prev, slug: e.target.value }));
        if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
    };

    const handleRegenerateSlug = () => {
        setIsSlugManual(false);
        setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isPending) return;

        const nextErrors = {};
        if (!form.name.trim()) nextErrors.name = "Organization name is required";
        if (!form.slug.trim()) nextErrors.slug = "Slug is required";
        if (!form.email.trim()) nextErrors.email = "Email is required";
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        const payload = {
            name: form.name.trim(),
            slug: slugify(form.slug),
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            country: form.country.trim(),
            timezone: form.timezone,
            currency: form.currency,
        };

        setIsPending(true);
        toast.promise(createOrganization(payload), {
            loading: "Creating organization...",
            success: (res) => {
                setIsPending(false);
                if (res?.success === false || res?.error) {
                    const msg = Array.isArray(res?.message)
                        ? res.message.join(", ")
                        : res?.message || "Failed to create organization.";
                    throw new Error(msg);
                }
                router.refresh();
                setTimeout(() => {
                    router.push(backHref);
                }, 600);
                return res?.message || "Organization created successfully!";
            },
            error: (err) => {
                setIsPending(false);
                return err?.message || "Failed to create organization.";
            },
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader title="Add Organization" backHref={backHref} />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        Create Organization
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        Set up a new organization with its identity, contact details, and billing preferences.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                >
                    {/* Section 1: Identity */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Organization Identity
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Organization Name *" id="name">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleNameChange}
                                    placeholder="e.g. Acme Properties"
                                    className={inputClass(errors.name)}
                                />
                                {errors.name && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.name}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="URL Slug *" id="slug">
                                <div className="flex items-center gap-2">
                                    <input
                                        id="slug"
                                        name="slug"
                                        type="text"
                                        value={form.slug}
                                        onChange={handleSlugChange}
                                        placeholder="acme-properties"
                                        className={`flex-1 font-mono ${inputClass(errors.slug)}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRegenerateSlug}
                                        title="Regenerate slug from name"
                                        className="rounded-lg border border-line bg-card p-3 text-mute hover:text-primary transition-colors cursor-pointer"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </button>
                                </div>
                                {errors.slug && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.slug}
                                    </span>
                                )}
                            </FormInput>
                        </div>
                    </div>

                    {/* Section 2: Contact & Location */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Contact & Location
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Email Address *" id="email">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="contact@organization.com"
                                    className={inputClass(errors.email)}
                                />
                                {errors.email && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.email}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="Phone Number" id="phone">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="+234 800 000 0000"
                                    className={inputClass(errors.phone)}
                                />
                            </FormInput>
                        </div>

                        <FormInput label="Street Address" id="address">
                            <input
                                id="address"
                                name="address"
                                type="text"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                                className={inputClass(errors.address)}
                            />
                        </FormInput>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <FormInput label="City" id="city">
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={form.city}
                                    onChange={handleChange}
                                    placeholder="Lagos"
                                    className={inputClass(errors.city)}
                                />
                            </FormInput>

                            <FormInput label="State" id="state">
                                <input
                                    id="state"
                                    name="state"
                                    type="text"
                                    value={form.state}
                                    onChange={handleChange}
                                    placeholder="Lagos"
                                    className={inputClass(errors.state)}
                                />
                            </FormInput>

                            <FormInput label="Country" id="country">
                                <input
                                    id="country"
                                    name="country"
                                    type="text"
                                    value={form.country}
                                    onChange={handleChange}
                                    placeholder="Nigeria"
                                    className={inputClass(errors.country)}
                                />
                            </FormInput>
                        </div>
                    </div>

                    {/* Section 3: Preferences */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Preferences
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Timezone" id="timezone">
                                <select
                                    id="timezone"
                                    name="timezone"
                                    value={form.timezone}
                                    onChange={handleChange}
                                    className={selectClass}
                                >
                                    {TIMEZONES.map((tz) => (
                                        <option key={tz.value} value={tz.value}>
                                            {tz.label}
                                        </option>
                                    ))}
                                </select>
                            </FormInput>

                            <FormInput label="Default Currency" id="currency">
                                <select
                                    id="currency"
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleChange}
                                    className={selectClass}
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </FormInput>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-line pt-6">
                        <Link
                            href={backHref}
                            className="w-full sm:w-auto text-center rounded-lg border border-line px-6 py-3 font-mono text-sm font-medium text-ink hover:bg-canvas transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-mono text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer"
                        >
                            {isPending ? (
                                <SpinnerMini />
                            ) : (
                                <Building2 className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span>
                                {isPending
                                    ? "Creating..."
                                    : "Create Organization"}
                            </span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default function AddNewOrganizationPage() {
    return (
        <Suspense fallback={null}>
            <AddNewOrganizationContent />
        </Suspense>
    );
}
