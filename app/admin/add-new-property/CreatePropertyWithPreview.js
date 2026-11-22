"use client";

import { useCallback, useState } from "react";
import CreateNewPropertyForm from "@/app/_components/CreateNewPropertyForm";
import AdminHeader from "@/app/_components/AdminHeader";

const stepMeta = [
    { id: 1, title: "Owners" },
    { id: 2, title: "Property" },
    { id: 3, title: "Location" },
];

export default function CreatePropertyWithPreview({
    owners = [],
    currentOwner = null,
    organizations = [],
    organizationId = "",
    userRole = "admin",
    initialData = null,
    isEditMode = false,
    returnTo = "",
}) {
    const [step, setStep] = useState(1);

    const handleFormChange = useCallback(() => {}, []);

    const normalizedRole = String(userRole || "").toLowerCase().replace(/[_-\s]+/g, "");
    const backHref =
        returnTo ||
        (normalizedRole === "propertymanager" || normalizedRole === "manager"
            ? "/dashboard/property-manager/properties"
            : "/dashboard/property-owner/properties");

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader
                title={isEditMode ? "Edit Property" : "Add New Property"}
                backHref={backHref}
            />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        {isEditMode ? "Edit Property" : "Create Property"}
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        {isEditMode
                            ? "Update property classification, details, and location."
                            : "Add a new property with owners, specifications, and location."}
                    </p>
                </header>

                {/* Step Pills */}
                <ol className="grid grid-cols-3 gap-2">
                    {stepMeta.map((s) => {
                        const isActive = step === s.id;
                        const isDone = step > s.id;
                        return (
                            <li key={s.id}>
                                <button
                                    type="button"
                                    onClick={() => setStep(s.id)}
                                    className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                                        isActive
                                            ? "border-primary bg-primary/10 text-primary"
                                            : isDone
                                              ? "border-line bg-card text-ink"
                                              : "border-line bg-card/60 text-mute hover:text-ink"
                                    }`}
                                >
                                    <span
                                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                                            isActive || isDone
                                                ? "bg-primary text-white"
                                                : "bg-soft text-mute"
                                        }`}
                                    >
                                        {isDone ? "✓" : s.id}
                                    </span>
                                    <span>{s.title}</span>
                                </button>
                            </li>
                        );
                    })}
                </ol>

                <div className="p-6 sm:p-8 flex flex-col gap-6 rounded-2xl border border-line bg-card shadow-sm">
                    <CreateNewPropertyForm
                        owners={owners}
                        currentOwner={currentOwner}
                        organizations={organizations}
                        organizationId={organizationId}
                        userRole={userRole}
                        initialData={initialData}
                        isEditMode={isEditMode}
                        returnTo={returnTo}
                        step={step}
                        onStepChange={setStep}
                        onFormChange={handleFormChange}
                    />
                </div>
            </main>
        </div>
    );
}
