"use client";

import CreateNewPropertyForm from "@/app/_components/CreateNewPropertyForm";
import AdminHeader from "@/app/_components/AdminHeader";

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
    const normalizedRole = String(userRole || "").toLowerCase().replace(/[_-\s]+/g, "");
    const safeReturnTo =
        returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
            ? returnTo
            : "";
    const backHref =
        safeReturnTo ||
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
                        {isEditMode ? "Edit Property" : "Add New Property"}
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        {isEditMode
                            ? "Update property classification, details, location, and ownership."
                            : "Create a new property with its details, location, and ownership."}
                    </p>
                </header>

                <CreateNewPropertyForm
                    owners={owners}
                    currentOwner={currentOwner}
                    organizations={organizations}
                    organizationId={organizationId}
                    userRole={userRole}
                    initialData={initialData}
                    isEditMode={isEditMode}
                    returnTo={backHref}
                />
            </main>
        </div>
    );
}
