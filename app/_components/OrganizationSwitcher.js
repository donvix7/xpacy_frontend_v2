"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setActiveOrganization } from "@/app/_lib/action";

export default function OrganizationSwitcher({ organizations = [], activeOrganizationId = "" }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const list = organizations
        .filter((organization) => organization && typeof organization === "object")
        .map((organization) => ({
            id: organization.id || organization._id || organization.organizationId || organization.organization_id,
            name: organization.name || organization.organizationName || organization.organization_name || "Organization",
        }))
        .filter((organization) => organization.id);
    const selectedOrganizationId = list.some((organization) => String(organization.id) === String(activeOrganizationId))
        ? String(activeOrganizationId)
        : String(list[0]?.id || "");

    if (!list.length) return null;

    const onChange = (event) => {
        const organizationId = event.target.value;
        setError("");
        startTransition(async () => {
            const result = await setActiveOrganization(organizationId);
            if (!result?.success) {
                setError(result?.message || "Could not switch organization.");
                return;
            }
            router.refresh();
        });
    };

    return (
        <label className="flex max-w-32 flex-col gap-1 text-xs font-medium text-gray-600 sm:max-w-48">
            <span>Organization</span>
            <select
                aria-label="Switch organization"
                value={selectedOrganizationId}
                disabled={isPending}
                onChange={onChange}
                className="w-full rounded-lg border border-primary-200 bg-white px-2 py-2 text-xs text-primary outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 sm:px-3 sm:text-sm"
            >
                {list.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
            </select>
            {error && <span role="alert" className="text-red-600">{error}</span>}
        </label>
    );
}
