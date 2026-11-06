import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
    Building2,
    ChevronLeft,
    UserRound,
    User,
    AtSign,
    Mail,
    Phone,
    ShieldCheck,
    Calendar,
    BadgeCheck,
} from "lucide-react";
import { getUserById } from "@/app/_lib/data-services";
import StatusChips from "@/app/_components/StatusChips";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";

const UPLOAD_BASE =
    process.env.NEXT_PUBLIC_UPLOAD_URL ||
    "https://app.xpacy.com/src/upload/display_img";

function displayName(user) {
    return (
        [
            user.firstname || user.first_name || user.firstName,
            user.lastname || user.last_name || user.lastName,
        ]
            .filter(Boolean)
            .join(" ") ||
        user.username ||
        user.name ||
        "User"
    );
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
          });
}

function buildDetailRows(user) {
    return [
        {
            label: "First name",
            value: user.firstname || user.first_name || user.firstName,
            icon: User,
        },
        {
            label: "Last name",
            value: user.lastname || user.last_name || user.lastName,
            icon: User,
        },
        { label: "Username", value: user.username, icon: AtSign },
        { label: "Email", value: user.email, icon: Mail },
        { label: "Phone", value: user.phone, icon: Phone },
        {
            label: "Role",
            value: user.user_role || user.role || user.user_type,
            icon: ShieldCheck,
        },
        {
            label: "Joined",
            value: formatDate(user.created_at || user.createdAt),
            icon: Calendar,
        },
        {
            label: "Email verified",
            value: user.email_verified_at
                ? formatDate(user.email_verified_at)
                : "Not verified",
            icon: BadgeCheck,
        },
    ].filter(
        ({ value }) => value !== undefined && value !== null && value !== ""
    );
}

export default async function Page({ params }) {
    // 1. Await params (Next.js 15+ — params is a Promise).
    const resolvedParams = await params;

    // 2. Safely extract `id` from whatever shape params takes.
    //    Handles: { id: "..." }  |  { id: ["..."] }  |  { slug: [...] } fallback.
    const rawId = resolvedParams?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    // 3. Guard against missing / empty id.
    if (!id || typeof id !== "string" || !id.trim()) {
        return (
            <div className="space-y-6 p-2">
                <Link
                    href="/dashboard/admin/users"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to users
                </Link>

                <EmptyState
                    icon={UserRound}
                    title="Invalid user id"
                    message="The user id in the URL is missing or malformed."
                />
            </div>
        );
    }

    const userId = id.trim();

    // 4. Fetch the user using the resolved id.
    const result = await getUserById(userId);

    // 5. Unwrap the response defensively — different APIs nest differently.
    const user =
        result?.user ??
        result?.data?.user ??
        (result?.data && !Array.isArray(result.data) ? result.data : null) ??
        (result && !Array.isArray(result) ? result : null);

    // 6. Bail out with a friendly UI if we couldn't find a valid user object.
    if (!user || typeof user !== "object" || Array.isArray(user)) {
        return (
            <div className="space-y-6 p-2">
                <Link
                    href="/dashboard/admin/users"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to users
                </Link>

                <EmptyState
                    icon={UserRound}
                    title="User not found"
                    message={`No user was found for id "${userId}". This user may have been removed or the link may be incorrect.`}
                />
            </div>
        );
    }

    if ([user.role, user.user_role, user.user_type].some((value) => String(value || "").trim().toLowerCase() === "tenant")) {
        redirect("/dashboard/admin/users");
    }

    const name = displayName(user);

    // 7. Build the profile picture URL from the user's display_picture (if any).
    const profilePicture =
        user.display_picture && typeof user.display_picture === "string"
            ? `${UPLOAD_BASE}/${user.display_picture}`
            : "/avatar.png";

    const details = buildDetailRows(user);

    // 8. Memberships: prefer explicit property, fall back to organization_memberships.
    const memberships = Array.isArray(user.organizationMemberships)
        ? user.organizationMemberships
        : Array.isArray(user.organization_memberships)
        ? user.organization_memberships
        : [];

    return (
        <div className="space-y-6 p-2 sm:p-4">
            <Link
                href="/dashboard/admin/users"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
            >
                <ChevronLeft className="h-4 w-4" />
                Back to users
            </Link>

            <DashboardGridItem>
                <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3 flex w-full items-center gap-4">
                        <Image
                            src={profilePicture}
                            alt={`${name} profile`}
                            width={72}
                            height={72}
                            className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
                            unoptimized
                        />
                        <div className="min-w-0">
                            <h1 className="break-words text-2xl font-bold text-primary lg:text-3xl">
                                {name}
                            </h1>
                            <p className="mt-1 break-all text-sm text-gray-500">
                                {user.email || "No email available"}
                            </p>
                        </div>
                    </div>
                    <div className="flex h-full w-full flex-wrap items-start justify-end gap-2">
                        <StatusChips status={user.status || "active"} />
                        {user.kyc_status && (
                            <StatusChips status={user.kyc_status} />
                        )}
                    </div>
                </div>
            </DashboardGridItem>

            <DashboardGridItem title="User Information">
                <dl className="flex flex-col gap-3">
                    {details.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-start gap-3">
                            <div className="min-w-0 flex flex-col">
                                <div className="flex items-center gap-2">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
                                        <Icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        {label}
                                    </dt>
                                </div>
                                <dd className="mt-1 ml-10 break-words text-sm capitalize text-gray-800">
                                    {value}
                                </dd>
                            </div>
                        </div>
                    ))}
                </dl>
            </DashboardGridItem>

            <DashboardGridItem title="Organization Memberships">
                {memberships.length === 0 ? (
                    <EmptyState
                        icon={Building2}
                        title="No memberships"
                        message={`No organization membership found for ${name}.`}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 bg-primary-100">
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                                        Organization
                                    </th>
                                    <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                                        Role
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {memberships.map((membership, index) => (
                                    <tr
                                        key={
                                            membership.id ??
                                            membership.organization?.id ??
                                            index
                                        }
                                        className="border-b border-gray-200 hover:bg-gray-50"
                                    >
                                        <td className="py-3 px-4 text-sm text-gray-800">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                                                <span className="break-words capitalize">
                                                    {membership.organization?.name ??
                                                        "—"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm capitalize text-gray-800">
                                            <span className="break-words">
                                                {membership.role ?? "—"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </DashboardGridItem>
        </div>
    );
}
