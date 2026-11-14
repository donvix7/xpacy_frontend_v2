import MobileDashboardHeader from "@/app/_components/MobileDashboardHeader";
import ProfileForm from "@/app/_components/ProfileForm";
import ProfilePhoto from "@/app/_components/ProfilePhoto";
import UpdatePasswordForm from "@/app/_components/UpdatePasswordForm";
import DeleteProfileButton from "@/app/_components/DeleteProfileButton";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import {
  getActiveOrganizationRole,
  getOrganizationById,
  getUserProfile,
} from "@/app/_lib/data-services";
import { cookies } from "next/headers";

const hasValue = (...vals) =>
  vals.some((v) => v != null && String(v).trim() !== "");

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const organizationId = cookieStore.get("organizationId")?.value;
  const [profile, organizationResult, organizationRole] = await Promise.all([
    getUserProfile(token),
    organizationId ? getOrganizationById(organizationId) : Promise.resolve(null),
    getActiveOrganizationRole(),
  ]);
  const organization =
    organizationResult?.organization ||
    organizationResult?.data?.organization ||
    organizationResult?.data ||
    organizationResult;

  // ---- Hero stats ----------------------------------------------------------
  const fullName =
    [profile?.first_name || profile?.firstname, profile?.last_name || profile?.lastname]
      .filter(Boolean)
      .join(" ") ||
    profile?.name ||
    profile?.full_name ||
    "Member";

  const hasPhoto = hasValue(
    profile?.avatar,
    profile?.photo,
    profile?.profile_photo,
    profile?.image,
  );
  const hasPhone = hasValue(
    profile?.phone,
    profile?.phone_number,
    profile?.mobile,
  );

  const completionItems = [hasPhoto, hasPhone, !!organization];
  const completionScore = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100,
  );

  const heroStats = [
    {
      label: "Account",
      value: fullName,
      hint: profile?.email || "No email on file",
    },
    {
      label: "Profile Complete",
      value: `${completionScore}%`,
      hint: hasPhoto ? "Photo uploaded" : "Add a profile photo",
    },
    {
      label: "Organization",
      value: organization?.name || "None",
      hint: organizationRole ? `Role: ${organizationRole}` : "No active role",
    },
    {
      label: "Phone",
      value: hasPhone ? "Set" : "Missing",
      hint: profile?.phone || profile?.phone_number || "Add a phone number",
    },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-8 p-2">
      <MobileDashboardHeader />

      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                Account console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Account Settings
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Manage your profile, password and account preferences — keep everything up to date.
              </p>
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
        </div>
      </section>

      {/* ---------- Existing sections ---------- */}
      <div className="flex flex-col gap-12">
        <DashboardGridItem title="Profile Photo">
          <ProfilePhoto
            profile={profile}
            organizationId={organizationId}
            organizationRole={organizationRole}
            organizationName={organization?.name}
          />
        </DashboardGridItem>

        <DashboardGridItem title="Personal Information">
          <ProfileForm profile={profile} />
        </DashboardGridItem>

        <DashboardGridItem title="Account Security">
          <UpdatePasswordForm />
        </DashboardGridItem>

        <DashboardGridItem title="Danger Zone">
          <DeleteProfileButton />
        </DashboardGridItem>
      </div>
    </div>
  );
}