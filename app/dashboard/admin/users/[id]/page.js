import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
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
import DataTable from "@/app/_components/DataTable";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import { getSettledErrorMessages } from "@/app/_lib/api-error";
import DeleteUserButton from "@/app/_components/DeleteUserBtn";
import { activateUser, deleteUser } from "@/app/_lib/action";
import ActivateUserButton from "@/app/_components/ActivateUserBtn";

const UPLOAD_BASE =
    process.env.NEXT_PUBLIC_UPLOAD_URL ||
    "https://app.xpacy.com/src/upload/display_img";

// ---------- Helpers ----------

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

/**
 * Resolves display status from any of the shapes your API returns.
 * Priority:
 *   1. user.status      — string ("active", "inactive", "suspended", …)
 *   2. user.user_status — snake_case string fallback
 *   3. user.isActive    — boolean → "active" / "inactive"
 *   4. user.is_active   — snake_case boolean fallback
 *   5. "active"         — default
 */
function statusOf(user) {
    if (!user) return "active";

    const explicit = user.status || user.user_status;
    if (explicit) return String(explicit).toLowerCase();

    const flag = user.isActive ?? user.is_active;
    if (typeof flag === "boolean") {
        return flag ? "active" : "inactive";
    }

    return "active";
}

function kycStatusOf(user) {
    if (!user) return null;
    return (
        user.kyc_status ||
        user.kycStatus ||
        user.kyc?.status ||
        null
    );
}

function buildDetailRows(user) {
    const status = statusOf(user);

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
            label: "Status",
            value:
                status.charAt(0).toUpperCase() +
                status.slice(1).toLowerCase(),
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
        ({ value }) =>
            value !== undefined && value !== null && value !== "",
    );
}

// ---------- Page ----------

export default async function Page({ params }) {
    const resolvedParams = await params;
    const rawId = resolvedParams?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

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

    const results = await Promise.allSettled([getUserById(userId)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const result =
        results[0].status === "fulfilled" ? results[0].value : null;

    const user =
        result?.user ??
        result?.data?.user ??
        (result?.data && !Array.isArray(result.data) ? result.data : null) ??
        (result && !Array.isArray(result) ? result : null);

    if (!user || typeof user !== "object" || Array.isArray(user)) {
        return (
            <div className="space-y-6 p-2">
                {dataErrorMessages.length > 0 ? (
                    <DataErrorNotice messages={dataErrorMessages} />
                ) : null}
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

    if (
        [user.role, user.user_role, user.user_type].some(
            (value) =>
                String(value || "").trim().toLowerCase() === "tenant",
        )
    ) {
        redirect("/dashboard/admin/users");
    }

    const name = displayName(user);

    const profilePicture =
        user.display_picture && typeof user.display_picture === "string"
            ? `${UPLOAD_BASE}/${user.display_picture}`
            : "/avatar.png";

    const details = buildDetailRows(user);

    const memberships = Array.isArray(user.organizationMemberships)
        ? user.organizationMemberships
        : Array.isArray(user.organization_memberships)
          ? user.organization_memberships
          : [];

    const role = (
        user.user_role ||
        user.role ||
        user.user_type ||
        "user"
    ).toString();

    // ← FIX: use the helper instead of user.status
    const status = statusOf(user);
    const kyc = kycStatusOf(user);
    const joined = formatDate(user.created_at || user.createdAt);
    const verified = !!user.email_verified_at;

    const heroStats = [
        {
            label: "Role",
            value:
                role.charAt(0).toUpperCase() +
                role.slice(1).toLowerCase(),
            hint: "Access level",
        },
        {
            label: "Status",
            value:
                status.charAt(0).toUpperCase() +
                status.slice(1).toLowerCase(),
            hint: "Account state",
        },
        { label: "Joined", value: joined, hint: "Member since" },
        {
            label: "Email",
            value: verified ? "Verified" : "Not verified",
            hint: verified
                ? "Confirmed on signup"
                : "Pending confirmation",
        },
    ];

    const today = new Date().toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {dataErrorMessages.length > 0 ? (
                <DataErrorNotice messages={dataErrorMessages} />
            ) : null}

            <Link
                href="/dashboard/admin/users"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 transition-colors hover:text-primary"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back to users
            </Link>

            {/* ---------- Hero ---------- */}
            <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
                <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                                User profile · {today}
                            </p>
                            <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                                {name}
                            </h1>
                            <p className="mt-2 max-w-xl break-all text-[13.5px] leading-relaxed text-side-mute">
                                {user.email || "No email available"}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusChips status={status} />
                            {kyc && <StatusChips status={kyc} />}
                        </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {heroStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4"
                            >
                                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                                    {stat.label}
                                </dt>
                                <dd className="mt-1 truncate text-[18px] font-semibold leading-tight tracking-[-0.3px] text-white sm:text-[20px]">
                                    {stat.value}
                                </dd>
                                <p className="mt-1.5 truncate text-[11.5px] text-side-mute">
                                    {stat.hint}
                                </p>
                            </div>
                        ))}
                    </dl>

                    {/* ---------- Action row ---------- */}
                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
                        {user.email && (
                            <Link
                                href={`mailto:${user.email}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <Mail
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                Send email
                            </Link>
                        )}
                        {user.phone && (
                            <a
                                href={`tel:${user.phone}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-[12.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                <Phone
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                Call
                            </a>
                        )}

                        {/* ← FIX: status now reflects isActive */}
                        {String(status).toLowerCase() !== "active" && (
                            <ActivateUserButton
                                userId={userId}
                                userName={name}
                                userEmail={user.email || null}
                                onActivate={activateUser}
                            />
                        )}

                       {String(status).toLowerCase() === "active" && (
                            <DeleteUserButton
                                userId={userId}
                                userName={name}
                                userEmail={user.email || null}
                                onDelete={deleteUser}
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* ---------- User information ---------- */}
            <DashboardGridItem title="User information">
                <div className="grid grid-cols-1 gap-3 container sm:grid-cols-2 ">
                    {details.map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="rounded-xl border border-gray-100 bg-white p-3"
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50">
                                    <Icon
                                        className="h-3.5 w-3.5 text-primary"
                                        aria-hidden="true"
                                    />
                                </div>
                                <dt className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-500">
                                    {label}
                                </dt>
                            </div>
                            <dd className="mt-2 break-words text-[13px] capitalize text-ink">
                                {value}
                            </dd>
                        </div>
                    ))}
                </div>
            </DashboardGridItem>

            {/* ---------- Memberships ---------- */}
            <DashboardGridItem title="Organization memberships">
                {memberships.length === 0 ? (
                    <EmptyState
                        icon={Building2}
                        title="No memberships"
                        message={`No organization membership found for ${name}.`}
                    />
                ) : (
                    <DataTable
                        data={memberships}
                        showPagination={false}
                        className="p-0 border-none shadow-none"
                        rowKey={(membership, index) => membership.id ?? membership.organization?.id ?? index}
                        columns={[
                            {
                                heading: "Organization",
                                render: (membership) => (
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 shrink-0 text-mute" aria-hidden="true" />
                                        <span className="break-words capitalize text-ink">
                                            {membership.organization?.name ?? "—"}
                                        </span>
                                    </div>
                                ),
                            },
                            {
                                heading: "Role",
                                className: "capitalize text-mute",
                                render: (membership) => membership.role ?? "—",
                            },
                        ]}
                    />
                )}
            </DashboardGridItem>
        </div>
    );
}