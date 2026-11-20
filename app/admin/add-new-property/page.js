import { cookies } from "next/headers";
import {
  getPropertyOwner,
  getUserProfile,
  getAllOrganization,
} from "@/app/_lib/data-services";
import CreatePropertyWithPreview from "./CreatePropertyWithPreview";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const cookieOrgId = cookieStore.get("organizationId")?.value;
  const cookieUserId = cookieStore.get("userId")?.value;
  const cookieEmail = cookieStore.get("userEmail")?.value;
  const userRole = cookieStore.get("userRole")?.value || "admin";

  const [ownersResult, profileResult, orgsResult] = await Promise.allSettled([
    getPropertyOwner(token),
    getUserProfile(token),
    getAllOrganization(),
  ]);

  const rawOwners = ownersResult.status === "fulfilled" ? ownersResult.value : [];
  const profileRaw = profileResult.status === "fulfilled" ? profileResult.value : null;
  const profile = profileRaw?.user || profileRaw?.data || profileRaw || {};
  const rawOrgs = orgsResult.status === "fulfilled" ? orgsResult.value : [];

  const currentUserId = String(cookieUserId || profile?.id || profile?.userId || profile?._id || "");
  const currentUserEmail = String(cookieEmail || profile?.email || "");
  const currentUserName = [
    profile?.firstName || profile?.firstname,
    profile?.lastName || profile?.lastname,
  ].filter(Boolean).join(" ") || profile?.name || profile?.username || currentUserEmail || "Current User";

  const currentOwner = (currentUserId || currentUserEmail) ? {
    id: currentUserId || currentUserEmail,
    _id: currentUserId,
    first_name: profile?.firstName || profile?.firstname || currentUserName,
    last_name: profile?.lastName || profile?.lastname || "",
    email: currentUserEmail,
    name: currentUserName,
  } : null;

  const ownersList = Array.isArray(rawOwners)
    ? rawOwners
    : Array.isArray(rawOwners?.data)
      ? rawOwners.data
      : [];

  const orgsList = Array.isArray(rawOrgs)
    ? rawOrgs
    : Array.isArray(rawOrgs?.data)
      ? rawOrgs.data
      : Array.isArray(rawOrgs?.organizations)
        ? rawOrgs.organizations
        : [];

  const organizationId = cookieOrgId || "";

  return (
    <CreatePropertyWithPreview
      owners={ownersList}
      currentOwner={currentOwner}
      organizations={orgsList}
      organizationId={organizationId}
      userRole={userRole}
    />
  );
}
