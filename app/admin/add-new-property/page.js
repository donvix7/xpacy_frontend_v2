import { cookies } from "next/headers";
import {
  getPropertyOwner,
  getUserProfile,
  getAllOrganization,
  getPropertyById,
} from "@/app/_lib/data-services";
import { SAMPLE_PROPERTY_DETAIL } from "@/app/_lib/sample-properties";
import CreatePropertyWithPreview from "./CreatePropertyWithPreview";

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const isEdit = Boolean(resolved?.propertyId || resolved?.id || resolved?.edit);
  return {
    title: isEdit ? "Edit Property | Xpacy" : "Add New Property | Xpacy",
    description: isEdit
      ? "Update property details, classification, capacity, and location."
      : "Create a new property with organization, owner, details, and location.",
  };
}

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const rawEditId =
    resolvedSearchParams?.propertyId ||
    resolvedSearchParams?.id ||
    resolvedSearchParams?.edit;
  const editPropertyId = Array.isArray(rawEditId) ? rawEditId[0] : rawEditId;
  const rawReturnTo = resolvedSearchParams?.returnTo;
  const returnTo = Array.isArray(rawReturnTo)
    ? rawReturnTo[0]
    : rawReturnTo || "";

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const cookieOrgId =
    cookieStore.get("organizationId")?.value ||
    cookieStore.get("organization_id")?.value;
  const cookieUserId = cookieStore.get("userId")?.value;
  const cookieEmail = cookieStore.get("userEmail")?.value;
  const userRole = cookieStore.get("userRole")?.value || "admin";

  const [ownersResult, profileResult, orgsResult, propertyResult] =
    await Promise.allSettled([
      getPropertyOwner(token),
      getUserProfile(token),
      getAllOrganization(),
      editPropertyId && typeof editPropertyId === "string" && editPropertyId.trim()
        ? getPropertyById(editPropertyId.trim())
        : Promise.resolve(null),
    ]);

  const rawOwners = ownersResult.status === "fulfilled" ? ownersResult.value : [];
  const profileRaw = profileResult.status === "fulfilled" ? profileResult.value : null;
  const profile = profileRaw?.user || profileRaw?.data || profileRaw || {};
  const rawOrgs = orgsResult.status === "fulfilled" ? orgsResult.value : [];

  const currentUserId = String(cookieUserId || profile?.id || profile?.userId || profile?._id || "");
  const currentUserEmail = String(cookieEmail || profile?.email || "");

  const ownersList = Array.isArray(rawOwners)
    ? rawOwners
    : Array.isArray(rawOwners?.data)
      ? rawOwners.data
      : [];

  // Only pre-select an owner if the logged-in user actually exists in /api/v1/owners
  const currentOwner =
    ownersList.find(
      (o) =>
        (currentUserId && (String(o?.userId || "") === currentUserId || String(o?.id || "") === currentUserId)) ||
        (currentUserEmail && String(o?.email || "").toLowerCase() === currentUserEmail.toLowerCase())
    ) || null;

  const orgsList = Array.isArray(rawOrgs)
    ? rawOrgs
    : Array.isArray(rawOrgs?.data)
      ? rawOrgs.data
      : Array.isArray(rawOrgs?.organizations)
        ? rawOrgs.organizations
        : [];

  let initialData = null;
  const isEditMode = Boolean(
    editPropertyId && typeof editPropertyId === "string" && editPropertyId.trim()
  );

  if (isEditMode) {
    const cleanId = editPropertyId.trim();
    const rawProp =
      propertyResult.status === "fulfilled" ? propertyResult.value : null;
    initialData =
      rawProp?.data ||
      rawProp?.property ||
      rawProp ||
      (cleanId === SAMPLE_PROPERTY_DETAIL.id ? SAMPLE_PROPERTY_DETAIL : null);
  }

  const organizationId =
    initialData?.organizationId ||
    cookieOrgId ||
    String(orgsList[0]?.id || orgsList[0]?._id || "");

  return (
    <CreatePropertyWithPreview
      owners={ownersList}
      currentOwner={currentOwner}
      organizations={orgsList}
      organizationId={organizationId}
      userRole={userRole}
      initialData={initialData}
      isEditMode={isEditMode}
      returnTo={returnTo}
    />
  );
}
