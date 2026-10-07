import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Mail, Phone, UserRound } from "lucide-react";
import { getUserById } from "@/app/_lib/data-services";
import StatusChips from "@/app/_components/StatusChips";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";

function displayName(user) {
    return [user.firstname || user.first_name || user.firstName, user.lastname || user.last_name || user.lastName]
        .filter(Boolean)
        .join(" ") || user.username || user.name || "User";
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default async function Page({ params }) {
    const { id } = await params;
    const result = await getUserById(id);
    const user = result?.user || result?.data?.user || result?.data || result;

    if (!user || typeof user !== "object" || Array.isArray(user)) {
        return (
            <div className="space-y-6 p-2">
                <Link href="/dashboard/admin/users" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"><ChevronLeft className="h-4 w-4" />Back to users</Link>
                <section className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
                    <UserRound className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                    <h1 className="text-xl font-bold text-gray-900">User not found</h1>
                    <p className="mt-2 text-sm text-gray-500">This user may have been removed or the link may be incorrect.</p>
                </section>
            </div>
        );
    }

    const name = displayName(user);
    const profilePicture = user.display_picture
        ? `https://app.xpacy.com/src/upload/display_img/${user.display_picture}`
        : "/avatar.png";
    const details = [
        ["First name", user.firstname || user.first_name || user.firstName],
        ["Last name", user.lastname || user.last_name || user.lastName],
        ["Username", user.username],
        ["Email", user.email],
        ["Phone", user.phone],
        ["Role", user.user_role || user.role || user.user_type],
        ["Joined", formatDate(user.created_at || user.createdAt)],
        ["Email verified", user.email_verified_at ? formatDate(user.email_verified_at) : "Not verified"],
    ].filter(([, value]) => value !== undefined && value !== null && value !== "");

    return (
        <div className="space-y-6 p-2 sm:p-4">
            <Link href="/dashboard/admin/users" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"><ChevronLeft className="h-4 w-4" />Back to users</Link>
            <DashboardGridItem>
                <div className="grid grid-cols-4 gap-2">

                <div className="flex min-w-0 items-center col-span-3 gap-4">
                    <Image src={profilePicture} alt={`${name} profile`} width={72} height={72} className="h-[72px] w-[72px] shrink-0 rounded-full object-cover" unoptimized />
                    <div className="min-w-0">
                        <h1 className="break-words text-2xl font-bold text-primary lg:text-3xl">{name}</h1>
                        <p className="mt-1 break-all text-sm text-gray-500">{user.email || "No email available"}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 self-start justify-end">
                    <StatusChips status={user.status || "active"} />
                    {user.kyc_status && <StatusChips status={user.kyc_status} />}
                </div>
                </div>

            </DashboardGridItem>
            <DashboardGridItem title="User Information">
                <dl className="flex flex-col gap-y-5">
                    {details.map(([label, value]) => (
                        <div key={label} className="flex flex-col gap-y-1">
                            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
                            <dd className="mt-1 break-words text-sm capitalize text-gray-800">{value}</dd>
                        </div>
                    ))}
                </dl>
              
                <DashboardGridItem title='Organization Memberships'>
                    {user.organizationMemberships?.length === 0 && (
                        <EmptyState
                            title="No memberships"
                            message={`No organization membership found for ${name}.`}
                        />
                    )}
                    <dl className="flex flex-col gap-y-5">
                        {user.organizationMemberships.map((membership) => (
                            <div key={membership.id} className="flex flex-col gap-y-1">
                                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{membership.name}</dt>
                                <dd className="mt-1 break-words text-sm capitalize text-gray-800">{membership.role}</dd>
                            </div>
                        ))}
                    </dl>
                </DashboardGridItem>
            </DashboardGridItem>
        </div>
    );
}
