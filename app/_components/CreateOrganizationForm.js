"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createOrganizationForCurrentUser } from "@/app/_lib/action";
import { buildAutoSlug, randomAlphaNum } from "@/app/_lib/slug";

const DRAFT_KEY = "xpacy-organization-draft";
const inputClass = "w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";
const emptyDraft = { name: "", slug: "", email: "", phone: "", address: "", city: "", state: "", country: "Nigeria", timezone: "Africa/Lagos", currency: "NGN" };
const fields = [
    ["name", "Organization name", "text", true],
    ["slug", "Organization URL slug", "text", true],
    ["email", "Contact email", "email"],
    ["phone", "Phone", "tel"],
    ["address", "Address", "text"],
    ["city", "City", "text"],
    ["state", "State / Province", "text"],
    ["country", "Country", "text"],
    ["timezone", "Timezone", "text"],
    ["currency", "Currency", "text"],
];

const PLAN_NAMES = { core: "Core", growth: "Growth", enterprise: "Enterprise" };

export default function CreateOrganizationForm({ selectedPlan = "" }) {
    const router = useRouter();
    const [slugSuffix] = useState(() => randomAlphaNum(5));
    const [values, setValues] = useState(emptyDraft);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        try {
            const savedDraft = sessionStorage.getItem(DRAFT_KEY);
            if (savedDraft) {
                const parsed = { ...emptyDraft, ...JSON.parse(savedDraft) };
                if (parsed.name && !parsed.slug) {
                    parsed.slug = buildAutoSlug(parsed.name, slugSuffix);
                }
                setValues(parsed);
            }
        } catch {
            sessionStorage.removeItem(DRAFT_KEY);
        }
    }, [slugSuffix]);

    const updateField = (event) => {
        const { name, value } = event.target;
        if (name === "slug") return;
        setValues((current) => ({
            ...current,
            [name]: value,
            ...(name === "name" ? { slug: buildAutoSlug(value, slugSuffix) } : {}),
        }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        const nextValues = {
            ...values,
            slug: values.slug || buildAutoSlug(values.name, slugSuffix),
        };
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(nextValues));
        if (!PLAN_NAMES[selectedPlan]) {
            router.push("/dashboard/user/subscriptions?returnTo=%2Fdashboard%2Fuser%2Fcreate-organization");
            return;
        }

        setIsSubmitting(true);
        const result = await createOrganizationForCurrentUser(nextValues);
        if (!result?.success) {
            setError(result?.message || "Could not create the organization.");
            setIsSubmitting(false);
            return;
        }
        sessionStorage.removeItem(DRAFT_KEY);
        router.replace(result.redirectTo || "/dashboard/property-owner");
        router.refresh();
    };

    return (
        <form onSubmit={submit} className="w-full max-w-3xl space-y-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
            <div className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${PLAN_NAMES[selectedPlan] ? "border-secondary-100 bg-secondary-100" : "border-primary-100 bg-primary-50"}`}>
                <div>
                    <p className="text-sm font-bold text-primary">{PLAN_NAMES[selectedPlan] ? `Selected plan: ${PLAN_NAMES[selectedPlan]}` : "Choose a plan to continue"}</p>
                    <p className="mt-1 text-xs text-gray-600">{PLAN_NAMES[selectedPlan] ? "Your plan selection is saved for this setup." : "You can fill in your details now, then select a plan before finishing."}</p>
                </div>
                <Link href="/dashboard/user/subscriptions?returnTo=%2Fdashboard%2Fuser%2Fcreate-organization" className="text-sm font-bold text-primary underline underline-offset-4">{PLAN_NAMES[selectedPlan] ? "Change plan" : "Choose plan"}</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                {fields.map(([name, label, type, required]) => {
                    const isSlug = name === "slug";
                    return (
                        <label key={name} className={`text-sm font-medium text-gray-700 ${name === "address" ? "sm:col-span-2" : ""}`}>
                            {label}{required ? " *" : ""}
                            <input
                                className={
                                    isSlug
                                        ? "w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-2.5 font-mono text-sm text-gray-500 outline-none"
                                        : inputClass
                                }
                                name={name}
                                type={type}
                                value={values[name]}
                                onChange={updateField}
                                disabled={isSlug}
                                placeholder={isSlug ? "organization-name-a1b2c" : undefined}
                                required={required && !isSlug}
                            />
                        </label>
                    );
                })}
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <div className="flex justify-end border-t border-gray-100 pt-5">
                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
                    {isSubmitting ? "Creating organization…" : PLAN_NAMES[selectedPlan] ? "Finish organization setup" : "Continue to choose a plan"}
                </button>
            </div>
        </form>
    );
}
