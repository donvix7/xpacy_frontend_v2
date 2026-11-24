"use server";
import { safeFetch } from "./safe-fetch";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"
import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminOrganizationMembers, getOrganizationMembers, getAccountSubscriptions } from "./data-services";
import { getOrganizationMemberRole, normalizeOrganizationMembers } from "./organization-members";
import { toDataServiceError } from "./api-error";

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
    let response = await safeFetch(`https://services.xpacy.com/api/v1/admin/organizations/${encodeURIComponent(organizationId)}/members?page=1&limit=100`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      response = await safeFetch(`https://services.xpacy.com/api/v1/organizations/${encodeURIComponent(organizationId)}/members?page=1&limit=100`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      });
    }
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

const extractOrganizationMembers = (payload) =>
  Array.isArray(payload)
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

/**
 * Load the members of an organization and keep the API's failure message.
 * Members are used to resolve the current user's role, so callers need to know
 * whether an empty list means "no members" or "the request failed".
 */
async function getOrganizationMemberList(organizationId) {
  let firstErrorMessage = "";

  try {
    const members = extractOrganizationMembers(await getOrganizationMembers(organizationId));
    if (members.length) return { members, errorMessage: "" };
  } catch (error) {
    firstErrorMessage = toDataServiceError(error, "Unable to load organization members").message;
    }

  // Fall back to the admin-scoped endpoint, which also covers organizations
  // where the standard members endpoint returns nothing.
  try {
    const members = extractOrganizationMembers(await getAdminOrganizationMembers(organizationId));
    if (members.length) return { members, errorMessage: "" };
  } catch (error) {
    if (!firstErrorMessage) {
      firstErrorMessage = toDataServiceError(error, "Unable to load organization members").message;
    }
  }

  return { members: [], errorMessage: firstErrorMessage };
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
  const role = getOrganizationMemberRole(currentMember);
  return typeof role === "string" ? role : "";
}

export async function attachCurrentUserRolesToOrganizations(organizations = []) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userId = cookieStore.get("userId")?.value;
  const email = cookieStore.get("userEmail")?.value;

  return Promise.all(organizations.map(async (organization) => {
    const id = organization?.id || organization?._id || organization?.organizationId || organization?.organization_id;
    if (!id || !token) return { ...organization, id: id ? String(id) : "", organizationRole: "", members: [], membersError: "" };

    const { members, errorMessage } = await getOrganizationMemberList(String(id));
    const organizationRole = getRoleFromMemberList(members, userId, email);
    const displayMembers = normalizeOrganizationMembers(members);

    return { ...organization, id: String(id), organizationRole, members: displayMembers, membersError: errorMessage };
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

    // Validate account subscription before granting organization workspace access
    try {
      const subRaw = await getAccountSubscriptions();
      const subscription = subRaw?.subscription ?? subRaw?.data?.subscription ?? subRaw?.data ?? null;
      const status = String(subscription?.status || "").toUpperCase();
      const isExpired = subscription?.endDate ? new Date(subscription.endDate).getTime() < Date.now() : false;
      const isSubActive = (status === "ACTIVE" || status === "TRIALING") && !isExpired;

      if (!isSubActive) {
        return {
          success: false,
          requiresSubscription: true,
          redirectTo: "/auth/subscriptions",
          message: "An active subscription is required to select and access an organization workspace. Please choose a subscription plan to proceed.",
        };
      }
    } catch (subError) {
      console.warn("Subscription check failed in completeProceedSelection:", subError?.message || subError);
      return {
        success: false,
        requiresSubscription: true,
        redirectTo: "/auth/subscriptions",
        message: "Unable to verify your account's subscription. An active subscription is required to select an organization workspace.",
      };
    }

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

  // Best-effort server-side session invalidation with 2.5s timeout — always clear local cookies regardless of result
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    await safeFetch(`https://services.xpacy.com/api/v1/auth/logout`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token?.value}`,
      },
    }).finally(() => clearTimeout(timeout));
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

export async function createProperty(propertyData, token) {
  return addProperty(propertyData, token);
}

export async function createPropertyNew(propertyData, token) {
  return addProperty(propertyData, token);
}


// Blog Actions
export async function createBlog(input) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const isFormData = typeof input?.get === "function";
        const getVal = (key) => isFormData ? input.get(key) : input?.[key];

        const payload = {
            title: getVal("title") || "",
            slug: getVal("slug") || "",
            excerpt: getVal("excerpt") || "",
            content: getVal("content") || "",
            coverImage: getVal("coverImage") || "",
            status: getVal("status") || "DRAFT",
        };

        if (process.env.NODE_ENV !== "production") {
            console.log("createBlog payload:", payload);
        }

        const response = await safeFetch(
            "https://services.xpacy.com/api/v1/admin/blogs",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        let data;
        try {
            data = await response.json();
        } catch (e) {
            const text = await response.text();
            return { error: `Server returned non-JSON response: ${text}` };
        }

        if (!response.ok) {
            return {
                error: data?.message || data?.error || data?.details || "Failed to create blog post",
            };
        }

        revalidateTag("blogs");
        revalidatePath("/dashboard/admin/blogs");
        revalidatePath("/blog");
        return { success: true, ...data };
    } catch (error) {
        return {
            error:
                error.message ||
                "An unexpected error occurred during creation",
        };
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

export async function createDocument(data) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to create a document.",
        status: 401,
      };
    }

    const cookieOrgId =
      cookieStore.get("organizationId")?.value ||
      cookieStore.get("organization_id")?.value ||
      "";
    const resolvedOrgId = String(
      data?.organizationId || cookieOrgId || ""
    ).trim();

    const fileSize =
      data?.fileSize !== undefined &&
      data?.fileSize !== null &&
      data?.fileSize !== "" &&
      Number.isFinite(Number(data.fileSize))
        ? Number(data.fileSize)
        : 0;

    const ALLOWED_DOCUMENT_TYPES = [
      "PROPERTY_DOCUMENT",
      "LEASE_AGREEMENT",
      "INSPECTION_REPORT",
      "MAINTENANCE_DOCUMENT",
      "COMPLIANCE_DOCUMENT",
      "RECEIPT",
      "IDENTITY_DOCUMENT",
      "OTHER",
    ];
    const normalizedType = String(data?.type || "PROPERTY_DOCUMENT")
      .trim()
      .toUpperCase();
    const docType = ALLOWED_DOCUMENT_TYPES.includes(normalizedType)
      ? normalizedType
      : "PROPERTY_DOCUMENT";

    const payload = {
      name: String(data?.name || "").trim(),
      type: docType,
      url: String(data?.url || "").trim(),
      ...(data?.propertyId?.trim()
        ? { propertyId: data.propertyId.trim() }
        : {}),
      ...(resolvedOrgId ? { organizationId: resolvedOrgId } : {}),
      fileSize,
      ...(data?.mimeType?.trim() ? { mimeType: data.mimeType.trim() } : {}),
    };

    const response = await safeFetch(
      "https://services.xpacy.com/api/v1/documents",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      console.error("createDocument failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to create document (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    revalidatePath("/dashboard/property-owner/documents");
    revalidatePath("/dashboard/property-manager/documents");
    if (payload.propertyId) {
      revalidatePath(
        `/dashboard/property-owner/properties/${payload.propertyId}/documents`
      );
      revalidatePath(
        `/dashboard/property-manager/properties/${payload.propertyId}/documents`
      );
    }

    return {
      success: true,
      data: resData?.data ?? resData?.document ?? resData,
      message: resData?.message || "Document added successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to create document.",
    };
  }
}

export async function deleteDocument(id, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to delete this document.",
        status: 401,
      };
    }

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/documents/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      console.error("deleteDocument failed:", {
        status: response.status,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to delete document (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    revalidatePath("/dashboard/property-owner/documents");
    revalidatePath("/dashboard/property-manager/documents");
    if (propertyId) {
      revalidatePath(
        `/dashboard/property-owner/properties/${propertyId}/documents`
      );
      revalidatePath(
        `/dashboard/property-manager/properties/${propertyId}/documents`
      );
    }

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Document deleted successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to delete document.",
    };
  }
}

export async function createMedia(data) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to add media.",
        status: 401,
      };
    }

    const propertyId = String(data?.propertyId || "").trim();
    const url = String(data?.url || "").trim();

    if (!propertyId) {
      return {
        success: false,
        message: "Property ID is required.",
        status: 400,
      };
    }
    if (!url) {
      return {
        success: false,
        message: "Media URL is required.",
        status: 400,
      };
    }

    const ALLOWED_MEDIA_KINDS = ["IMAGE", "VIDEO", "FLOOR_PLAN", "DOCUMENT"];
    const normalizedKind = String(data?.kind || "IMAGE")
      .trim()
      .toUpperCase();
    const kind = ALLOWED_MEDIA_KINDS.includes(normalizedKind)
      ? normalizedKind
      : "IMAGE";

    const caption = String(data?.caption || "").trim();
    const fileName = String(data?.fileName || "").trim();
    const mimeType = String(data?.mimeType || "").trim();
    const hasFileSize =
      data?.fileSize !== undefined &&
      data?.fileSize !== null &&
      data?.fileSize !== "" &&
      Number.isFinite(Number(data.fileSize)) &&
      Number(data.fileSize) >= 0;
    const sortOrder =
      data?.sortOrder !== undefined &&
      data?.sortOrder !== null &&
      data?.sortOrder !== "" &&
      Number.isFinite(Number(data.sortOrder))
        ? Number(data.sortOrder)
        : 0;

    // CreatePropertyMediaDto
    const payload = {
      propertyId,
      kind,
      url,
      ...(caption ? { caption } : {}),
      ...(fileName ? { fileName } : {}),
      ...(hasFileSize ? { fileSize: Number(data.fileSize) } : {}),
      ...(mimeType ? { mimeType } : {}),
      sortOrder,
    };

    const response = await safeFetch(
      "https://services.xpacy.com/api/v1/property-media",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      console.error("createMedia failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to add media (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    revalidatePath(
      `/dashboard/property-owner/properties/${propertyId}/media`
    );
    revalidatePath(
      `/dashboard/property-manager/properties/${propertyId}/media`
    );

    return {
      success: true,
      data: resData?.data ?? resData?.media ?? resData,
      message: resData?.message || "Media added successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to add media.",
    };
  }
}

export async function updateMedia(id, data, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to update this media item.",
        status: 401,
      };
    }

    const ALLOWED_MEDIA_KINDS = ["IMAGE", "VIDEO", "FLOOR_PLAN", "DOCUMENT"];
    const normalizedKind = String(data?.kind || "")
      .trim()
      .toUpperCase();
    const caption = String(data?.caption || "").trim();
    const fileName = String(data?.fileName || "").trim();
    const mimeType = String(data?.mimeType || "").trim();
    const url = String(data?.url || "").trim();
    const hasFileSize =
      data?.fileSize !== undefined &&
      data?.fileSize !== null &&
      data?.fileSize !== "" &&
      Number.isFinite(Number(data.fileSize)) &&
      Number(data.fileSize) >= 0;
    const hasSortOrder =
      data?.sortOrder !== undefined &&
      data?.sortOrder !== null &&
      data?.sortOrder !== "" &&
      Number.isFinite(Number(data.sortOrder));

    const resolvedPropertyId = String(
      data?.propertyId || propertyId || ""
    ).trim();

    const payload = {
      ...(ALLOWED_MEDIA_KINDS.includes(normalizedKind)
        ? { kind: normalizedKind }
        : {}),
      ...(url ? { url } : {}),
      ...(caption ? { caption } : {}),
      ...(fileName ? { fileName } : {}),
      ...(hasFileSize ? { fileSize: Number(data.fileSize) } : {}),
      ...(mimeType ? { mimeType } : {}),
      ...(hasSortOrder ? { sortOrder: Number(data.sortOrder) } : {}),
    };

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/property-media/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      console.error("updateMedia failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to update media (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (resolvedPropertyId) {
      revalidatePath(
        `/dashboard/property-owner/properties/${resolvedPropertyId}/media`
      );
      revalidatePath(
        `/dashboard/property-owner/properties/${resolvedPropertyId}/media/${id}`
      );
      revalidatePath(
        `/dashboard/property-manager/properties/${resolvedPropertyId}/media`
      );
      revalidatePath(
        `/dashboard/property-manager/properties/${resolvedPropertyId}/media/${id}`
      );
    }

    return {
      success: true,
      data: resData?.data ?? resData?.media ?? resData,
      message: resData?.message || "Media updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to update media.",
    };
  }
}

export async function deleteMedia(id, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to delete this media item.",
        status: 401,
      };
    }

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/property-media/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({}),
      }
    );
    console.log(response)

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to delete media (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(
        `/dashboard/property-owner/properties/${propertyId}/media`
      );
      revalidatePath(
        `/dashboard/property-manager/properties/${propertyId}/media`
      );
    }

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Media deleted successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to delete media.",
    };
  }
}

/////////////////////////////////////*PROPERTIES*/////////////////////////////////////////////////


export async function addProperty(propertyData) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    const cookieOrgId =
      cookieStore.get("organizationId")?.value ||
      cookieStore.get("organization_id")?.value ||
      "";
    const resolvedOrgId = String(propertyData?.organizationId || cookieOrgId || "").trim();

    if (!resolvedOrgId) {
      return {
        success: false,
        message: "Organization ID is required. Please select an organization.",
        error: "Organization ID is required.",
        status: 400,
      };
    }

    // CreatePropertyDto expects owners: [string] (array of owner IDs)
    const ownersPayload = Array.isArray(propertyData?.owners)
      ? propertyData.owners
          .map((o) => {
            if (typeof o === "string") return o.trim();
            if (o && typeof o === "object") {
              return String(o.id || o._id || o.ownerId || o.userId || "").trim();
            }
            return "";
          })
          .filter(Boolean)
      : typeof propertyData?.owners === "string" && propertyData.owners.trim()
      ? [propertyData.owners.trim()]
      : [];

    const description = String(propertyData?.description || "").trim();
    const postalCode = String(propertyData?.postalCode || "").trim();
    const hasLat =
      propertyData?.latitude !== undefined &&
      propertyData?.latitude !== null &&
      propertyData?.latitude !== "" &&
      Number.isFinite(Number(propertyData.latitude));
    const hasLng =
      propertyData?.longitude !== undefined &&
      propertyData?.longitude !== null &&
      propertyData?.longitude !== "" &&
      Number.isFinite(Number(propertyData.longitude));

    if (hasLat) {
      const lat = Number(propertyData.latitude);
      if (lat < -90 || lat > 90) {
        return {
          success: false,
          message: "Latitude must be between -90 and 90.",
          error: "Latitude must be between -90 and 90.",
          status: 400,
        };
      }
    }
    if (hasLng) {
      const lng = Number(propertyData.longitude);
      if (lng < -180 || lng > 180) {
        return {
          success: false,
          message: "Longitude must be between -180 and 180.",
          error: "Longitude must be between -180 and 180.",
          status: 400,
        };
      }
    }
    const yearBuilt = Number(propertyData?.yearBuilt);
    const totalFloors = Number(propertyData?.totalFloors);
    const totalUnits = Number(propertyData?.totalUnits);

    const payload = {
      name: String(propertyData?.name || "").trim(),
      propertyType: propertyData?.propertyType || "RESIDENTIAL",
      address: String(propertyData?.address || "").trim(),
      city: String(propertyData?.city || "").trim(),
      state: String(propertyData?.state || "").trim(),
      country: String(propertyData?.country || "Nigeria").trim(),
      organizationId: resolvedOrgId,
      ...(description ? { description } : {}),
      ...(postalCode ? { postalCode } : {}),
      ...(hasLat ? { latitude: Number(propertyData.latitude) } : {}),
      ...(hasLng ? { longitude: Number(propertyData.longitude) } : {}),
      ...(Number.isFinite(yearBuilt) && yearBuilt > 0 ? { yearBuilt } : {}),
      ...(Number.isFinite(totalFloors) && totalFloors > 0 ? { totalFloors } : {}),
      ...(Number.isFinite(totalUnits) && totalUnits > 0 ? { totalUnits } : {}),
    };
    console.log("addProperty payload:", payload);

    const response = await safeFetch(`https://services.xpacy.com/api/v1/properties`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenVal}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    let resData;
    try {
      resData = await response.json();
    } catch (_) {
      resData = { message: response.statusText };
    }
    console.log("addProperty response:", resData);
    

    if (!response.ok) {
      const detailedErrors = Array.isArray(resData?.errors)
        ? resData.errors
            .map((e) =>
              typeof e === "string"
                ? e
                : [e?.field || e?.property, e?.message].filter(Boolean).join(": ")
            )
            .filter(Boolean)
            .join(", ")
        : "";
      const errorMessage =
        detailedErrors ||
        (Array.isArray(resData?.message)
          ? resData.message.join(", ")
          : resData?.message || resData?.error || `Failed to create property (${response.status})`);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
        status: response.status,
      };
    }

    const createdProperty = resData?.data || resData;
    const createdPropertyId = String(
      createdProperty?.id || createdProperty?._id || ""
    ).trim();

    // Assign selected owners via POST /api/v1/properties/:id/owners
    let failedOwnerAssignments = 0;
    if (createdPropertyId && ownersPayload.length > 0) {
      const basePct = Math.floor(100 / ownersPayload.length);
      const remainder = 100 - basePct * ownersPayload.length;

      for (let i = 0; i < ownersPayload.length; i++) {
        const ownerProfileId = ownersPayload[i];
        const ownershipPercentage = basePct + (i === 0 ? remainder : 0);
        try {
          const assignRes = await safeFetch(
            `https://services.xpacy.com/api/v1/properties/${encodeURIComponent(createdPropertyId)}/owners`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${tokenVal}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                ownerProfileId,
                ownershipPercentage,
              }),
            }
          );
          if (!assignRes.ok) {
            failedOwnerAssignments += 1;
            const errText = await assignRes.text().catch(() => "");
            console.warn("addProperty owner assignment failed:", {
              propertyId: createdPropertyId,
              ownerProfileId,
              status: assignRes.status,
              body: errText,
            });
          }
        } catch (assignErr) {
          failedOwnerAssignments += 1;
          console.warn("addProperty owner assignment error:", assignErr);
        }
      }
    }

    revalidatePath("/dashboard/property-owner/properties");
    revalidatePath("/dashboard/property-manager/properties");

    return {
      success: true,
      data: createdProperty,
      message:
        failedOwnerAssignments > 0
          ? `Property created, but ${failedOwnerAssignments} owner assignment(s) could not be completed. You can assign owners from the property page.`
          : resData?.message || "Property created successfully!",
    };
  } catch (error) {
    console.warn("addProperty error:", error);
    return {
      success: false,
      message: error?.message || "Failed to create property. Please try again.",
    };
  }
}

export async function addOwner(payload, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to create an owner profile.",
        status: 401,
      };
    }

    const cookieOrgId =
      cookieStore.get("organizationId")?.value ||
      cookieStore.get("organization_id")?.value ||
      "";
    const resolvedOrgId = String(
      payload?.organizationId || cookieOrgId || ""
    ).trim();

    if (!resolvedOrgId) {
      return {
        success: false,
        message: "Organization ID is required to create an owner profile.",
        status: 400,
      };
    }

    const body = {
      organizationId: resolvedOrgId,
      firstName: String(payload?.firstName || "").trim(),
      lastName: String(payload?.lastName || "").trim(),
      email: String(payload?.email || "").trim(),
      ...(payload?.phone?.trim() ? { phone: payload.phone.trim() } : {}),
      ...(payload?.address?.trim() ? { address: payload.address.trim() } : {}),
      ...(payload?.companyName?.trim()
        ? { companyName: payload.companyName.trim() }
        : {}),
      ...(payload?.notes?.trim() ? { notes: payload.notes.trim() } : {}),
    };

    const response = await safeFetch("https://services.xpacy.com/api/v1/owners", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenVal}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      console.error("addOwner failed:", {
        status: response.status,
        body,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to create owner profile (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    revalidatePath("/dashboard/admin/users");
    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
      revalidatePath(`/dashboard/property-manager/properties/${propertyId}`);
    }

    return {
      success: true,
      data: resData?.data ?? resData?.owner ?? resData,
      message: resData?.message || "Owner profile created successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to create owner profile.",
    };
  }
}

/////////////////////////////////////*EXPENSES*/////////////////////////////////////////////////

export async function createExpense(data, organizationId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to create an expense.",
        status: 401,
      };
    }

    const cookieOrgId =
      cookieStore.get("organizationId")?.value ||
      cookieStore.get("organization_id")?.value ||
      "";
    const resolvedOrgId = String(
      organizationId || data?.organizationId || cookieOrgId || ""
    ).trim();

    const ALLOWED_EXPENSE_CATEGORIES = [
      "REPAIRS",
      "ELECTRICITY",
      "WATER",
      "SECURITY",
      "CLEANING",
      "STAFF",
      "MAINTENANCE",
      "UTILITIES",
      "PROPERTY_TAX",
      "INSURANCE",
      "OTHER",
    ];

    const propertyId = String(data?.propertyId || "").trim();
    if (!propertyId) {
      return {
        success: false,
        message: "Please select a property for this expense.",
        status: 400,
      };
    }

    const normalizedCategory = String(data?.category || "OTHER")
      .trim()
      .toUpperCase();
    const category = ALLOWED_EXPENSE_CATEGORIES.includes(normalizedCategory)
      ? normalizedCategory
      : "OTHER";

    const payload = {
      propertyId,
      ...(data?.buildingId?.trim()
        ? { buildingId: data.buildingId.trim() }
        : {}),
      ...(data?.unitId?.trim() ? { unitId: data.unitId.trim() } : {}),
      category,
      ...(data?.vendor?.trim() ? { vendor: data.vendor.trim() } : {}),
      amount: Number(data?.amount ?? 0),
      currency: String(data?.currency || "NGN").trim().toUpperCase(),
      date: data?.date || new Date().toISOString(),
      ...(data?.description?.trim()
        ? { description: data.description.trim() }
        : {}),
      ...(data?.receipt?.trim() ? { receipt: data.receipt.trim() } : {}),
    };

    const query = resolvedOrgId
      ? `?organizationId=${encodeURIComponent(resolvedOrgId)}`
      : "";

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/expenses${query}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      console.error("createExpense failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to create expense (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    revalidatePath("/dashboard/property-owner/expenses");
    revalidatePath("/dashboard/property-manager/expenses");

    return {
      success: true,
      data: resData?.data ?? resData?.expense ?? resData,
      message: resData?.message || "Expense recorded successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to create expense.",
    };
  }
}

export async function updateExpense(id, data, organizationId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to update this expense.",
        status: 401,
      };
    }

    const payload = {
      ...(data?.category ? { category: String(data.category).trim() } : {}),
      ...(data?.vendor?.trim() ? { vendor: data.vendor.trim() } : {}),
      ...(data?.amount !== undefined && data?.amount !== "" && data?.amount !== null
        ? { amount: Number(data.amount) }
        : {}),
      ...(data?.date ? { date: data.date } : {}),
      ...(data?.description?.trim()
        ? { description: data.description.trim() }
        : {}),
      ...(data?.receipt?.trim() ? { receipt: data.receipt.trim() } : {}),
    };

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/expenses/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      console.error("updateExpense failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to update expense (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    revalidatePath("/dashboard/property-owner/expenses");
    revalidatePath(`/dashboard/property-owner/expenses/${id}`);
    revalidatePath("/dashboard/property-manager/expenses");
    revalidatePath(`/dashboard/property-manager/expenses/${id}`);

    return {
      success: true,
      data: resData?.data ?? resData?.expense ?? resData,
      message: resData?.message || "Expense updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to update expense.",
    };
  }
}



/////////////////////////////////////*LEASES*/////////////////////////////////////////////////

export async function createLease(data, organizationId = null, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to create a lease.",
        status: 401,
      };
    }

    const cookieOrgId =
      cookieStore.get("organizationId")?.value ||
      cookieStore.get("organization_id")?.value ||
      "";
    const resolvedOrgId = String(
      organizationId || data?.organizationId || cookieOrgId || ""
    ).trim();

    const tenantProfileId = String(data?.tenantProfileId || "").trim();
    const unitId = String(data?.unitId || "").trim();

    if (!tenantProfileId || !unitId) {
      return {
        success: false,
        message: !unitId
          ? "Please select a unit for this lease."
          : "Please select a tenant for this lease.",
        status: 400,
      };
    }

    const ALLOWED_BILLING_CYCLES = ["MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"];
    const normalizedCycle = String(data?.billingCycle || "MONTHLY").toUpperCase();
    const billingCycle = ALLOWED_BILLING_CYCLES.includes(normalizedCycle)
      ? normalizedCycle
      : "MONTHLY";

    const payload = {
      tenantProfileId,
      unitId,
      startDate: data.startDate,
      endDate: data.endDate,
      rentAmount: Number(data.rentAmount),
      billingCycle,
      securityDeposit:
        data.securityDeposit !== "" && data.securityDeposit != null
          ? Number(data.securityDeposit)
          : 0,
      ...(data.renewalDate ? { renewalDate: data.renewalDate } : {}),
      ...(data.terms?.trim() ? { terms: data.terms.trim() } : {}),
    };

    const query = resolvedOrgId
      ? `?organizationId=${encodeURIComponent(resolvedOrgId)}`
      : "";

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/properties/${propertyId}/leases`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }
    console.log(response)

    if (!response.ok) {
      console.error("createLease failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to create lease (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}/leases`);
    }
    revalidatePath("/dashboard/property-manager/leases");

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Lease created successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to create lease.",
    };
  }
}

export async function updateLease(data, id, organizationId = null, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to update this lease.",
        status: 401,
      };
    }

    const payload = {
      ...(data.startDate ? { startDate: data.startDate } : {}),
      ...(data.endDate ? { endDate: data.endDate } : {}),
      ...(data.rentAmount !== "" && data.rentAmount != null
        ? { rentAmount: Number(data.rentAmount) }
        : {}),
      ...(data.billingCycle ? { billingCycle: data.billingCycle } : {}),
      ...(data.securityDeposit !== "" && data.securityDeposit != null
        ? { securityDeposit: Number(data.securityDeposit) }
        : {}),
      ...(data.renewalDate ? { renewalDate: data.renewalDate } : {}),
      ...(data.terms?.trim() ? { terms: data.terms.trim() } : {}),
      ...(data.status ? { status: data.status } : {}),
    };

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/leases/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      console.error("updateLease failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to update lease (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}/leases`);
      revalidatePath(
        `/dashboard/property-owner/properties/${propertyId}/leases/${id}`
      );
    }
    revalidatePath("/dashboard/property-manager/leases");

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Lease updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to update lease.",
    };
  }
}

export async function activateLease(id, organizationId = null, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const cookieOrgId =
      cookieStore.get("organizationId")?.value ||
      cookieStore.get("organization_id")?.value ||
      "";
    const resolvedOrgId = String(organizationId || cookieOrgId || "").trim();
    const query = resolvedOrgId
      ? `?organizationId=${encodeURIComponent(resolvedOrgId)}`
      : "";

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/leases/${encodeURIComponent(id)}/activate${query}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      return {
        success: false,
        message: Array.isArray(resData?.message)
          ? resData.message.join(", ")
          : resData?.message || `Failed to activate lease (${response.status}).`,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}/leases`);
      revalidatePath(
        `/dashboard/property-owner/properties/${propertyId}/leases/${id}`
      );
    }

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Lease activated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to activate lease.",
    };
  }
}

export async function terminateLease(id, organizationId = null, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/leases/${encodeURIComponent(id)}/terminate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      return {
        success: false,
        message: Array.isArray(resData?.message)
          ? resData.message.join(", ")
          : resData?.message || `Failed to terminate lease (${response.status}).`,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}/leases`);
      revalidatePath(
        `/dashboard/property-owner/properties/${propertyId}/leases/${id}`
      );
    }

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Lease terminated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to terminate lease.",
    };
  }
}

/////////////////////////////////////*TENANTS*/////////////////////////////////////////////////


export async function createTenant(data){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/tenants`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }
  if (response.ok) {
    revalidatePath("/dashboard/property-owner/tenants");
    revalidatePath("/dashboard/property-manager/tenants");
  }
  return json ?? { success: response.ok, message: response.ok ? "Tenant created." : "Failed to create tenant." };
} 

function pruneEmptyFields(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      const nested = pruneEmptyFields(value);
      if (nested && Object.keys(nested).length > 0) {
        cleaned[key] = nested;
      }
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export async function updateTenant(id, data){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const identification = pruneEmptyFields(data.identification);
  const emergencyContact = pruneEmptyFields(data.emergencyContact);
  const employmentInformation = pruneEmptyFields(data.employmentInformation);

  const payload = pruneEmptyFields({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || data.phoneNumber,
    dateOfBirth: data.dateOfBirth,
    identification:
      identification && Object.keys(identification).length > 0
        ? identification
        : undefined,
    emergencyContact:
      emergencyContact && Object.keys(emergencyContact).length > 0
        ? emergencyContact
        : undefined,
    occupation: data.occupation,
    employmentInformation:
      employmentInformation && Object.keys(employmentInformation).length > 0
        ? employmentInformation
        : undefined,
  });

  try {
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/tenants/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token?.value}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    let json = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (!response.ok) {
      console.error("updateTenant failed:", {
        status: response.status,
        payload,
        json,
      });
      const errorMessage = Array.isArray(json?.message)
        ? json.message.join(", ")
        : json?.message ||
          json?.errors?.[0]?.message ||
          `Failed to update tenant (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        data: json,
      };
    }

    revalidatePath("/dashboard/property-owner/tenants");
    revalidatePath(`/dashboard/property-owner/tenants/${id}`);
    revalidatePath("/dashboard/property-manager/tenants");
    revalidatePath(`/dashboard/property-manager/tenants/${id}`);

    if (json && typeof json === "object" && "success" in json) {
      return json;
    }
    return { success: true, data: json?.data ?? json };
  } catch (err) {
    return {
      success: false,
      message: err?.message || "Network error while updating tenant.",
    };
  }
} 

export async function linkTenant(id, data = null){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const hasBody =
    data &&
    typeof data === "object" &&
    Object.values(data).some((v) => v !== undefined && v !== null && v !== "");

  try {
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/tenants/${encodeURIComponent(id)}/link-user`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token?.value}`,
          "Content-Type": "application/json",
        },
        ...(hasBody ? { body: JSON.stringify(data) } : {}),
      }
    );

    let json = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (!response.ok) {
      return {
        success: false,
        message:
          json?.message ||
          json?.errors?.[0]?.message ||
          `Failed to link tenant to user (${response.status}).`,
        data: json,
      };
    }

    revalidatePath("/dashboard/property-owner/tenants");
    revalidatePath(`/dashboard/property-owner/tenants/${id}`);
    revalidatePath("/dashboard/property-manager/tenants");
    revalidatePath(`/dashboard/property-manager/tenants/${id}`);

    if (json && typeof json === "object" && "success" in json) {
      return json;
    }
    return {
      success: true,
      message: json?.message || "Tenant linked to user account successfully.",
      data: json?.data ?? json,
    };
  } catch (err) {
    return {
      success: false,
      message: err?.message || "Network error while linking tenant to user.",
    };
  }
}

/////////////////////////////////////*MAINTENANCE*/////////////////////////////////////////////////

export async function createMaintenanceRequest(data, propertyId) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to create a maintenance request.",
        status: 401,
      };
    }

    if (!propertyId) {
      return {
        success: false,
        message: "Property ID is required to create a maintenance request.",
        status: 400,
      };
    }

    const estimatedCost =
      data?.estimatedCost !== undefined &&
      data?.estimatedCost !== null &&
      data?.estimatedCost !== "" &&
      Number.isFinite(Number(data.estimatedCost))
        ? Number(data.estimatedCost)
        : undefined;

    const payload = {
      title: String(data?.title || "").trim(),
      ...(data?.description?.trim()
        ? { description: data.description.trim() }
        : {}),
      ...(data?.unitId?.trim() ? { unitId: data.unitId.trim() } : {}),
      ...(data?.buildingId?.trim()
        ? { buildingId: data.buildingId.trim() }
        : {}),
      ...(data?.priority ? { priority: String(data.priority).toUpperCase() } : {}),
      ...(data?.category ? { category: String(data.category).trim() } : {}),
      ...(estimatedCost !== undefined ? { estimatedCost } : {}),
      ...(data?.scheduledAt ? { scheduledAt: data.scheduledAt } : {}),
    };

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/properties/${encodeURIComponent(propertyId)}/maintenance`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      console.error("createMaintenanceRequest failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to create maintenance request (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
    revalidatePath(`/dashboard/property-manager/properties/${propertyId}`);
    revalidatePath("/dashboard/admin/maintenance");

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Maintenance request created successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to create maintenance request.",
    };
  }
}

export async function updateMaintenanceRequest(data, id, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to update this maintenance request.",
        status: 401,
      };
    }

    const numOrUndef = (v) =>
      v !== undefined && v !== null && v !== "" && Number.isFinite(Number(v))
        ? Number(v)
        : undefined;

    const estimatedCost = numOrUndef(data?.estimatedCost);
    const actualCost = numOrUndef(data?.actualCost);

    const ALLOWED_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const ALLOWED_STATUSES = [
      "OPEN",
      "ASSIGNED",
      "IN_PROGRESS",
      "ON_HOLD",
      "RESOLVED",
      "CLOSED",
      "CANCELLED",
    ];

    const normalizedPriority = data?.priority
      ? String(data.priority).toUpperCase()
      : undefined;
    const normalizedStatus = data?.status
      ? String(data.status).toUpperCase()
      : undefined;

    const payload = {
      ...(data?.title?.trim() ? { title: data.title.trim() } : {}),
      ...(data?.description?.trim()
        ? { description: data.description.trim() }
        : {}),
      ...(normalizedPriority && ALLOWED_PRIORITIES.includes(normalizedPriority)
        ? { priority: normalizedPriority }
        : {}),
      ...(normalizedStatus && ALLOWED_STATUSES.includes(normalizedStatus)
        ? { status: normalizedStatus }
        : {}),
      ...(data?.assignedTo?.trim()
        ? { assignedTo: data.assignedTo.trim() }
        : {}),
      ...(estimatedCost !== undefined ? { estimatedCost } : {}),
      ...(actualCost !== undefined ? { actualCost } : {}),
      ...(data?.scheduledAt ? { scheduledAt: data.scheduledAt } : {}),
      ...(data?.completedAt ? { completedAt: data.completedAt } : {}),
    };

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/maintenance/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      console.error("updateMaintenanceRequest failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to update maintenance request (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
      revalidatePath(
        `/dashboard/property-owner/properties/${propertyId}/maintenance/${id}`
      );
      revalidatePath(`/dashboard/property-manager/properties/${propertyId}`);
      revalidatePath(
        `/dashboard/property-manager/properties/${propertyId}/maintenance/${id}`
      );
    }
    revalidatePath(`/dashboard/admin/maintenance/${id}`);

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Maintenance request updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to update maintenance request.",
    };
  }
}

export async function assignStaffToMaintenance(id, data, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to assign staff.",
        status: 401,
      };
    }

    const assignedTo = String(
      data?.assignedTo || data?.staffId || data?.userId || ""
    ).trim();

    if (!assignedTo) {
      return {
        success: false,
        message: "Please select a staff member to assign.",
        status: 400,
      };
    }

    const payload = { assignedTo };

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/maintenance/${encodeURIComponent(id)}/assign`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      console.error("assignStaffToMaintenance failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to assign staff (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
      revalidatePath(
        `/dashboard/property-owner/properties/${propertyId}/maintenance/${id}`
      );
      revalidatePath(`/dashboard/property-manager/properties/${propertyId}`);
      revalidatePath(
        `/dashboard/property-manager/properties/${propertyId}/maintenance/${id}`
      );
    }
    revalidatePath(`/dashboard/admin/maintenance/${id}`);

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Staff assigned successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to assign staff.",
    };
  }
}

export async function commentOnMaintenanceRequest(id, data, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to add a comment.",
        status: 401,
      };
    }

    const content = String(
      data?.content || data?.comment || data?.message || ""
    ).trim();

    if (!content) {
      return {
        success: false,
        message: "Comment cannot be empty.",
        status: 400,
      };
    }

    const payload = { content };

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/maintenance/${encodeURIComponent(id)}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      console.error("commentOnMaintenanceRequest failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to add comment (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(
        `/dashboard/property-owner/properties/${propertyId}/maintenance/${id}`
      );
      revalidatePath(
        `/dashboard/property-manager/properties/${propertyId}/maintenance/${id}`
      );
    }
    revalidatePath(`/dashboard/admin/maintenance/${id}`);

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Comment added!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to add comment.",
    };
  }
}

/////////////////////////////////////*UNITS*/////////////////////////////////////////////////


export async function createUnit(data, propertyId) {
  try {
    if (!propertyId) {
      return {
        success: false,
        message: "Property ID is required to create a unit.",
      };
    }

    const numOrUndef = (v) =>
      v !== undefined && v !== null && v !== "" && Number.isFinite(Number(v))
        ? Number(v)
        : undefined;

    const floor = numOrUndef(data?.floor);
    const bedrooms = numOrUndef(data?.bedrooms);
    const bathrooms = numOrUndef(data?.bathrooms);
    const squareMeters = numOrUndef(data?.squareMeters);
    const monthlyRent = numOrUndef(data?.monthlyRent);
    const salePrice = numOrUndef(data?.salePrice);
    const shortletPrice = numOrUndef(data?.shortletPrice);
    const securityDeposit = numOrUndef(data?.securityDeposit);
    const buildingId = String(data?.buildingId || "").trim();
    const description = String(data?.description || "").trim();

    const payload = {
      unitNumber: String(data?.unitNumber || "").trim(),
      unitType: data?.unitType || "APARTMENT",
      furnished: Boolean(data?.furnished),
      ...(buildingId ? { buildingId } : {}),
      ...(floor !== undefined ? { floor } : {}),
      ...(bedrooms !== undefined ? { bedrooms } : {}),
      ...(bathrooms !== undefined ? { bathrooms } : {}),
      ...(squareMeters !== undefined ? { squareMeters } : {}),
      ...(monthlyRent !== undefined ? { monthlyRent } : {}),
      ...(salePrice !== undefined ? { salePrice } : {}),
      ...(shortletPrice !== undefined ? { shortletPrice } : {}),
      ...(securityDeposit !== undefined ? { securityDeposit } : {}),
      ...(description ? { description } : {}),
    };

    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/properties/${encodeURIComponent(propertyId)}/units`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      const detailedErrors = Array.isArray(resData?.errors)
        ? resData.errors
            .map((e) =>
              typeof e === "string"
                ? e
                : [e?.field || e?.property, e?.message].filter(Boolean).join(": ")
            )
            .filter(Boolean)
            .join(", ")
        : "";
      const errorMessage =
        detailedErrors ||
        (Array.isArray(resData?.message)
          ? resData.message.join(", ")
          : resData?.message ||
            resData?.error ||
            `Failed to create unit (${response.status}).`);
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
    revalidatePath(`/dashboard/property-owner/properties/${propertyId}/units`);
    if (buildingId) {
      revalidatePath(
        `/dashboard/property-owner/properties/${propertyId}/buildings/${buildingId}`
      );
    }

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Unit created successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to create unit.",
    };
  }
}

export async function updateUnit(id, data, propertyId = null) {
  try {
    const numOrUndef = (v) =>
      v !== undefined && v !== null && v !== "" && Number.isFinite(Number(v))
        ? Number(v)
        : undefined;

    const floor = numOrUndef(data?.floor);
    const bedrooms = numOrUndef(data?.bedrooms);
    const bathrooms = numOrUndef(data?.bathrooms);
    const squareMeters = numOrUndef(data?.squareMeters);
    const monthlyRent = numOrUndef(data?.monthlyRent);
    const salePrice = numOrUndef(data?.salePrice);
    const shortletPrice = numOrUndef(data?.shortletPrice);
    const securityDeposit = numOrUndef(data?.securityDeposit);
    const buildingId = String(data?.buildingId || "").trim();

    const payload = {
      ...(buildingId ? { buildingId } : {}),
      ...(floor !== undefined ? { floor } : {}),
      ...(data?.unitType ? { unitType: data.unitType } : {}),
      ...(bedrooms !== undefined ? { bedrooms } : {}),
      ...(bathrooms !== undefined ? { bathrooms } : {}),
      ...(squareMeters !== undefined ? { squareMeters } : {}),
      ...(data?.furnished !== undefined ? { furnished: Boolean(data.furnished) } : {}),
      ...(data?.status ? { status: data.status } : {}),
      ...(monthlyRent !== undefined ? { monthlyRent } : {}),
      ...(salePrice !== undefined ? { salePrice } : {}),
      ...(shortletPrice !== undefined ? { shortletPrice } : {}),
      ...(securityDeposit !== undefined ? { securityDeposit } : {}),
      ...(data?.description?.trim()
        ? { description: String(data.description).trim() }
        : {}),
    };

    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/units/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }
    if (!response.ok) {
      console.error("updateUnit failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to update unit (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}/units`);
      revalidatePath(
        `/dashboard/property-owner/properties/${propertyId}/units/${id}`
      );
    }

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Unit updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to update unit.",
    };
  }
}

export async function deleteUnit(id, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/units/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({})
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to delete unit (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}/units`);
    }

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Unit deleted successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to delete unit.",
    };
  }
} 

/////////////////////////////////////*BUILDING*/////////////////////////////////////////////////

export async function createBuilding(data, propertyId) {
  try {
    if (!propertyId) {
      return {
        success: false,
        message: "Property ID is required to create a building.",
      };
    }

    const totalFloors = Number(data?.totalFloors);
    const payload = {
      name: String(data?.name || "").trim(),
      ...(data?.description ? { description: String(data.description).trim() } : {}),
      ...(Number.isFinite(totalFloors) && totalFloors > 0 ? { totalFloors } : {}),
    };

    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/properties/${encodeURIComponent(propertyId)}/buildings`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to create building (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
    revalidatePath(`/dashboard/property-owner/properties/${propertyId}/buildings`);
    revalidatePath(`/dashboard/property-manager/properties/${propertyId}`);
    revalidatePath(`/dashboard/admin/properties/${propertyId}`);

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Building created successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to create building.",
    };
  }
} 

export async function updateBuilding(id, data, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const totalFloors = Number(data?.totalFloors);
    const payload = {
      ...(data?.name ? { name: String(data.name).trim() } : {}),
      ...(data?.description !== undefined
        ? { description: String(data.description).trim() }
        : {}),
      ...(Number.isFinite(totalFloors) && totalFloors >= 0 ? { totalFloors } : {}),
    };

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/buildings/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to update building (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}/buildings`);
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}/buildings/${id}`);
    }

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Building updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to update building.",
    };
  }
}

export async function deleteBuilding(id, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/buildings/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({})
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to delete building (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}/buildings`);
    }

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Building deleted successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to delete building.",
    };
  }
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


export async function createNewProperty(data, token){
  return addProperty(data, token);
}

export async function updateProperty(id, data) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    const hasLat =
      data?.latitude !== undefined &&
      data?.latitude !== null &&
      data?.latitude !== "" &&
      Number.isFinite(Number(data.latitude));
    const hasLng =
      data?.longitude !== undefined &&
      data?.longitude !== null &&
      data?.longitude !== "" &&
      Number.isFinite(Number(data.longitude));

    if (hasLat) {
      const lat = Number(data.latitude);
      if (lat < -90 || lat > 90) {
        return {
          success: false,
          message: "Latitude must be between -90 and 90.",
          error: "Latitude must be between -90 and 90.",
          status: 400,
        };
      }
    }
    if (hasLng) {
      const lng = Number(data.longitude);
      if (lng < -180 || lng > 180) {
        return {
          success: false,
          message: "Longitude must be between -180 and 180.",
          error: "Longitude must be between -180 and 180.",
          status: 400,
        };
      }
    }

    const description = String(data?.description || "").trim();
    const postalCode = String(data?.postalCode || "").trim();
    const yearBuilt = Number(data?.yearBuilt);
    const totalFloors = Number(data?.totalFloors);
    const totalUnits = Number(data?.totalUnits);

    const payload = {
      ...(data?.name ? { name: String(data.name).trim() } : {}),
      ...(description ? { description } : {}),
      ...(data?.propertyType ? { propertyType: data.propertyType } : {}),
      ...(data?.address ? { address: String(data.address).trim() } : {}),
      ...(data?.city ? { city: String(data.city).trim() } : {}),
      ...(data?.state ? { state: String(data.state).trim() } : {}),
      ...(data?.country ? { country: String(data.country).trim() } : {}),
      ...(postalCode ? { postalCode } : {}),
      ...(hasLat ? { latitude: Number(data.latitude) } : {}),
      ...(hasLng ? { longitude: Number(data.longitude) } : {}),
      ...(data?.status ? { status: data.status } : {}),
      ...(Number.isFinite(yearBuilt) && yearBuilt > 0 ? { yearBuilt } : {}),
      ...(Number.isFinite(totalFloors) && totalFloors > 0 ? { totalFloors } : {}),
      ...(Number.isFinite(totalUnits) && totalUnits > 0 ? { totalUnits } : {}),
    };

    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/properties/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      const detailedErrors = Array.isArray(resData?.errors)
        ? resData.errors
            .map((e) =>
              typeof e === "string"
                ? e
                : [e?.field || e?.property, e?.message].filter(Boolean).join(": ")
            )
            .filter(Boolean)
            .join(", ")
        : "";
      const errorMessage =
        detailedErrors ||
        (Array.isArray(resData?.message)
          ? resData.message.join(", ")
          : resData?.message || resData?.error || `Failed to update property (${response.status})`);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
        status: response.status,
      };
    }

    revalidatePath("/dashboard/admin/properties");
    revalidatePath(`/dashboard/admin/properties/${id}`);
    revalidatePath("/dashboard/property-owner/properties");
    revalidatePath(`/dashboard/property-owner/properties/${id}`);
    revalidatePath("/dashboard/property-manager/properties");
    revalidatePath(`/dashboard/property-manager/properties/${id}`);

    return {
      success: true,
      data: resData?.data || resData,
      message: resData?.message || "Property updated successfully!",
    };
  } catch (error) {
    console.warn("updateProperty error:", error);
    return {
      success: false,
      message: error?.message || "Failed to update property. Please try again.",
    };
  }
}

export async function archiveProperty(id) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/properties/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({})
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      return {
        success: false,
        message:
          resData?.message ||
          resData?.error ||
          `Failed to delete property (${response.status}).`,
        status: response.status,
      };
    }

    revalidatePath("/dashboard/admin/properties");
    revalidatePath("/dashboard/property-owner/properties");
    revalidatePath("/dashboard/property-manager/properties");

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Property deleted successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to delete property.",
    };
  }
}

export async function addManagerTOProperty(id, data) {
  try {
    const payload = {
      userId: String(data?.userId || "").trim(),
      role: data?.role || "FACILITY_MANAGER",
    };

    if (!payload.userId) {
      return {
        success: false,
        message: "Please select or enter a user to assign as manager.",
      };
    }

    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/properties/${encodeURIComponent(id)}/managers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }
    console.log(response);
    console.log(resData)


    if (!response.ok) {
      return {
        success: false,
        message:
          resData?.message ||
          resData?.error ||
          `Failed to add manager (${response.status}).`,
        status: response.status,
      };
    }

    revalidatePath(`/dashboard/admin/properties/${id}`);
    revalidatePath(`/dashboard/property-owner/properties/${id}`);
    revalidatePath(`/dashboard/property-manager/properties/${id}`);

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Manager added to property!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to add manager to property.",
    };
  }
}

export async function deleteManagerFromProperty(id, managerId) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/properties/${encodeURIComponent(id)}/managers/${encodeURIComponent(managerId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({})
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      return {
        success: false,
        message:
          resData?.message ||
          resData?.error ||
          `Failed to remove manager (${response.status}).`,
        status: response.status,
      };
    }

    revalidatePath(`/dashboard/admin/properties/${id}`);
    revalidatePath(`/dashboard/property-owner/properties/${id}`);
    revalidatePath(`/dashboard/property-manager/properties/${id}`);

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Manager removed from property!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to remove manager.",
    };
  }
}

export async function assignOwnerToProperty(id, data) {
  try {
    const ownerProfileId = String(data?.ownerProfileId || "").trim();
    const ownershipPercentage = Number(data?.ownershipPercentage);

    if (!ownerProfileId) {
      return {
        success: false,
        message: "Please select an owner to assign.",
      };
    }

    const payload = {
      ownerProfileId,
      ...(Number.isFinite(ownershipPercentage) && ownershipPercentage > 0
        ? { ownershipPercentage }
        : { ownershipPercentage: 100 }),
    };

    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/properties/${encodeURIComponent(id)}/owners`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      return {
        success: false,
        message:
          resData?.message ||
          resData?.error ||
          `Failed to assign owner (${response.status}).`,
        status: response.status,
      };
    }

    revalidatePath(`/dashboard/admin/properties/${id}`);
    revalidatePath(`/dashboard/property-owner/properties/${id}`);
    revalidatePath(`/dashboard/property-manager/properties/${id}`);

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Owner assigned to property!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to assign owner to property.",
    };
  }
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
export async function deleteUser(id){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/admin/users/${id}/deactivate`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})

  });
  return response.json(); 

}
export async function activateUser(id){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/admin/users/${id}/activate`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });
  return response.json(); 

}
export async function syncWallet(){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/wallet/sync`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });
  return response.json(); 

}


export async function createVirtualAccount(){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/virtual-accounts`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });
  return response.json(); 

}

export async function refreshVirtualAccount(id){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/virtual-accounts${id}/refresh`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });
  return response.json(); 

}


export async function expireVirtualAccount( accountId ) {
   const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/virtual-accounts/${accountId}`,
  {
  method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });
  console.log(response)
  return response.json(); 
}

export async function manageSubscription(payload) {
   const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/virtual-accounts/${accountId}`,
  {
  method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({payload})
  });
  console.log(response)
  return response.json(); 
}


export async function recordSubscription(payload) {
   const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/virtual-accounts/${accountId}`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({payload})
  });
  console.log(response)
  return response.json(); 
}

export async function refundSubscriptionPayment(id, payload) {
   const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await safeFetch(`https://services.xpacy.com/api/v1/admin/subscription-payments/${id}`,
  {
  method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({payload})
  });
  console.log(response)
  return response.json(); 
}

/////////////////////////////////////*LISTINGS*/////////////////////////////////////////////////

export async function createListing(data, propertyId) {
  try {
    if (!propertyId) {
      return {
        success: false,
        message: "Property ID is required to create a listing.",
      };
    }

    const numOrUndef = (v) =>
      v !== undefined && v !== null && v !== "" && Number.isFinite(Number(v))
        ? Number(v)
        : undefined;

    const price = numOrUndef(data?.price);
    const deposit = numOrUndef(data?.deposit);
    const unitId = String(data?.unitId || "").trim();
    if (!unitId) {
      return {
        success: false,
        message: "Please select a unit for this listing.",
        status: 400,
      };
    }
    const description = String(data?.description || "").trim();
    const location = String(data?.location || "").trim();

    const payload = {
      ...(unitId ? { unitId } : {}),
      title: String(data?.title || "").trim(),
      ...(description ? { description } : {}),
      listingType: data?.listingType || "RENT",
      price: price ?? 0,
      currency: data?.currency || "NGN",
      deposit: deposit ?? 0,
      availability:
        data?.availability && typeof data.availability === "object" && !Array.isArray(data.availability)
          ? data.availability
          : {},
      amenities:
        data?.amenities && typeof data.amenities === "object" && !Array.isArray(data.amenities)
          ? data.amenities
          : {},
      ...(location ? { location } : {}),
    };
    console.log("createListing payload:", payload);

    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/properties/${encodeURIComponent(propertyId)}/listings`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }
    console.log("createListing response:", resData);

    if (!response.ok) {
      const detailedErrors = Array.isArray(resData?.errors)
        ? resData.errors
            .map((e) =>
              typeof e === "string"
                ? e
                : [e?.field || e?.property, e?.message].filter(Boolean).join(": ")
            )
            .filter(Boolean)
            .join(", ")
        : "";
      const errorMessage =
        detailedErrors ||
        (Array.isArray(resData?.message)
          ? resData.message.join(", ")
          : resData?.message ||
            resData?.error ||
            `Failed to create listing (${response.status}).`);
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
    revalidatePath(`/dashboard/property-owner/properties/${propertyId}/listings`);
    revalidatePath("/listings");

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Listing created successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to create listing.",
    };
  }
}

export async function updateListing(id, data, propertyId = null) {
  try {
    const numOrUndef = (v) =>
      v !== undefined && v !== null && v !== "" && Number.isFinite(Number(v))
        ? Number(v)
        : undefined;

    const price = numOrUndef(data?.price);
    const deposit = numOrUndef(data?.deposit);
    const location = String(data?.location || "").trim();
    const description =
      data?.description !== undefined ? String(data.description).trim() : "";

    const payload = {
      ...(data?.title ? { title: String(data.title).trim() } : {}),
      ...(description ? { description } : {}),
      ...(data?.listingType ? { listingType: data.listingType } : {}),
      ...(price !== undefined ? { price } : {}),
      ...(data?.currency ? { currency: data.currency } : {}),
      ...(deposit !== undefined ? { deposit } : {}),
      ...(data?.availability &&
      typeof data.availability === "object" &&
      !Array.isArray(data.availability)
        ? { availability: data.availability }
        : {}),
      ...(data?.amenities &&
      typeof data.amenities === "object" &&
      !Array.isArray(data.amenities)
        ? { amenities: data.amenities }
        : {}),
      ...(location ? { location } : {}),
    };
    console.log("updateListing payload:", payload);

    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/listings/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }
    console.log("updateListing response:", resData);

    if (!response.ok) {
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to update listing (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}/listings`);
      revalidatePath(
        `/dashboard/property-owner/properties/${propertyId}/listings/${id}`
      );
    }
    revalidatePath("/listings");

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Listing updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to update listing.",
    };
  }
}

export async function deleteListing(id, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/listings/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenVal}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({})
      }
    );

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }
    console.timeLog()

    if (!response.ok) {
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to delete listing (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}/listings`);
    }
    revalidatePath("/listings");

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Listing deleted successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to delete listing.",
    };
  }
}

async function runListingLifecycleAction(id, action, fallbackStatus, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;
    const headers = {
      Authorization: `Bearer ${tokenVal}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    let response = await safeFetch(
      `https://services.xpacy.com/api/v1/listings/${encodeURIComponent(id)}/${action}`,
      { method: "POST", headers,body: JSON.stringify({}) }
    );

    if (response.status === 404 || response.status === 405) {
      response = await safeFetch(
        `https://services.xpacy.com/api/v1/listings/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: fallbackStatus }),
        },
      );
    }

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }

    if (!response.ok) {
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to ${action} listing (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}/listings`);
      revalidatePath(
        `/dashboard/property-owner/properties/${propertyId}/listings/${id}`
      );
    }
    revalidatePath("/listings");

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || `Listing ${fallbackStatus.toLowerCase()} successfully!`,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || `Failed to ${action} listing.`,
    };
  }
}

export async function publishListing(id, propertyId = null) {
  return runListingLifecycleAction(id, "publish", "PUBLISHED", propertyId);
}

export async function pauseListing(id, propertyId = null) {
  return runListingLifecycleAction(id, "pause", "PAUSED", propertyId);
}

export async function archiveListing(id, propertyId = null) {
  return runListingLifecycleAction(id, "archive", "ARCHIVED", propertyId);
}

/////////////////////////////////////*BOOKINGS (V1)*/////////////////////////////////////////////////

export async function createPropertyBooking(bookingData, propertyId = null) {
  try {
    const cookieStore = await cookies();
    const tokenVal = cookieStore.get("token")?.value;

    if (!tokenVal) {
      return {
        success: false,
        message: "Please log in to create a booking.",
        status: 401,
      };
    }

    const unitId = String(bookingData?.unitId || "").trim();
    const listingId = String(bookingData?.listingId || "").trim();

    if (!unitId || !listingId) {
      return {
        success: false,
        message: !unitId
          ? "Unit ID is required to create a booking."
          : "Listing ID is required to create a booking.",
        status: 400,
      };
    }

    const adults = Math.max(1, Number(bookingData?.numberOfAdults ?? 1) || 1);
    const children = Math.max(0, Number(bookingData?.numberOfChildren ?? 0) || 0);
    const totalGuests =
      bookingData?.numberOfGuests !== undefined &&
      bookingData?.numberOfGuests !== "" &&
      bookingData?.numberOfGuests !== null
        ? Number(bookingData.numberOfGuests)
        : adults + children;

    const payload = {
      unitId,
      listingId,
      checkIn: bookingData?.checkIn,
      checkOut: bookingData?.checkOut,
      numberOfGuests: totalGuests,
      numberOfAdults: adults,
      numberOfChildren: children,
      ...(bookingData?.specialRequests?.trim()
        ? { specialRequests: bookingData.specialRequests.trim() }
        : {}),
    };

    const headers = {
      Authorization: `Bearer ${tokenVal}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    let response = await safeFetch("https://services.xpacy.com/api/v1/bookings", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if ((response.status === 404 || response.status === 405) && propertyId) {
      response = await safeFetch(
        `https://services.xpacy.com/api/v1/properties/${encodeURIComponent(propertyId)}/bookings`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }
      );
    }

    let resData = null;
    try {
      resData = await response.json();
    } catch {
      resData = { message: response.statusText };
    }
    if (!response.ok) {
      console.error("createPropertyBooking failed:", {
        status: response.status,
        payload,
        resData,
      });
      const errorMessage = Array.isArray(resData?.message)
        ? resData.message.join(", ")
        : resData?.message ||
          resData?.error ||
          `Failed to create booking (${response.status}).`;
      return {
        success: false,
        message: errorMessage,
        status: response.status,
      };
    }

    revalidatePath("/dashboard/user/bookings");
    revalidatePath("/dashboard/property-owner/bookings");
    revalidatePath("/dashboard/property-manager/bookings");
    if (propertyId) {
      revalidatePath(`/dashboard/property-owner/properties/${propertyId}`);
    }

    return {
      success: true,
      data: resData?.data ?? resData,
      message: resData?.message || "Booking created successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Failed to create booking.",
    };
  }
}