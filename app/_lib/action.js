"use server";
import { safeFetch } from "./safe-fetch";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"
import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminOrganizationMembers } from "./data-services";

const URL = "https://app.xpacy.com";
const dashboardByRole = {
  user: "/dashboard/user",
  admin: "/dashboard/admin",
  administrator: "/dashboard/admin",
  superadmin: "/dashboard/admin",
  superadministrator: "/dashboard/admin",
  propertyowner: "/dashboard/property-owner",
  propertymanager: "/dashboard/property-manager",
  facilitymanager: "/dashboard/facility-manager",
};

const normalizeRole = (role) => String(role || "").trim().toLowerCase().replace(/[\s_-]/g, "");
const dashboardByOrganizationRole = {
  facilitymanager: "/dashboard/facility-manager",
  propertymanager: "/dashboard/property-manager",
  propertyowner: "/dashboard/property-owner",
  organizationadmin: "/dashboard/property-owner",
  organizationadministrator: "/dashboard/property-owner",
  organizationowner: "/dashboard/property-owner",
  orgadmin: "/dashboard/property-owner",
  owner: "/dashboard/property-owner",
  admin: "/dashboard/property-owner",
  tenant: "/dashboard/user",
};

async function getOrganizationMembershipRole(organizationId, token, userId, email) {
  if (!organizationId || !token) return "";
  try {
    const response = await safeFetch(`https://services.xpacy.com/api/v1/organizations/${encodeURIComponent(organizationId)}/members?page=1&limit=100`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return "";
    const payload = await response.json();
    const members = [
      payload,
      payload?.data,
      payload?.members,
      payload?.memberships,
      payload?.data?.members,
      payload?.data?.memberships,
      payload?.data?.items,
      payload?.data?.data,
      payload?.data?.data?.members,
      payload?.data?.data?.items,
      payload?.data?.results,
      payload?.result?.members,
      payload?.result?.items,
      payload?.result,
      payload?.items,
    ]
      .find(Array.isArray) || [];
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const member = members.find((entry) => {
      const ids = [
        entry?.userId,
        entry?.user_id,
        entry?.member?.userId,
        entry?.member?.user_id,
        entry?.member?.user?.id,
        entry?.member?.user?._id,
        entry?.user?.id,
        entry?.user?._id,
        entry?.user?.userId,
        entry?.user?.user_id,
        entry?.profile?.id,
        entry?.profile?._id,
      ]
        .filter(Boolean).map(String);
      const memberEmail = String(entry?.email || entry?.member?.email || entry?.user?.email || entry?.profile?.email || "").trim().toLowerCase();
      return (userId && ids.includes(String(userId))) || (normalizedEmail && memberEmail === normalizedEmail);
    });
    const role = member?.role?.name || member?.role?.value || member?.role?.code || member?.role
      || member?.organizationRole?.name || member?.organizationRole?.value || member?.organizationRole?.code || member?.organizationRole
      || member?.memberRole?.name || member?.memberRole?.value || member?.memberRole?.code || member?.memberRole
      || member?.membership?.role?.name || member?.membership?.role?.value || member?.membership?.role
      || member?.roleName;
    return typeof role === "string" ? role : "";
  } catch {
    return "";
  }
}

async function getOrganizationMemberList(organizationId) {
  const limit = 100;
  const members = [];
  let page = 1;

  try {
    while (page <= 100) {
      const payload = await getAdminOrganizationMembers(organizationId, limit, page);
      const currentPageMembers = Array.isArray(payload)
        ? payload
        : [
            payload?.members,
            payload?.memberships,
            payload?.items,
            payload?.results,
            payload?.data,
            payload?.data?.members,
            payload?.data?.memberships,
            payload?.data?.items,
            payload?.data?.results,
            payload?.data?.data?.members,
            payload?.data?.data?.items,
          ].find(Array.isArray) || [];
      members.push(...currentPageMembers);
      if (currentPageMembers.length < limit) break;
      page += 1;
    }

    return members;
  } catch {
    return members;
  }
}

function getRoleFromMemberList(members, userId, email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const currentMember = members.find((member) => {
    const ids = [
      member?.userId,
      member?.user_id,
      member?.member?.userId,
      member?.member?.user_id,
      member?.member?.user?.id,
      member?.member?.user?._id,
      member?.user?.id,
      member?.user?._id,
      member?.profile?.id,
      member?.profile?._id,
      member?.member?.profile?.id,
      member?.member?.profile?._id,
    ]
      .filter(Boolean).map(String);
    const memberEmail = String(member?.email || member?.member?.email || member?.user?.email || member?.profile?.email || member?.member?.user?.email || member?.member?.profile?.email || "").trim().toLowerCase();
    return (userId && ids.includes(String(userId))) || (normalizedEmail && memberEmail === normalizedEmail);
  });
  const role = currentMember?.role?.name || currentMember?.role?.value || currentMember?.role?.code || currentMember?.role
    || currentMember?.organizationRole?.name || currentMember?.organizationRole?.value || currentMember?.organizationRole?.code || currentMember?.organizationRole
    || currentMember?.memberRole?.name || currentMember?.memberRole?.value || currentMember?.memberRole?.code || currentMember?.memberRole
    || currentMember?.membership?.role?.name || currentMember?.membership?.role?.value || currentMember?.membership?.role
    || currentMember?.roleName;
  return typeof role === "string" ? role : "";
}

export async function attachCurrentUserRolesToOrganizations(organizations = []) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = cookieStore.get("userId")?.value;
  const email = cookieStore.get("userEmail")?.value;

  return Promise.all(organizations.map(async (organization) => {
    const id = organization?.id || organization?._id || organization?.organizationId || organization?.organization_id;
    if (!id || !token) return { ...organization, id: id ? String(id) : "", organizationRole: "", members: [] };

    const members = await getOrganizationMemberList(String(id));
    const organizationRole = getRoleFromMemberList(members, userId, email);
    const displayMembers = members.map((member, index) => {
      const user = member?.user || member?.profile || member?.member?.user || member?.member?.profile || {};
      const name = member?.name
        || [user?.firstName || user?.firstname, user?.lastName || user?.lastname].filter(Boolean).join(" ")
        || user?.name
        || user?.username
        || user?.email
        || member?.email
        || `Member ${index + 1}`;
      const memberRole = member?.role?.name || member?.role?.value || member?.role?.code || member?.role
        || member?.organizationRole?.name || member?.organizationRole?.value || member?.organizationRole?.code || member?.organizationRole
        || member?.memberRole?.name || member?.memberRole?.value || member?.memberRole?.code || member?.memberRole
        || member?.membership?.role?.name || member?.membership?.role?.value || member?.membership?.role
        || member?.roleName;
      return {
        id: String(member?.id || member?._id || member?.userId || member?.user_id || index),
        name: String(name),
        email: String(member?.email || user?.email || ""),
        role: typeof memberRole === "string" ? memberRole : "",
      };
    });

    return { ...organization, id: String(id), organizationRole, members: displayMembers };
  }));
}


export const submitSubscribe = async (formData) => {
  const email = formData.get("email");
  const response = await safeFetch(`${URL}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (data.message === "User is already subscribed") {
    return {
      success: false,
      data,
    };
  } else {
    return {
      success: true,
      data,
    };
  }
};


export const handleSearch = async (formData) => {
  const search = {
    purpose: formData.get("purpose"),
    location: formData.get("location") ?? "",
    type: formData.get("type") ?? "",
    minBedrooms: Number(formData.get("minBedrooms")) || "",
    minPrice: Number(formData.get("minPrice")) || "",
    maxPrice: Number(formData.get("maxPrice")) || "",
  }
  const { purpose, type, location, minBedrooms, minPrice, maxPrice } = search
  const params = new URLSearchParams({ purpose, type, state: location, minBedrooms: String(minBedrooms), minPrice: String(minPrice), maxPrice: String(maxPrice) });
  const organizationId = formData.get("organizationId");
  if (organizationId) params.set("organizationId", String(organizationId));
  redirect(`/search?${params.toString()}`)
}

export async function handleUserLogin(userData, requestedRedirectUrl = "") {
  const response = await fetch(`https://services.xpacy.com/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...userData }),
  });
  const data = await response.json();
  console.log(data)
  if (!response.ok || data?.success === false) {
    return { success: false, message: data?.message || "Unable to log in. Check your details and try again." };
  }

  const auth = data?.data && typeof data.data === "object" ? data.data : data;
  const user = auth?.user || data?.user || auth?.profile || {};
  const rawRole = user.role || auth.role || data.role || user.user_role || data.user_role;
  const role = normalizeRole(rawRole);
  const roleDestination = dashboardByRole[role];
  if (!roleDestination) {
    return { success: false, message: "Your account role is not supported for dashboard access." };
  }

  const accessToken = auth.accessToken || auth.access_token || auth.token || data.accessToken || data.access_token || data.token;
  if (typeof accessToken !== "string" || !accessToken) {
    return { success: false, message: "Login succeeded, but the session token was missing. Please try again." };
  }

  const cookieStore = await cookies();
  cookieStore.delete("organizationAdmin");
  cookieStore.delete("organizationId");
  cookieStore.delete("organizationRole");
  cookieStore.delete("organizationSubscription");
  cookieStore.delete("organizationSubscriptionPlan");
  cookieStore.set("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
  cookieStore.set("userRole", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  const userId = user.id || user._id || user.userId || user.user_id || auth.userId || auth.user_id;
  const email = user.email || auth.email;
  if (userId) cookieStore.set("userId", String(userId), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
  else cookieStore.delete("userId");
  if (email) cookieStore.set("userEmail", String(email), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
  else cookieStore.delete("userEmail");
  const refreshToken = auth.refreshToken || auth.refresh_token || data.refreshToken || data.refresh_token;
  if (typeof refreshToken === "string" && refreshToken) {
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } else {
    cookieStore.delete("refreshToken");
  }

  const safeRequestedRedirectUrl = typeof requestedRedirectUrl === "string" &&
    requestedRedirectUrl.startsWith("/") &&
    !requestedRedirectUrl.startsWith("//") &&
    role === "user"
    ? requestedRedirectUrl
    : "";

  const proceedParams = new URLSearchParams({ role });
  if (safeRequestedRedirectUrl) proceedParams.set("returnTo", safeRequestedRedirectUrl);

  return {
    success: true,
    message: "Logged in successfully",
    role: rawRole,
    redirectTo: `/auth/proceed?${proceedParams.toString()}`,
  };
}

export async function completeProceedSelection(organizationId, requestedReturnTo) {
  const cookieStore = await cookies();
  const role = normalizeRole(cookieStore.get("userRole")?.value);
  const redirectTo = dashboardByRole[role];
  if (!cookieStore.get("token")?.value || !redirectTo) {
    return { success: false, message: "Your session has expired. Please log in again." };
  }

  if (["admin", "administrator", "superadmin", "superadministrator"].includes(role)) {
    cookieStore.delete("organizationId");
    cookieStore.delete("organizationRole");
    return { success: true, redirectTo };
  }

  let organizationRole = "";
  if (typeof organizationId === "string" && organizationId.trim()) {
    const selectedOrganizationId = organizationId.trim();
    organizationRole = await getOrganizationMembershipRole(
      selectedOrganizationId,
      cookieStore.get("token")?.value,
      cookieStore.get("userId")?.value,
      cookieStore.get("userEmail")?.value
    );

    const organizationDashboard = dashboardByOrganizationRole[normalizeRole(organizationRole)];
    if (!organizationRole || !organizationDashboard) {
      cookieStore.delete("organizationId");
      cookieStore.delete("organizationRole");
      return {
        success: false,
        message: "We couldn’t verify your role in that organization. Please try again or ask an organization admin to check your membership.",
      };
    }

    cookieStore.set("organizationId", selectedOrganizationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    cookieStore.set("organizationRole", organizationRole, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24,
    });
  } else {
    cookieStore.delete("organizationId");
    cookieStore.delete("organizationRole");
  }

  const organizationDashboard = dashboardByOrganizationRole[normalizeRole(organizationRole)];
  const returnTo = organizationDashboard || (role === "user" &&
    typeof requestedReturnTo === "string" &&
    requestedReturnTo.startsWith("/") &&
    !requestedReturnTo.startsWith("//")
    ? requestedReturnTo
    : redirectTo);

  return { success: true, redirectTo: returnTo };
}

export async function setActiveOrganization(organizationId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = normalizeRole(cookieStore.get("userRole")?.value);
  if (!token || role !== "propertyowner" || cookieStore.get("organizationAdmin")?.value !== "1") {
    return { success: false, message: "You cannot switch organizations with this account." };
  }
  if (typeof organizationId !== "string" || !organizationId.trim()) {
    return { success: false, message: "Choose an organization." };
  }

  try {
    const response = await safeFetch("https://services.xpacy.com/api/v1/organizations?page=1&limit=100", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return { success: false, message: "Could not verify your organization access." };
    const payload = await response.json();
    const organizations = [payload, payload?.data, payload?.organizations, payload?.data?.organizations, payload?.items]
      .find(Array.isArray) || [];
    const hasAccess = organizations.some((organization) =>
      String(organization?.id || organization?._id || organization?.organizationId || organization?.organization_id || "") === organizationId.trim()
    );
    if (!hasAccess) return { success: false, message: "You do not have access to that organization." };

    cookieStore.set("organizationId", organizationId.trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    const organizationRole = await getOrganizationMembershipRole(
      organizationId.trim(), token, cookieStore.get("userId")?.value, cookieStore.get("userEmail")?.value
    );
    if (organizationRole) cookieStore.set("organizationRole", organizationRole, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
    });
    else cookieStore.delete("organizationRole");
    revalidatePath("/dashboard/property-owner");
    return { success: true };
  } catch {
    return { success: false, message: "Could not switch organizations. Try again." };
  }
}

export async function createOrganizationForCurrentUser(data) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { success: false, message: "Please log in to create an organization." };
  const selectedPlan = cookieStore.get("organizationSubscriptionPlan")?.value;
  if (!["core", "growth", "enterprise"].includes(selectedPlan)) {
    return { success: false, message: "Choose an organization subscription plan before completing setup." };
  }

  const payload = {
    name: String(data?.name || "").trim(),
    slug: String(data?.slug || "").trim(),
    email: String(data?.email || "").trim(),
    phone: String(data?.phone || "").trim(),
    address: String(data?.address || "").trim(),
    city: String(data?.city || "").trim(),
    state: String(data?.state || "").trim(),
    country: String(data?.country || "").trim(),
    timezone: String(data?.timezone || "").trim(),
    currency: String(data?.currency || "").trim(),
  };
  if (!payload.name || !payload.slug) {
    return { success: false, message: "Organization name and slug are required." };
  }

  try {
    const response = await safeFetch("https://services.xpacy.com/api/v1/organizations", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok || result?.success === false || result?.error) {
      return { success: false, message: result?.message || result?.error || "Could not create the organization." };
    }
    const organization = result?.data?.organization || result?.organization || result?.data || result;
    const organizationId = organization?.id || organization?._id || organization?.organizationId;
    if (!organizationId) return { success: false, message: "The organization was created, but the response did not include its ID." };

    cookieStore.set("userRole", "propertyowner", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    cookieStore.set("organizationAdmin", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    cookieStore.set("organizationRole", "ADMIN", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    cookieStore.set("organizationId", String(organizationId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    cookieStore.delete("organizationSubscriptionPlan");
    revalidatePath("/dashboard/property-owner");
    return { success: true, redirectTo: "/dashboard/property-owner" };
  } catch (error) {
    return { success: false, message: error?.message || "Could not create the organization." };
  }
}

export async function selectOrganizationSubscriptionPlan(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const planId = String(formData.get("planId") || "");
  const requestedReturnTo = String(formData.get("returnTo") || "");
  const returnTo = requestedReturnTo.startsWith("/dashboard/user/create-organization")
    ? requestedReturnTo
    : "/dashboard/user/create-organization";

  if (!token) {
    redirect(`/auth/log-in?redirectUrl=${encodeURIComponent(returnTo)}`);
  }
  if (!["core", "growth", "enterprise"].includes(planId)) {
    redirect(`/dashboard/user/subscriptions?returnTo=${encodeURIComponent(returnTo)}&error=invalid-plan`);
  }

  cookieStore.set("organizationSubscriptionPlan", planId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(returnTo);
}


function getApiErrorMessage(data, fallback) {
  const message = data?.message ?? data?.error ?? data?.details;
  if (Array.isArray(message)) return message.filter(Boolean).join(". ");
  if (typeof message === "string" && message.trim()) return message;
  return fallback;
}

export async function handleSignup(userData, referralCode) {
  const payload = {
    firstName: userData.firstname ?? userData.firstName,
    lastName: userData.lastname ?? userData.lastName,
    phone: userData.phoneNumber ?? userData.phone,
    email: userData.email,
    password: userData.password,
  };
  const query = referralCode ? `?referralCode=${encodeURIComponent(referralCode)}` : "";
  const response = await safeFetch(`https://services.xpacy.com/api/v1/auth/register${query}`, {

    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  })
  const data = await response.json();

  if (!response.ok) return { success: false, message: getApiErrorMessage(data, "We could not create your account. Please try again.") }

  return { success: true, message: data.message || "Account created. Check your email to verify your address.", user: data.user }
}

export async function handlePropertyOwnerSignup(userData, referralCode) {
  // The dedicated /property-owner/register endpoint was retired with the legacy API.
  // Owner accounts are created through the shared auth register endpoint.
  return handleSignup(userData, referralCode);
}

// ...existing imports...
import { headers } from "next/headers"
import { SERVICES_URL } from "./constants";

// ...

export async function handleCompleteOwnerRegistration(userData, token) {
  try {
    if (!token) return { success: false, message: "Token is missing" }

    const response = await safeFetch(`${URL}/property-owner/complete-registration?token=${token}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: userData.password })
    })
    
    let data;
    try {
       data = await response.json();
    } catch (error) {
       return { success: false, message: "Invalid server response" };
    }

    if (!response.ok) {
      return { success: false, message: data.message || "Failed to complete registration" }
    }

    return { success: true, message: data.message }
  } catch (error) {
    return { success: false, message: error.message || "An unexpected error occurred" }
  }
}

export async function resendPropertyOwnerRegistrationEmail(email) {
  const response = await safeFetch(`${URL}/property-owner/resend-registration-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email })
  })
  const data = await response.json();

  if (!response.ok) return { success: false, message: data.message }

  return { success: true, message: data.message }
}

export async function handleSaveProperty(id) {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")
  if (!token?.value) throw new Error("Please log in to continue")
  
  const body = JSON.stringify({ propertyId: id });

  const response = await safeFetch(`${URL}/user-property/saved-properties`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-type": "application/json",
    },
    body: body
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to save property");
  }
  
  revalidateTag("saved-properties");
  revalidatePath("/dashboard/user/saved-properties");
  return data;
}

export async function handleBookProperty(id) {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token");
  if (!token?.value) throw new Error("Please Log in to book this property");
  
  try {
    const res = await safeFetch(`${URL}/user/create-booking`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token?.value}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify({ propertyId: id })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to book property");
    return data;
  } catch (error) {
    throw error;
  }
}



export async function handleDelteSavedProp(savedPropertyId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) throw new Error("Please Log in to continue");
  const response = await safeFetch(`${URL}/user-property/delete-saved-property/${savedPropertyId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-type": "application/json",
    }
  });
  const data = await response.json();
  revalidateTag('saved-properties');
  revalidatePath("/dashboard/user/saved-properties");
  return data
}

export async function handleLogOut() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  // Best-effort server-side session invalidation — always clear local cookies regardless of result
  try {
    await safeFetch(`https://services.xpacy.com/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token?.value}`,
      },
    });
  } catch (_) {
    // Swallow network errors — local logout must still proceed
  }

  cookieStore.delete("token");
  cookieStore.delete("refreshToken");
  cookieStore.delete("organizationAdmin");
  cookieStore.delete("organizationId");
  cookieStore.delete("organizationRole");
  cookieStore.delete("userId");
  cookieStore.delete("userEmail");
  cookieStore.delete("organizationSubscription");
  cookieStore.delete("organizationSubscriptionPlan");
  redirect("/auth/log-in");
}


export async function uploadDisplayPhoto(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) throw new Error("Please Log in to continue");
  const response = await safeFetch(`${URL}/user/upload-display-image`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
    },
    body: formData
  });
  const data = await response.json();
  revalidateTag("user-profile");
  return data
}

export async function updateUserProfile(userData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) throw new Error("Please Log in to continue");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/users/${userData.id}`,
   {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...userData })
  });
  const data = await response.json();
  revalidateTag("user-profile");
  return data
}

export async function deleteCurrentUserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { success: false, message: "Please log in to continue." };

  try {
    let userId = cookieStore.get("userId")?.value;
    if (!userId) {
      const profileResponse = await safeFetch("https://services.xpacy.com/api/v1/auth/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      });
      if (profileResponse.ok) {
        const profilePayload = await profileResponse.json();
        const profile = profilePayload?.user || profilePayload?.data?.user || profilePayload?.data || profilePayload;
        userId = profile?.id || profile?._id || profile?.userId || profile?.user_id;
      }
    }
    if (!userId) return { success: false, message: "Could not identify your account. Please sign in again and retry." };

    const response = await safeFetch(`https://services.xpacy.com/api/v1/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    let result = null;
    try { result = await response.json(); } catch {}
    if (!response.ok || result?.success === false || result?.error) {
      return { success: false, message: result?.message || result?.error || "Could not delete your profile." };
    }

    ["token", "refreshToken", "userRole", "userId", "userEmail", "organizationAdmin", "organizationId", "organizationRole", "organizationSubscription", "organizationSubscriptionPlan"].forEach((name) => cookieStore.delete(name));
    return { success: true };
  } catch {
    return { success: false, message: "Could not delete your profile. Please try again." };
  }
}

export async function updateUserPassword(userData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) throw new Error("Please Log in to continue");
  const response = await safeFetch(`${URL}/user/change-password`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...userData })
  });
  const data = await response.json();
  return data
}



export async function createBooking(formData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token?.value) return { success: false, message: "Please Log in to continue" };
    
    const response = await safeFetch(`${URL}/user/create-booking`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token?.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        ...formData,
        propertyId: formData.propertyId || formData.property_id 
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || "Failed to create booking. This date may already be taken." 
      };
    }

    return { success: true, ...data };
  } catch (error) {
    return { success: false, message: error.message || "Server error while creating booking" };
  }
};

export async function handleBookService(form) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) throw new Error("Please Log in to continue");
  const data = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Handle arrays separately (e.g., property_amenities, images, videos)
      value.forEach((item) => {
        data.append(key, item); // Append each item in the array
      });
    } else if (value !== null && value !== undefined) {
      data.append(key, value);
    }
  });
  const response = await safeFetch(`${URL}/service/request-service`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
    },
    body: data
  });
  const res = await response.json();
  return res
};

export async function handleContact(formData) {
  const response = await safeFetch(`${URL}/contact/send-mail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData)
  });
  const data = await response.json();
  return data
}

export async function handleRegisterOwner(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/admin/register-propertyowner`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData)
  });
  const data = await response.json();
  return data;
}


/////////////////////////////////////*INVOICES*/////////////////////////////////////////////////


export async function createInvoice(invoice, organisationId) {
  const payload = {
  "propertyId": Number(invoice.propertyId),
  "unitId": Number(invoice.unitId),
  "customerId": Number(invoice.customerId),
  "type": invoice.type,
  "items": [
    {
      "description": invoice.description,
      "quantity": Number(invoice.quantity),
      "unitPrice": Number(invoice.unitPrice)
    }
  ],
  "subtotal": Number(invoice.subtotal),
  "tax": Number(invoice.tax),
  "discount": Number(invoice.discount),
  "total": Number(invoice.total),
  "currency": invoice.currency,
  "dueDate": invoice.dueDate
}

const cookieStore = await cookies();
const token = cookieStore.get("token");
  const res = await safeFetch(`https://services.xpacy.com/api/v1/invoices?organizationId=${organisationId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  )

  if (!res.ok) {
    let errorMsg = "Invoice creation failed";
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch {
      const errorText = await res.text();
      try {
         // Attempt to extract title from HTML if it's an HTML error page
         const titleMatch = errorText.match(/<title>(.*?)<\/title>/);
         if (titleMatch && titleMatch[1]) errorMsg = titleMatch[1];
      } catch (e) {}
    }
    throw new Error(errorMsg);
  }
  return res.json()
}

export async function submitInvoiceAction(invoice) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Please log in to continue");
  if (!invoice || !Array.isArray(invoice.items) || invoice.items.length === 0) {
    throw new Error("Add at least one invoice item before submitting");
  }

  const subtotal = Number(invoice.subTotal ?? invoice.subtotal ?? 0);
  const tax = Number(invoice.tax ?? 0);
  const total = Number(invoice.total ?? subtotal + (subtotal * tax) / 100);
  const payload = {
    ...invoice,
    recipientId: invoice.recipientId || invoice.recipientID || invoice.customerId,
    subtotal,
    tax,
    total,
    currency: invoice.currency || "NGN",
    items: invoice.items.map((item) => ({
      ...item,
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.unitPrice || 0),
    })),
  };

  const response = await safeFetch("https://services.xpacy.com/api/v1/invoices", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.message || result?.error || "Invoice submission failed");
  }

  revalidatePath("/dashboard/admin/payments");
  revalidatePath("/dashboard/user/payments");
  return result;
}




export async function cancelInvoice(id) {
  const cookieStore = await cookies();
const token = cookieStore.get("token");
  const res = await safeFetch(`https://services.xpacy.com/api/v1/invoices/${id}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
      body: JSON.stringify({}),
      cache: "no-store",
    }
  )

  if (!res.ok) {
    let errorMsg = "Invoice creation failed";
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch {
      const errorText = await res.text();
      try {
         // Attempt to extract title from HTML if it's an HTML error page
         const titleMatch = errorText.match(/<title>(.*?)<\/title>/);
         if (titleMatch && titleMatch[1]) errorMsg = titleMatch[1];
      } catch (e) {}
    }
    throw new Error(errorMsg);
  }
  return res.json()
}



export async function processInvoice(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) throw new Error("Please Log in to continue");
  const response = await safeFetch(`${URL}/payment/paystack/initialize`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invoice_id: id })
  });
  const data = await response.json();
  return data

}

/////////////////////////////////////*PAYMENTS*/////////////////////////////////////////////////


export async function iniializePayment(invoice){

  const payload = {
  "invoiceId": invoice?.id,
  "amount": invoice?.amount,
  "currency": invoice?.currency,
  "method": invoice.method,
  "idempotencyKey": invoice.idempotencyKey
}

  const cookieStore = await cookies();
const token = cookieStore.get("token");
  const res = await safeFetch(`https://services.xpacy.com/api/v1/payments/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
      body: JSON.stringify({ amount, email }),
      cache: "no-store",
    }
  )

  if (!res.ok) {
    let errorMsg = "Invoice creation failed";
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch {
      const errorText = await res.text();
      try {
         // Attempt to extract title from HTML if it's an HTML error page
         const titleMatch = errorText.match(/<title>(.*?)<\/title>/);
         if (titleMatch && titleMatch[1]) errorMsg = titleMatch[1];
      } catch (e) {}
    }
    throw new Error(errorMsg);
  }
  return res.json()
}

export async function verifyPayment(reference){
  const payment = {
  "reference": reference
}
  const cookieStore = await cookies();
const token = cookieStore.get("token");
  const res = await safeFetch(`https://services.xpacy.com/api/v1/payments/verify
`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
      body: JSON.stringify(payment),
      cache: "no-store",
    }
  )

  if (!res.ok) {
    let errorMsg = "Invoice creation failed";
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch {
      const errorText = await res.text();
      try {
         // Attempt to extract title from HTML if it's an HTML error page
         const titleMatch = errorText.match(/<title>(.*?)<\/title>/);
         if (titleMatch && titleMatch[1]) errorMsg = titleMatch[1];
      } catch (e) {}
    }
    throw new Error(errorMsg);
  }
  return res.json()
}


/////////////////////////////////////*AUTHENTICATION*/////////////////////////////////////////////////


export async function requestPasswordReset(email) {
  const response = await safeFetch(`${URL}/user/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  return data;
}

export async function resetPassword(token, newPassword) {
  const response = await safeFetch(`${URL}/user/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword })
  });
  const data = await response.json();
  return data;
}

export async function uploadKyc(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) throw new Error("Please Log in to continue");

  const response = await safeFetch(`${URL}/user/upload-kyc`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token?.value}` },
    body: formData,
  });
  const data = await response.json();
  revalidateTag("user-profile");
  return data;
}

export async function addFeaturedProperty(propertyId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/property/add-featured-property/${propertyId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  const {data} = await response.json();
  revalidateTag("featured-properties");
  return data;
}

export async function removeFeaturedProperty(propertyId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/property/remove-featured-property/${propertyId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();
  revalidateTag("featured-properties");
  return data;
}

export async function deleteProperty(propertyId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/property/delete-property/${propertyId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();
  return data;
}

export async function rescheduleService(serviceId, scheduled_date, scheduled_time) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/user/update-service/${serviceId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ scheduled_date, scheduled_time })
  });
  const data = await response.json();
  revalidateTag("booked-services");
  return data;
}

export async function cancelService(serviceId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/user/cancel-service/${serviceId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();
  revalidateTag("booked-services");
  return data;
}

export async function createServiceProvider(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/service-provider/create-service-provider`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });
  const data = await response.json();
  return data;
}

export async function updateServiceProvider(id, formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/service-provider/update-service-provider/${id}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });
  const data = await response.json();
  return data;
}

export async function deleteServiceProvider(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/service-provider/delete-service-provider/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();
  return data;
}

export async function updateInvoice(invoiceId, invoiceData){
  const payload = {
  "dueDate": invoiceData.dueDate,
  "status": invoiceData.status
}
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) throw new Error("Please Log in to continue");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/invoices/${invoiceId}
`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return data
}

export async function deleteInvoice(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/invoice/delete-invoice/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  return response.json();
}

export async function issueInvoice(id){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) throw new Error("Please Log in to continue");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/invoices/${id}/issue`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    }
  });
  const data = await response.json();
  return data
}
export async function canceleInvoice(id){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) throw new Error("Please Log in to continue");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/invoices/${id}/cancel
`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    }
  });
  const data = await response.json();
  return data
}


export async function updatePropertyOwnerDisplayPicture(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/property-owner/upload-display-image`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token?.value}` },
    body: formData
  });
  const data = await response.json();
  revalidateTag("property-owner-profile");
  return data;
}

export async function updatePropertyOwnerProfile(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  
  const mappedData = {
    ...formData,
    first_name: formData.firstname,
    last_name: formData.lastname,
    phone: formData.phone_number
  };

  // Remove the old keys if desired, or just send them along (backend typically ignores extras)
  // But to be clean:
  delete mappedData.firstname;
  delete mappedData.lastname;
  delete mappedData.phone_number;

  const response = await safeFetch(`${URL}/property-owner/update-profile`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mappedData)
  });
  const data = await response.json();
  revalidateTag("property-owner-profile");
  return data;
}

export async function createFaq(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/faq/create-faq`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });
  return response.json();
}

export async function updateFaq(id, formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/faq/update-faq/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  });
  return response.json();
}

export async function deleteFaq(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${URL}/faq/delete-faq/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  return response.json();
}

export async function invitePropertyOwner(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const headersList = await headers();
  const host = headersList.get("host") || "app.xpacy.com";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const origin = `${protocol}://${host}`;
  const name = formData.get("name");
  const email = formData.get("email");

  // Construct the payload
  const payload = {
    name,
    email,
    phone: "0000000000", // Required by endpoint but likely irrelevant for invite
    subject: "Invitation to Join Xpacy as Property Owner",
    message: `${formData.get("message") || "You have been invited to join Xpacy as a property owner. Please sign up to manage your properties."}\n\nAccept your invitation here: ${origin}/auth/accept-invite?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
  };

  const response = await safeFetch(`${URL}/contact/send-mail`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  return data;
}

export async function invitePropertyManager(formData) {
  const cookieStore = await cookies();
  if (normalizeRole(cookieStore.get("userRole")?.value) !== "propertyowner" || cookieStore.get("organizationAdmin")?.value !== "1") {
    return { success: false, message: "Only organization administrators can add managers." };
  }
  const token = cookieStore.get("token");
  const headersList = await headers();
  const host = headersList.get("host") || "app.xpacy.com";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const origin = `${protocol}://${host}`;
  const name = formData.get("name");
  const email = formData.get("email");
  const organizationId = cookieStore.get("organizationId")?.value;

  // Construct the payload
  const payload = {
    name,
    email,
    phone: "0000000000", // Required by endpoint but likely irrelevant for invite
    subject: "Invitation to Join Xpacy as Property Manager",
    message: `${formData.get("message") || "You have been invited to join Xpacy as a property manager. Please sign up to start managing properties."}${organizationId ? `\n\nOrganization ID: ${organizationId}` : ""}\n\nAccept your invitation here: ${origin}/auth/accept-invite?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
  };

  const response = await safeFetch(`${URL}/contact/send-mail`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  return { ...data, success: response.ok && data?.success !== false && !data?.error };
}

export async function inviteStaffMember(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const headersList = await headers();
  const host = headersList.get("host") || "app.xpacy.com";
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const origin = `${protocol}://${host}`;
  const name = formData.get("name");
  const email = formData.get("email");

  // Construct the payload
  const payload = {
    name,
    email,
    phone: "0000000000", // Required by endpoint but likely irrelevant for invite
    subject: "Invitation to Join Xpacy as Staff",
    message: `${formData.get("message") || "You have been invited to join Xpacy as staff. Please sign up to get started."}\n\nAccept your invitation here: ${origin}/auth/accept-invite?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
  };

  const response = await safeFetch(`${URL}/contact/send-mail`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  return data;
}

export async function createProperty(formData, token) {
  const response = await safeFetch(`${URL}/property/create-property`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
    },
    body: formData
  });
  const data = await response.json();
  return data;
}

export async function createPropertyNew(propertyData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token?.value) {
      return { success: false, message: "Please log in to continue" };
    }

    const payload = {
      name: propertyData.name,
      description: propertyData.description || "",
      propertyType: propertyData.propertyType || "RESIDENTIAL",
      address: propertyData.address,
      city: propertyData.city,
      state: propertyData.state,
      country: propertyData.country || "Nigeria",
      postalCode: propertyData.postalCode || "",
      latitude: Number(propertyData.latitude) || 0,
      longitude: Number(propertyData.longitude) || 0,
      yearBuilt: Number(propertyData.yearBuilt) || new Date().getFullYear(),
      totalFloors: Number(propertyData.totalFloors) || 1,
      totalUnits: Number(propertyData.totalUnits) || 1,
      organizationId: propertyData.organizationId || "",
      owners: Array.isArray(propertyData.owners)
        ? propertyData.owners.filter(Boolean)
        : propertyData.owners
        ? [propertyData.owners]
        : []
    };

    const response = await safeFetch(`https://services.xpacy.com/api/v1/properties`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.value}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let resData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      resData = await response.json();
    } else {
      const text = await response.text();
      resData = { message: text };
    }

    if (!response.ok) {
      return {
        success: false,
        message: resData?.message || resData?.error || `Failed to create property (${response.status})`
      };
    }

    revalidatePath("/dashboard/admin/properties");
    revalidatePath("/dashboard/property-owner/properties");
    return {
      success: true,
      data: resData,
      message: resData?.message || "Property created successfully!"
    };
  } catch (error) {
    console.warn("Error creating property:", error);
    return { success: false, message: error.message || "Failed to create property" };
  }
}


// Blog Actions
export async function createBlog(formData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    
    const response = await safeFetch(`${URL}/blog/create-post`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token?.value}`,
      },
      body: formData,
    });
    
    let data;
    try {
        data = await response.json();
    } catch (e) {
        const text = await response.text();
        return { error: `Server returned non-JSON response: ${text}` };
    }

    if (!response.ok) {
        return { error: data.message || data.error || data.details || "Failed to create blog post" };
    }
    
    revalidateTag("blogs");
    return data;
  } catch (error) {
    return { error: error.message || "An unexpected error occurred during creation" };
  }
}

export async function updateBlog(id, formData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const response = await safeFetch(`${URL}/blog/update-post/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token?.value}`,
      },
      body: formData,
    });

    let data;
    try {
        data = await response.json();
    } catch (e) {
        const text = await response.text();
        return { error: `Server returned non-JSON response: ${text}` };
    }

    if (!response.ok) {
        return { error: data.message || data.error || data.details || "Failed to update blog post" };
    }

    revalidateTag("blogs");
    return data;
  } catch (error) {
    return { error: error.message || "An unexpected error occurred during update" };
  }
}

export async function deleteBlog(id) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const response = await safeFetch(`${URL}/blog/delete-post/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token?.value}`,
        "Content-Type": "application/json"
      }
    });

    let data;
    try {
        data = await response.json();
    } catch (e) {
        const text = await response.text();
        return { error: `Server returned non-JSON response: ${text}` };
    }

    if (!response.ok) {
        return { error: data.message || data.error || data.details || "Failed to delete blog post" };
    }

    revalidateTag("blogs");
    return data;
  } catch (error) {
    return { error: error.message || "An unexpected error occurred during deletion" };
  }
}

//////////////////////////////////////////////////////

export async function refreshToken() {
  try {
    const cookieStore = await cookies();
    const refToken = cookieStore.get("refreshToken");

    if (!refToken?.value) return { success: false, message: "No refresh token found" };

    const response = await safeFetch(`https://services.xpacy.com/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refToken.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Token refresh failed" };
    }

    const newAccessToken = data.accessToken || data.token;

    // Persist the new tokens into cookies
    if (newAccessToken) {
      cookieStore.set("token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });
    }

    if (data.refreshToken) {
      cookieStore.set("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    let expiresInMs = null;
    let exp = null;
    if (newAccessToken) {
      try {
        const parts = newAccessToken.split(".");
        if (parts.length === 3) {
          const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
          const decoded = JSON.parse(jsonStr);
          if (decoded && typeof decoded.exp === "number") {
            exp = decoded.exp * 1000;
            expiresInMs = Math.max(0, exp - Date.now());
          }
        }
      } catch (_) {}
    }

    return { 
      success: true, 
      accessToken: newAccessToken,
      expiresInMs,
      expiresAt: exp,
      message: "Session refreshed successfully"
    };
  } catch (error) {
    console.warn("Error refreshing token:", error);
    return { success: false, message: error.message };
  }
}

export async function checkTokenStatus() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const refToken = cookieStore.get("refreshToken");

    // If neither token exists, user is not logged in
    if (!token?.value && !refToken?.value) {
      return { isAuthenticated: false, isExpired: false, hasRefreshToken: false, expiresInMs: null, expiresAt: null };
    }

    // If refresh token exists but access token is missing, access token has expired
    if (!token?.value && refToken?.value) {
      return { isAuthenticated: true, isExpired: true, hasRefreshToken: true, expiresInMs: 0, expiresAt: 0 };
    }

    let exp = null;
    try {
      const parts = token.value.split(".");
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
        const decoded = JSON.parse(jsonStr);
        if (decoded && typeof decoded.exp === "number") {
          exp = decoded.exp * 1000;
        }
      }
    } catch (e) {
      console.warn("Failed to decode token exp:", e);
    }

    const now = Date.now();
    const isExpired = exp ? now >= exp : false;
    const expiresInMs = exp ? Math.max(0, exp - now) : null;

    return {
      isAuthenticated: true,
      isExpired,
      hasRefreshToken: !!refToken?.value,
      expiresInMs,
      expiresAt: exp,
    };
  } catch (error) {
    console.warn("Error checking token status:", error);
    return { isAuthenticated: false, isExpired: false, hasRefreshToken: false, expiresInMs: null, expiresAt: null };
  }
}

export async function getUserProfileAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token?.value) return null;

    const response = await safeFetch(`https://services.xpacy.com/api/v1/auth/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token?.value}`,
        "Content-type": "application/json",
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("Error fetching user profile:", error);
    return null;
  }
}



/////////////////////////////////////*DOCUMENTS*/////////////////////////////////////////////////

export async function createDocument(data){
  const payload = {
  "name": data.name,
  "type": data.type,
  "url": data.url,
  "propertyId": data.propertyId,
  "organizationId": data.organizationId,
  "fileSize": data.fileSize,
  "mimeType": data.mimeType
}
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/documents
`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
}


export async function deleteDocument(id){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/documents/${id}
`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  return response.json(); 
}

/////////////////////////////////////*PROPERTIES*/////////////////////////////////////////////////


export async function addProperty(propertyData){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const role = normalizeRole(cookieStore.get("userRole")?.value);
  const isOrganizationAdmin = cookieStore.get("organizationAdmin")?.value === "1";
  const organizationId = cookieStore.get("organizationId")?.value || "";
  if (role === "propertyowner" && (!isOrganizationAdmin || !organizationId)) {
    return { success: false, message: "Only organization administrators can create properties." };
  }
  if (role === "propertyowner" && String(propertyData?.organizationId || "") !== organizationId) {
    return { success: false, message: "Select your active organization before creating a property." };
  }
  const payload = role === "propertyowner" ? { ...propertyData, organizationId } : propertyData;
  const response = await safeFetch(`https://services.xpacy.com/api/v1/properties`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  console.log('this is from the action', response)
  return response.json(); 

}

export async function addOwner(payload){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/owners
`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
}

/////////////////////////////////////*EXPENSES*/////////////////////////////////////////////////

export async function createExpense(data, organizationId){

  const payload ={
  "propertyId": data.propertyId,
  "buildingId": data.buildingId,
  "unitId": data.unitId,
  "category": data.category,
  "vendor": data.vendor,
  "amount": data.amount,
  "currency": data.currency,
  "date": data.date,
  "description": data.description,
  "receipt": data.receipt
}

  const cookieStore = await cookies();
  const token = cookieStore.get("token");

const response = await safeFetch(`https://services.xpacy.com/api/v1/expenses?organizationId=${organizationId}
`,{
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 

}

export async function updateExpense(id, data, organizationId){

  const payload = {
  "category": data.category,
  "vendor": data.vendor,
  "amount": data.amount,
  "date": data.date,
  "description": data.description,
  "receipt": data.receipt
}
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

const response = await safeFetch(`https://services.xpacy.com/api/v1/expenses/${id}
`,{
  method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 

}



/////////////////////////////////////*LEASES*/////////////////////////////////////////////////

export async function createLease(data,organizationId){

  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const payload = {
  "tenantProfileId": data.tenantProfileId,
  "unitId": data.unitId,
  "startDate": data.startDate,
  "endDate": data.endDate,
  "rentAmount": data.rentAmount,
  "billingCycle": data.billingCycle,
  "securityDeposit": data.securityDeposit,
  "renewalDate": data.renewalDate,
  "terms": data.terms
}

  const response = await safeFetch(`https://services.xpacy.com/api/v1/leases?organizationId=${organizationId}
`,{
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
}

export async function updateLease(data,id,organizationId){

  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const payload = {
  "startDate": data.startDate,
  "endDate": data.endDate,
  "rentAmount": data.rentAmount,
  "billingCycle": data.billingCycle,
  "securityDeposit": data.securityDeposit,
  "renewalDate": data.renewalDate,
  "terms": data.terms,
  "status": data.status
}

  const response = await safeFetch(`https://services.xpacy.com/api/v1/leases/${id}

`,{
  method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
}

export async function activateLease(id,organizationId){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/leases/${id}/activate?organizationId=${organizationId}

`,{
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  return response.json(); 
}

export async function terminateLease(id,organizationId){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/leases/${id}/terminate
`,{
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  return response.json(); 
}

/////////////////////////////////////*TENANTS*/////////////////////////////////////////////////


export async function createTenant(data){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/tenants
`,{
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  const json = await response.json();
  return json; 
} 

export async function updateTenant(id,data){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const payload = {
  "firstName": data.firstName,
  "lastName": data.lastName,
  "email": data.email,
  "phone": data.phoneNumber,
  "dateOfBirth": data.dateOfBirth,
  "identification": data.identification,
  "emergencyContact": data.emergencyContact,
  "occupation": data.occupation,
  "employmentInformation": data.employmentInformation
}
  const response = await safeFetch(`https://services.xpacy.com/api/v1/tenants/${id}

`,{
  method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json(); 
} 

export async function linkTenant(id){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/tenants/${id}/link-user`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  return response.json(); 
}

/////////////////////////////////////*TENANTS*/////////////////////////////////////////////////


export async function createMaintenanceRequest(data, propertyId){
  
  const payload = {
  "title": data.title,
  "description": data.description,
  "unitId": data.unitId,
  "buildingId": data.buildingId,
  "priority": data.priority,
  "category": data.category,
  "estimatedCost": data.estimatedCost,
  "scheduledAt": data.scheduledAt
}
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/properties/${propertyId}/maintenance
`,{
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
}

export async function updateMaintenanceRequest(data,id,propertyId){
  
  const payload = {
  "title": data.title,
  "description": data.description,
  "priority": data.priority,
  "status": data.status,
  "assignedTo": data.assignedTo,
  "estimatedCost": data.estimatedCost,
  "actualCost": data.actualCost,
  "scheduledAt": data.scheduledAt,
  "completedAt": data.completedAt
}
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/maintenance/${id}
`,{
  method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
}

export async function assignStaffToMaintenance(id,data,propertyId){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/maintenance/${id}/assign
`,{
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json(); 
}

export async function commentOnMaintenanceRequest(id,data,propertyId){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/maintenance/${id}/comments
`,{
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json(); 
}

/////////////////////////////////////*UNITS*/////////////////////////////////////////////////


export async function createUnit(data,propertyId){
  
  const payload = {
  "unitNumber": data.unitNumber,
  "buildingId": data.buildingId,
  "floor": Number(data.floor),
  "unitType": data.unitType,
  "bedrooms": Number(data.bedrooms),
  "bathrooms": Number(data.bathrooms),
  "squareMeters": Number(data.squareMeters),
  "furnished": data.furnished,
  "monthlyRent": Number(data.monthlyRent),
  "salePrice": Number(data.salePrice),
  "shortletPrice": Number(data.shortletPrice),
  "securityDeposit": Number(data.securityDeposit),
  "description": data.description
}
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/properties/${propertyId}/units
`,{
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
}

export async function updateUnit(id,data){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const payload = {
  "buildingId": data.buildingId,
  "floor": Number(data.floor),
  "unitType": data.unitType,
  "bedrooms": Number(data.bedrooms),
  "bathrooms": Number(data.bathrooms),
  "squareMeters": Number(data.squareMeters),
  "furnished": data.furnished,
  "status": data.status,
  "monthlyRent": Number(data.monthlyRent),
  "salePrice": Number(data.salePrice),
  "shortletPrice": Number(data.shortletPrice),
  "securityDeposit": Number(data.securityDeposit),
  "description": data.description
}
  const response = await safeFetch(`https://services.xpacy.com/api/v1/units/${id}`,
  {
  method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
} 

export async function deleteUnit(id){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${SERVICES_URL}/units/${id}`,
  {
  method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  return response.json(); 
} 

/////////////////////////////////////*BUILDING*/////////////////////////////////////////////////

export async function createBuilding(data,propertyId){
  
  const payload = {
  "name": data.name,
  "description": data.description, 
  "totalFloors": Number(data.totalFloors)
}
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/properties/${propertyId}/buildings`,{
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
} 

export async function updateBuilding(id,data){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const payload = {
  "name": data.name,
  "description": data.description,
  "totalFloors": Number(data.totalFloors)
}
  const response = await safeFetch(`${SERVICES_URL}/buildings/${id}`,
  {
  method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
} 

export async function deleteBuilding(id){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/buildings/${id}`,
  {
  method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  return response.json(); 
} 

/////////////////////////////////////*PROPERTYOWNERS*/////////////////////////////////////////////////

export async function createPropertyOwner(data){
  
  const payload = {
  "firstName": data.firstName,
  "lastName": data.lastName,
  "email": data.email,
  "phone": data.phone,
  "companyName": data.companyName,
  "address": data.address,
  "notes": data.notes
}
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`${SERVICES_URL}/owners`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
} 

export async function updatePropertyOwner(id,data){

  const payload = {
  "firstName": data.firstName,
  "lastName": data.lastName,
  "email": data.email,
  "phone": data.phone,
  "companyName": data.companyName,
  "address": data.address,
  "notes": data.notes
}
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/owners/${id}`,
  {
  method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
} 

export async function deletePropertyOwner(id){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/owners/${id}`,
  {
  method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  return response.json(); 
} 

export async function linkOwnerToUser(id){


  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/owners/${id}/link-user
`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
  });
  return response.json(); 
} 



export async function unlinkOwnerToUser(id, data){

  const payload = {
  "user": {
    "userId": "string"
  },
  "owner": {
    "ownerId": "string"
  }
}
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/owners/${id}/unlink-to-user`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
} 

/////////////////////////////////////*USER MANAGEMENTS*/////////////////////////////////////////////////

export async function updateUser(id,data){

  const payload = {
  "firstName": data.firstName,
  "lastName": data.lastName,
  "email": data.email,
  "phone": data.phone,
  "companyName": data.companyName,
  "address": data.address,
  "notes": data.notes
}

  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/users/${id}`,
  {
  method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
} 

/////////////////////////////////////*ORGANIZATION MANAGEMENTS*/////////////////////////////////////////////////


export async function createOrganization(data){

  const payload = {
  "name": data.name,
  "slug": data.slug,
  "email": data.email,
  "phone": data.phone,
  "address": data.address,
  "city": data.city,
  "state": data.state,
  "country": data.country,
  "timezone": data.timezone,
  "currency": data.currency
}

  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/organizations
`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
}

export async function updateOrganization(id, data){
  const payload = {
  "name": data.name,
  "phone": data.phone,
  "address": data.address,
  "city": data.city,
  "state": data.state,
  "country": data.country,
  "timezone": data.timezone,
  "currency": data.currency,
  "logo": data.logo,
  "settings": data.settings
}

  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/organizations/${id}`,
  {
  method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
}

/////////////////////////////////////*PROPERTY MANAGEMENTS*/////////////////////////////////////////////////


export async function createNewProperty(data){
  const payload = {
  "name": data.name,
  "description": data.description,
  "propertyType": data.propertyType,
  "address": data.address,
  "city": data.city,
  "state": data.state,
  "country": data.country,
  "postalCode": data.postalCode,
  "latitude": data.latitude,
  "longitude": data.longitude,
  "yearBuilt": data.yearBuilt,
  "totalFloors": data.totalFloors,
  "totalUnits": data.totalUnits,
  "organizationId": data.organizationId,
  "owners": data.owners
}
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/properties
`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
}

export async function updateProperty(id,data){
  const payload = {
  "name": data.name,
  "description": data.description,
  "propertyType": data.propertyType,
  "address": data.address,
  "city": data.city,
  "state": data.state,
  "country": data.country,
  "postalCode": data.postalCode,
  "latitude": data.latitude,
  "longitude": data.longitude,
  "status": data.status,
  "yearBuilt": data.yearBuilt,
  "totalFloors": data.totalFloors,
  "totalUnits": data.totalUnits
}

  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/properties/${id}`,
  {
  method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
}

export async function archiveProperty(id){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/properties/${id}`,
  {
  method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
  });
  return response.json(); 
}

export async function addManagerTOProperty(id, data){
  const payload = {
  "userId": data.userId,
  "role": data.role
}

  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/properties/${id}/managers`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json(); 
}

export async function deleteManagerFromProperty(id, managerId){

  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/properties/${id}/managers/${managerId}`,
  {
  method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
  });
  return response.json(); 
}

export async function assignOwnerToProperty(id, data){

  const payload = {
  "ownerProfileId": data.ownerProfileId,
  "ownershipPercentage": data.ownershipPercentage
}

  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/properties/${id}/owners
`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
  });
  return response.json(); 
}



export async function createNotification(data){

  const payload = {
  "channel": data.channel,
  "title": data.title,
  "message": data.message,
  "data": data.data,
  "priority": data.priority,
  "userIds": [data.user_id],
  "broadcast": data.broadcast,
  "scheduledAt": data.scheduledAt,
  "expiresAt": data.expiresAt
}
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/notifications
`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json();
}

export async function sedBroadcast(data){

  const payload ={
  "title": data.title,
  "message": data.message,
  "channel": data.channel,
  "priority": data.priority,
  "data": data.data
}
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/notifications/broadcast
`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return response.json();
}

export async function markNotificationRead(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) return;
  try {
    const response = await safeFetch(`https://services.xpacy.com/api/v1/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token?.value}`,
      }
    });
    const { data } = await response.json();
    revalidatePath("/dashboard/user/notifications");
    return data;
  } catch (error) {
    console.warn("Error marking notification as read:", error);
  }
}


export async function markAllAsRead() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) return [];
  try {
    const response = await safeFetch(`https://services.xpacy.com/api/v1/notifications/read-all`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token?.value}`,
      }
    });
    const { data } = await response.json();
    revalidatePath("/dashboard/user/notifications");
    return data;
  } catch (error) {
    console.warn("Error marking all notifications as read:", error);
  }
}

export async function saveSubscriptionPlan(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = normalizeRole(cookieStore.get("userRole")?.value);
  if (!token || !["admin", "administrator", "superadmin", "superadministrator"].includes(role)) {
    return { success: false, message: "Only an administrator can manage subscription plans." };
  }

  const id = String(formData.get("id") || "").trim();
  const priceValue = String(formData.get("price") || "").trim();
  const isActive = formData.get("isActive") === "on";
  let features;
  try {
    features = JSON.parse(String(formData.get("features") || "{}"));
  } catch {
    return { success: false, message: "Features must be a valid JSON object." };
  }
  if (!features || typeof features !== "object" || Array.isArray(features)) {
    return { success: false, message: "Features must be a JSON object." };
  }

  const payload = {
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim().toLowerCase(),
    description: String(formData.get("description") || "").trim(),
    currency: String(formData.get("currency") || "NGN").trim().toUpperCase(),
    price: priceValue === "" ? null : Number(priceValue),
    interval: String(formData.get("interval") || "MONTHLY").trim().toUpperCase(),
    features,
    maxOrganizations: Number(formData.get("maxOrganizations") || 0),
    maxProperties: Number(formData.get("maxProperties") || 0),
    isActive,
    sortOrder: Number(formData.get("sortOrder") || 0),
  };

  if (!payload.name || !payload.slug) return { success: false, message: "Enter a name and slug for this plan." };
  if (!Number.isFinite(payload.price) || payload.price < 0) {
    return { success: false, message: "Plan price must be a valid non-negative number." };
  }
  if (!Number.isInteger(payload.maxOrganizations) || payload.maxOrganizations < 0 ||
      !Number.isInteger(payload.maxProperties) || payload.maxProperties < 0 ||
      !Number.isInteger(payload.sortOrder) || payload.sortOrder < 0) {
    return { success: false, message: "Limits and sort order must be non-negative whole numbers." };
  }
  if (!["MONTHLY", "YEARLY"].includes(payload.interval)) {
    return { success: false, message: "Choose a valid billing interval." };
  }

  try {
    const endpoint = "https://services.xpacy.com/api/v1/admin/subscription-plans";
    const response = await fetch(id ? `${endpoint}/${encodeURIComponent(id)}` : endpoint, {
      method: id ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.success === false || result?.error) {
      return { success: false, message: result?.message || result?.error || "The subscription plan could not be saved." };
    }
    revalidatePath("/dashboard/admin/subscriptions");
    revalidatePath("/subscriptions");
    return { success: true };
  } catch {
    return { success: false, message: "The subscription service could not be reached. Try again." };
  }
}

export async function searchAdminBlogsBySlug(slug) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = normalizeRole(cookieStore.get("userRole")?.value);
  if (!token || !["admin", "administrator", "superadmin", "superadministrator"].includes(role)) {
    return { success: false, message: "Only an administrator can search blogs." };
  }

  const normalizedSlug = String(slug || "").trim().replace(/^\/+|\/+$/g, "");
  if (!normalizedSlug) return { success: false, message: "Enter a blog slug to search." };

  try {
    const query = new URLSearchParams({ slug: normalizedSlug });
    const response = await safeFetch(`https://services.xpacy.com/api/v1/blogs/s?${query.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.success === false || result?.error) {
      return { success: false, message: result?.message || result?.error || "Could not search blogs by slug." };
    }

    const data = result?.data ?? result?.blog ?? result?.result ?? result;
    const nestedBlogs = data?.blogs ?? data?.items ?? data?.results;
    const blogs = Array.isArray(data) ? data : Array.isArray(nestedBlogs) ? nestedBlogs : data ? [data] : [];
    return { success: true, blogs };
  } catch {
    return { success: false, message: "The blog service could not be reached. Try again." };
  }
}
