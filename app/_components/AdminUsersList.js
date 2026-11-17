"use client";
import Image from "next/image";
import StatusChips from "./StatusChips";
import UserOptionsMenu from "./UserOptionsMenu";
import DataTable from "./DataTable";

const defaultHeadings = [
    { heading: "Name" },
    { heading: "Contact/Info" },
    { heading: "Status", center: true },
    { heading: "" },
];

const registeredHeadings = [
    { heading: "Name" },
    { heading: "Contact/Info" },
    { heading: "Status", center: true },
    { heading: "KYC Status", center: true },
    { heading: "" },
];

const tenantHeadings = [
    { heading: "Name" },
    { heading: "Contact/Info" },
    { heading: "Role" },
    { heading: "Status" },
    { heading: "" },
];

/**
 * Resolves the display status from whatever shape the API returns.
 *
 * Priority:
 *   1. user.status    — a string (e.g. "active", "inactive", "suspended")
 *   2. user.isActive  — a boolean → "active" / "inactive"
 *   3. user.is_active — snake_case boolean fallback
 *   4. "active"       — default when nothing else is present
 */
function statusOf(user) {
    if (!user) return "active";

    const explicit = user.status || user.user_status;
    if (explicit) return String(explicit).toLowerCase();

    const active =
        user.isActive ??
        user.is_active ??
        user.active;

    if (typeof active === "boolean") {
        return active ? "active" : "inactive";
    }

    return "active";
}

function kycStatusOf(user) {
    if (!user) return "N/A";
    return (
        user.kyc_status ||
        user.kycStatus ||
        user.kyc?.status ||
        "N/A"
    );
}

export default function AdminUsersList({
    users = [],
    title = "All Users List",
    variant = "default",
    pagination,
}) {
    let headings = defaultHeadings;
    if (variant === "tenant") headings = tenantHeadings;
    else if (variant === "registered") headings = registeredHeadings;

    const renderRow = (user) => {
        const status = statusOf(user);

        return (
            <tr
                key={user._id || user.id}
                className="border-b border-primary-100 font-mono text-sm text-neutrals-900 transition-colors last:border-0 hover:bg-gray-50"
            >
                <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                        <div className="relative h-8 w-8 shrink-0">
                            <Image
                                src={
                                    user.display_picture
                                        ? `https://app.xpacy.com/src/upload/display_img/${user.display_picture}`
                                        : "/avatar.png"
                                }
                                alt="user-photo"
                                className="rounded-full object-cover"
                                unoptimized
                                fill
                            />
                        </div>
                        <span className="truncate font-semibold">
                            {user.firstname ||
                                user.first_name ||
                                user.firstName}{" "}
                            {user.lastname ||
                                user.last_name ||
                                user.lastName ||
                                user.username}
                        </span>
                    </div>
                </td>

                {variant === "tenant" ? (
                    <>
                        <td className="p-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-900">
                                    {user.email}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    {user.phone || "N/A"}
                                </span>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className="mt-1 text-[10px] font-semibold uppercase text-gray-400">
                                {user.user_type || user.role || ""}
                            </span>
                        </td>
                        <td className="p-4 text-center">
                            <div className="flex justify-center capitalize">
                                <StatusChips status={status} />
                            </div>
                        </td>
                    </>
                ) : (
                    <>
                        <td className="p-4">
                            <div className="flex flex-col justify-center">
                                <span className="text-gray-900">
                                    {user.email}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {user.phone || "N/A"}
                                </span>
                            </div>
                        </td>
                        <td className="p-4 text-center">
                            <div className="flex justify-center capitalize">
                                <StatusChips status={status} />
                            </div>
                        </td>
                        {variant === "registered" && (
                            <td className="p-4 text-center">
                                <div className="flex justify-center capitalize">
                                    <StatusChips status={kycStatusOf(user)} />
                                </div>
                            </td>
                        )}
                    </>
                )}

                <td className="relative p-4 text-center">
                    <div className="flex justify-center">
                        <UserOptionsMenu
                            id={user._id || user.id}
                            role="tenant"
                        />
                    </div>
                </td>
            </tr>
        );
    };

    const renderMobileCard = (user) => {
        const status = statusOf(user);

        return (
            <div
                key={user._id || user.id}
                className="flex w-full flex-col gap-4 border-2 border-b border-primary-100 bg-white p-4 last:border-0"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="relative flex w-full flex-col items-center gap-3">
                        <div className="flex w-full items-start justify-between gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
                                <Image
                                    src={
                                        user.display_picture
                                            ? `https://app.xpacy.com/src/upload/display_img/${user.display_picture}`
                                            : "/avatar.png"
                                    }
                                    alt=""
                                    className="object-cover"
                                    unoptimized
                                    fill
                                />
                            </div>
                            <div className="min-w-0 self-end">
                                <UserOptionsMenu
                                    id={user._id || user.id}
                                    role={user.role}
                                />
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-y-3">
                            <div className="flex justify-between">
                                <label className="text-sm text-gray-500">
                                    Name
                                </label>
                                <span className="text-sm font-semibold">
                                    {user.firstname ||
                                        user.first_name ||
                                        user.firstName}{" "}
                                    {user.lastname ||
                                        user.last_name ||
                                        user.lastName ||
                                        user.username}
                                </span>
                            </div>
                            {variant !== "tenant" && (
                                <div className="flex justify-between">
                                    <label className="text-sm text-gray-500">
                                        Email
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        {user.email}
                                    </p>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <label className="text-sm text-gray-500">
                                    Role
                                </label>
                                <span
                                    className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                                        user.user_role === "Admin"
                                            ? "bg-purple-100 text-purple-700"
                                            : user.user_role ===
                                                "Property Owner"
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {user.user_role?.replace("-", " ") ||
                                        "User"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2 rounded-lg bg-gray-50 text-sm text-gray-600">
                                {variant === "tenant" ? (
                                    <>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-gray-500">
                                                Property
                                            </span>
                                            <span className="max-w-[120px] truncate font-medium text-gray-900">
                                                {user.property_name || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-gray-500">
                                                Contact:
                                            </span>
                                            <div className="flex flex-col items-end">
                                                <span className="font-medium text-gray-900">
                                                    {user.email || "N/A"}
                                                </span>
                                                <span className="text-gray-500">
                                                    {user.phone || "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-gray-500">
                                                Phone
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {user.phone || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-gray-500">
                                                Status
                                            </span>
                                            <StatusChips status={status} />
                                        </div>
                                        {variant === "registered" && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-gray-500">
                                                    KYC Status:
                                                </span>
                                                <StatusChips
                                                    status={kycStatusOf(user)}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DataTable
            title={title}
            headers={headings}
            data={users}
            renderRow={renderRow}
            renderMobileCard={renderMobileCard}
            emptyMessage="No users found."
            showPagination={true}
            pagination={pagination}
        />
    );
}