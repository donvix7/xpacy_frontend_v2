import Image from "next/image";
import Link from "next/link";
import {
    Building2,
    ChevronLeft,
    UserRound,
    User,
    Mail,
    Phone,
    ShieldCheck,
    Calendar,
    Briefcase,
    Home,
    DoorOpen,
    Hash,
    IdCard,
    Contact,
    BriefcaseBusiness,
    FileText,
} from "lucide-react";
import { getTenantById } from "@/app/_lib/data-services";
import StatusChips from "@/app/_components/StatusChips";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import EmptyState from "@/app/_components/EmptyState";
import { formatCurrency } from "@/app/_lib/utils";

const UPLOAD_BASE =
    process.env.NEXT_PUBLIC_UPLOAD_URL ||
    "https://app.xpacy.com/src/upload/display_img";

/* ---------------- helpers ---------------- */

function displayName(tenant) {
    return (
        [tenant.firstName, tenant.lastName].filter(Boolean).join(" ") ||
        tenant.name ||
        tenant.user?.firstName ||
        "Tenant"
    );
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
          });
}

const titleCase = (value) =>
    !value
        ? "—"
        : String(value)
              .replace(/[_-]+/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase());

function buildDetailRows(tenant) {
    return [
        { label: "First name", value: tenant.firstName, icon: User },
        { label: "Last name", value: tenant.lastName, icon: User },
        { label: "Email", value: tenant.email, icon: Mail },
        { label: "Phone", value: tenant.phone, icon: Phone },
        { label: "Date of Birth", value: formatDate(tenant.dateOfBirth), icon: Calendar },
        { label: "Joined", value: formatDate(tenant.createdAt), icon: Calendar },
        { label: "Last Updated", value: formatDate(tenant.updatedAt), icon: Calendar },
    ].filter(
        ({ value }) => value !== undefined && value !== null && value !== ""
    );
}

function leasePropertyName(lease) {
    const property = Array.isArray(lease?.property)
        ? lease.property[0]
        : lease?.property;
    return property?.name || property?.property_name || property?.title || "—";
}

function leaseUnit(lease) {
    const unit = Array.isArray(lease?.unit) ? lease.unit[0] : lease?.unit;
    if (!unit) return "—";
    return unit.unitNumber
        ? `Unit ${unit.unitNumber}`
        : unit.name || unit.unitName || "—";
}

/* ---------------- reusable presentational ---------------- */

function InfoRow({ icon: Icon, label, value, capitalize = false }) {
    if (value === undefined || value === null || value === "") return null;
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                </dt>
                <dd
                    className={`mt-0.5 text-sm text-gray-800 break-words ${
                        capitalize ? "capitalize" : ""
                    }`}
                >
                    {value}
                </dd>
            </div>
        </div>
    );
}

function SectionEmpty({ icon, message }) {
    return (
        <EmptyState icon={icon} title="Not provided" message={message} />
    );
}

/* ---------------- field renderers ---------------- */

/** Renders identification whether it's a string, or an object with common keys. */
function IdentificationDetails({ identification }) {
    if (!identification) {
        return (
            <SectionEmpty
                icon={IdCard}
                message="No identification document has been provided for this tenant."
            />
        );
    }

    // Simple string value
    if (typeof identification === "string") {
        return (
            <dl className="flex flex-col gap-4">
                <InfoRow icon={IdCard} label="Identification" value={identification} capitalize />
            </dl>
        );
    }

    // Object shape — try common keys
    const type = identification.type || identification.documentType;
    const number =
        identification.number ||
        identification.idNumber ||
        identification.documentNumber;
    const issuedBy = identification.issuedBy || identification.issuer;
    const issuedDate = identification.issuedDate || identification.issuedAt;
    const expiryDate = identification.expiryDate || identification.expiresAt;
    const verified = identification.verified ?? identification.isVerified;
    const documentUrl =
        identification.documentUrl ||
        identification.url ||
        identification.file;

    const hasAny = [type, number, issuedBy, issuedDate, expiryDate, verified, documentUrl]
        .some((v) => v !== undefined && v !== null && v !== "");

    if (!hasAny) {
        return (
            <SectionEmpty
                icon={IdCard}
                message="No identification document has been provided for this tenant."
            />
        );
    }

    return (
        <dl className="flex flex-col gap-4">
            <InfoRow icon={IdCard} label="Document Type" value={titleCase(type)} />
            <InfoRow icon={Hash} label="Document Number" value={number} />
            <InfoRow icon={Building2} label="Issued By" value={issuedBy} />
            <InfoRow
                icon={Calendar}
                label="Issued Date"
                value={issuedDate ? formatDate(issuedDate) : null}
            />
            <InfoRow
                icon={Calendar}
                label="Expiry Date"
                value={expiryDate ? formatDate(expiryDate) : null}
            />
            <InfoRow
                icon={ShieldCheck}
                label="Verified"
                value={verified === undefined ? null : verified ? "Yes" : "No"}
            />
            {documentUrl && (
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
                        <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Document
                        </dt>
                        <dd className="mt-0.5 text-sm text-gray-800 break-all">
                            <a
                                href={documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                View document
                            </a>
                        </dd>
                    </div>
                </div>
            )}
        </dl>
    );
}

/** Renders emergency contact whether it's a string or an object. */
function EmergencyContactDetails({ contact }) {
    if (!contact) {
        return (
            <SectionEmpty
                icon={Contact}
                message="No emergency contact has been provided for this tenant."
            />
        );
    }

    if (typeof contact === "string") {
        return (
            <dl className="flex flex-col gap-4">
                <InfoRow icon={Contact} label="Contact" value={contact} />
            </dl>
        );
    }

    const name = contact.name || contact.fullName;
    const relationship = contact.relationship || contact.relation;
    const phone = contact.phone || contact.phoneNumber;
    const email = contact.email;
    const address = contact.address;

    const hasAny = [name, relationship, phone, email, address].some(
        (v) => v !== undefined && v !== null && v !== ""
    );

    if (!hasAny) {
        return (
            <SectionEmpty
                icon={Contact}
                message="No emergency contact has been provided for this tenant."
            />
        );
    }

    return (
        <dl className="flex flex-col gap-4">
            <InfoRow icon={User} label="Full Name" value={name} />
            <InfoRow
                icon={UserRound}
                label="Relationship"
                value={relationship}
                capitalize
            />
            <InfoRow icon={Phone} label="Phone" value={phone} />
            <InfoRow icon={Mail} label="Email" value={email} />
            <InfoRow icon={Home} label="Address" value={address} />
        </dl>
    );
}

/** Renders occupation — usually just a string. */
function OccupationDetails({ occupation }) {
    if (!occupation) {
        return (
            <SectionEmpty
                icon={Briefcase}
                message="No occupation has been provided for this tenant."
            />
        );
    }

    if (typeof occupation === "string") {
        return (
            <dl className="flex flex-col gap-4">
                <InfoRow icon={Briefcase} label="Occupation" value={occupation} capitalize />
            </dl>
        );
    }

    const title = occupation.title || occupation.jobTitle;
    const employer = occupation.employer || occupation.company;
    const industry = occupation.industry;

    return (
        <dl className="flex flex-col gap-4">
            <InfoRow icon={Briefcase} label="Job Title" value={title} capitalize />
            <InfoRow icon={Building2} label="Employer" value={employer} />
            <InfoRow icon={FileText} label="Industry" value={industry} capitalize />
        </dl>
    );
}

/** Renders employment information — often an object with income / employer etc. */
function EmploymentInformationDetails({ info }) {
    if (!info) {
        return (
            <SectionEmpty
                icon={BriefcaseBusiness}
                message="No employment information has been provided for this tenant."
            />
        );
    }

    if (typeof info === "string") {
        return (
            <dl className="flex flex-col gap-4">
                <InfoRow icon={BriefcaseBusiness} label="Employment" value={info} capitalize />
            </dl>
        );
    }

    const employer = info.employer || info.company || info.employerName;
    const position = info.position || info.jobTitle || info.role;
    const employmentType = info.employmentType || info.type;
    const monthlyIncome =
        info.monthlyIncome || info.income || info.salary;
    const yearsEmployed =
        info.yearsEmployed || info.yearsOfService || info.tenure;
    const workAddress = info.workAddress || info.address;
    const supervisor = info.supervisor || info.supervisorName;

    const hasAny = [
        employer,
        position,
        employmentType,
        monthlyIncome,
        yearsEmployed,
        workAddress,
        supervisor,
    ].some((v) => v !== undefined && v !== null && v !== "");

    if (!hasAny) {
        return (
            <SectionEmpty
                icon={BriefcaseBusiness}
                message="No employment information has been provided for this tenant."
            />
        );
    }

    return (
        <dl className="flex flex-col gap-4">
            <InfoRow icon={Building2} label="Employer" value={employer} />
            <InfoRow icon={Briefcase} label="Position" value={position} capitalize />
            <InfoRow
                icon={FileText}
                label="Employment Type"
                value={titleCase(employmentType)}
            />
            <InfoRow
                icon={Wallet}
                label="Monthly Income"
                value={
                    monthlyIncome != null
                        ? formatCurrency(monthlyIncome)
                        : null
                }
            />
            <InfoRow
                icon={Calendar}
                label="Years Employed"
                value={
                    yearsEmployed != null ? `${yearsEmployed} year(s)` : null
                }
            />
            <InfoRow icon={Home} label="Work Address" value={workAddress} />
            <InfoRow icon={User} label="Supervisor" value={supervisor} />
        </dl>
    );
}

/* ---------------- page ---------------- */

export default async function Page({ params }) {
    const { id } = await params;
    const result = await getTenantById(id);
    const tenant = result?.data ?? result;

    if (!tenant || typeof tenant !== "object" || Array.isArray(tenant)) {
        return (
            <div className="space-y-6 p-2">
                <Link
                    href="/dashboard/admin/users"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to tenants
                </Link>

                <EmptyState
                    icon={UserRound}
                    title="Tenant not found"
                    message="This tenant may have been removed or the link may be incorrect."
                />
            </div>
        );
    }

    const name = displayName(tenant);
    const profilePicture = tenant.display_picture
        ? `${UPLOAD_BASE}/${tenant.display_picture}`
        : "/avatar.png";

    const details = buildDetailRows(tenant);
    const leases = Array.isArray(tenant.leases) ? tenant.leases : [];

    return (
        <div className="space-y-6 p-2 sm:p-4">
            <Link
                href="/dashboard/admin/users"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
            >
                <ChevronLeft className="h-4 w-4" />
                Back to tenants
            </Link>

            {/* Header card */}
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
                                {tenant.email || "No email available"}
                            </p>
                         
                        </div>
                    </div>
                    <div className="flex h-full w-full flex-wrap items-start justify-end gap-2">
                        <StatusChips status={tenant.status || "active"} />
                    </div>
                </div>
            </DashboardGridItem>

            {/* Basic tenant info */}
            <DashboardGridItem title="Tenant Information">
                <dl className="flex flex-col gap-4">
                    {details.map(({ label, value, icon: Icon }) => (
                        <InfoRow
                            key={label}
                            icon={Icon}
                            label={label}
                            value={value}
                            capitalize
                        />
                    ))}
                </dl>
            </DashboardGridItem>

            {/* Identification */}
            <DashboardGridItem title="Identification">
                <IdentificationDetails identification={tenant.identification} />
            </DashboardGridItem>

            {/* Emergency Contact */}
            <DashboardGridItem title="Emergency Contact">
                <EmergencyContactDetails contact={tenant.emergencyContact} />
            </DashboardGridItem>

            {/* Occupation */}
            <DashboardGridItem title="Occupation">
                <OccupationDetails occupation={tenant.occupation} />
            </DashboardGridItem>

            {/* Employment Information */}
            <DashboardGridItem title="Employment Information">
                <EmploymentInformationDetails info={tenant.employmentInformation} />
            </DashboardGridItem>

            {/* Leases */}
            <DashboardGridItem title="Leases">
                {leases.length === 0 ? (
                    <EmptyState
                        icon={Home}
                        title="No leases"
                        message={`No lease agreements found for ${name}.`}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 bg-primary-100">
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                                        Lease
                                    </th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                                        Property / Unit
                                    </th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">
                                        Term
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                                        Rent
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {leases.map((lease) => (
                                    <tr
                                        key={lease.id}
                                        className="border-b border-gray-200 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-primary">
                                            <div className="flex items-center gap-2">
                                                <Hash className="h-4 w-4 shrink-0 text-gray-400" />
                                                <span className="break-words">
                                                    {lease.leaseNumber || lease.id?.slice(0, 8)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                                                    <span className="break-words capitalize">
                                                        {leasePropertyName(lease)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 pl-6 text-xs text-gray-500">
                                                    <DoorOpen className="h-3.5 w-3.5 shrink-0" />
                                                    {leaseUnit(lease)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {formatDate(lease.startDate)} –{" "}
                                            {formatDate(lease.endDate)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                            {lease.rentAmount != null
                                                ? formatCurrency(lease.rentAmount)
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center">
                                                <StatusChips
                                                    status={lease.status || "unknown"}
                                                />
                                            </div>
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