import { cookies } from "next/headers";
import { safeFetch } from "./safe-fetch";
import { ensureApiSuccess, logApiFailure, toDataServiceError } from "./api-error";
import { SAMPLE_TENANTS, SAMPLE_TENANT_DETAIL } from "./sample-tenants";

import { SERVICES_URL, url } from "./constants";
export { url };

const SERVICE_URL = "https://services.xpacy.com/api/v1";

/* ----------------------------------------------------------------
 * Internal helpers
 * ---------------------------------------------------------------- */

// Read a raw JWT string from either a cookie object, a raw string,
// or fall back to the cookie store.
async function getRawToken(passed) {
  if (typeof passed === "string" && passed.length > 0) return passed;
  if (passed?.value) return passed.value;
  try {
    const cookieStore = await cookies();
    return cookieStore.get("token")?.value || null;
  } catch {
    return null;
  }
}

async function getActiveOrganizationId() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("organizationId")?.value || "";
  } catch {
    return "";
  }
}

// Safely parse JSON; returns null on failure.
async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// Normalize "list" responses from common backend shapes.
function toArray(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.properties)) return json.properties;
  if (Array.isArray(json?.bookings)) return json.bookings;
  if (Array.isArray(json?.invoices)) return json.invoices;
  return [];
}

/* ----------------------------------------------------------------
 * Public / marketing data
 * ---------------------------------------------------------------- */

export async function getBanners() {
  try {
    const response = await safeFetch(`${url}/settings/homepage-sliders`);
    await logApiFailure(response, "getBanners");
    if (!response.ok) return [];
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.warn("Error fetching banners:", error);
    return [];
  }
}

export async function getFaqs() {
  try {
    const response = await safeFetch(`${url}/faq/get-all-faqs`);
    await logApiFailure(response, "getFaqs");
    if (!response.ok) return [];
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.warn("Error fetching faqs:", error);
    return [];
  }
}

export async function getFaqById(id) {
  try {
    const response = await safeFetch(`${url}/faq/get-faq/${id}`);
    await logApiFailure(response, "getFaqById");
    const { faq } = await response.json();
    return faq || null;
  } catch (error) {
    console.warn("Error fetching faq:", error);
    return null;
  }
}

/* ----------------------------------------------------------------
 * Properties (public)
 * ---------------------------------------------------------------- */

export async function getFeaturedProperties() {
  try {
    const response = await safeFetch(`${url}/property/fetch-featured-properties`);
    await logApiFailure(response, "getFeaturedProperties");
    if (!response.ok) return [];
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.warn("Error fetching featured properties:", error);
    return [];
  }
}

export async function getRentProperties() {
  try {
    const response = await safeFetch(`${url}/property/fetch-properties?purpose=rent`);
    await logApiFailure(response, "getRentProperties");
    const { properties, pagination } = await response.json();
    return [properties || [], pagination || {}];
  } catch (error) {
    console.warn("Error fetching rent properties:", error);
    return [[], {}];
  }
}

export async function getProperties(id) {
  const token = getRawToken()
if (!token || !id) return null;
  try {
    const response = await safeFetch(`https://services.xpacy.com/api/v1/properties?organizationId=${id}&page=1&limit=20&sortBy=createdAt&sortOrder=desc
`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const data = await response.json();
    console.log(response)
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getProperties");
  }

}

export async function getLatestPropertie(){
    const token = await getRawToken();

  try {
    const response = await safeFetch(`${SERVICES_URL}/property/fetch-property/${id}`);
    await logApiFailure(response, "getProperty");
    const { property } = await response.json();
    return property || null;
  } catch (error) {
    console.warn("Error fetching property:", error);
    return null;
  }}

export async function getProperty(id) {
  try {
    const response = await safeFetch(`${url}/property/fetch-property/${id}`);
    await logApiFailure(response, "getProperty");
    const { property } = await response.json();
    return property || null;
  } catch (error) {
    console.warn("Error fetching property:", error);
    return null;
  }
}

export async function getOtherProperties() {
 return []
}

export async function getCities() {
 return []
}

/* ----------------------------------------------------------------
 * Blogs
 * ---------------------------------------------------------------- */

export async function getBlogs() {
  return []
}
export async function getAdminBlogs() {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/blogs?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAdminBlogs");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getAdminBlogs");
  }
}

export async function getBlog(id) {
 const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/blogs?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAdminBlogById");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getAdminBloById");
  }
}

export async function getBlogCategories() {
  try {
    const response = await safeFetch(`${url}/blog/all-categories`);
    await logApiFailure(response, "getBlogCategories");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.warn("Error fetching blog categories:", error);
    return [];
  }
}

/* ----------------------------------------------------------------
 * User profile & auth
 * ---------------------------------------------------------------- */

export async function getUserProfile() {
  const token = await getRawToken();
  if (!token) return null;
  try {
    const response = await safeFetch(`${SERVICE_URL}/auth/profile`, {
      next: { tags: ["user-profile"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
    });
    await logApiFailure(response, "getUserProfile");
    if (!response.ok) {
      return null;
    }
    const profile = await response.json();
    return response.ok && profile?.success !== false ? profile : null;
  } catch (error) {
    console.warn("Error fetching user profile:", error);
    return null;
  }
}

export async function getPropertyOwnerProfile() {
  return {}
}

export async function getPropertyOwnerInfo(tokenKey) {
  try {
    const response = await safeFetch(
      `${url}/property-owner/fetch-owner-information?token=${tokenKey}`
    );
    await logApiFailure(response, "getPropertyOwnerInfo");
    const { property_owner } = await response.json();
    return property_owner || null;
  } catch (error) {
    console.warn("Error fetching owner info:", error);
    return null;
  }
}

/* ----------------------------------------------------------------
 * User dashboard — saved, notifications, services, bookings
 * ---------------------------------------------------------------- */

export async function getSavedProperties() {
  return []
}

export async function getUnreadNotificationsCount(passedToken) {
  const token = await getRawToken(passedToken);
  if (!token) return 0;
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/notifications/unread-count`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    await logApiFailure(response, "getUnreadNotificationsCount");
    if (!response.ok) return 0;
    const resData = await response.json();
    if (typeof resData?.data === "number") return resData.data;
    if (typeof resData?.data?.count === "number") return resData.data.count;
    if (typeof resData?.count === "number") return resData.count;
    if (typeof resData?.unreadCount === "number") return resData.unreadCount;
    if (typeof resData === "number") return resData;
    return 0;
  } catch (error) {
    console.warn("Error fetching unread notifications count:", error);
    return 0;
  }
}
export async function getUserNotifications() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token?.value) return [];
    try {
        const response = await safeFetch(
            `https://services.xpacy.com/api/v1/notifications?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
                cache: "no-store",
            }
        );
        await logApiFailure(response, "getUserNotifications");
        if (!response.ok) return [];
        const json = await response.json();

        // Normalize common API envelope shapes
        if (Array.isArray(json)) return json;
        if (Array.isArray(json?.data)) return json.data;
        if (Array.isArray(json?.notifications)) return json.notifications;
        if (Array.isArray(json?.data?.notifications)) return json.data.notifications;

        return [];
    } catch (error) {
        console.warn("Error fetching user notifications:", error);
        return [];
    }
}

export async function getBookedServices() {
  return []
}

export async function getRentedProperties() {
  const token = await getRawToken();
  if (!token) return [];
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/me/rented-properties?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await ensureApiSuccess(response, "getRentedProperties");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getRentedProperties");
  }
}

export async function getBookingList() {
  const token = await getRawToken();
  if (!token) return [];
  try {
    const response = await safeFetch(`${SERVICE_URL}/user/fetch-bookings`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    await ensureApiSuccess(response, "getBookingList");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getBookingList");
  }
}

export async function getBookingSlots() {
  try {
    const response = await safeFetch(`${SERVICE_URL}/bookings/fetch-slots`);
    await logApiFailure(response, "getBookingSlots");
    const { slots } = await response.json();
    return slots || [];
  } catch (error) {
    console.warn("Error fetching booking slots:", error);
    return [];
  }
}

export async function getBookingById(token, id) {
  const raw = await getRawToken(token);
  try {
    const response = await safeFetch(`${SERVICE_URL}/user/fetch-booking/${id}`, {
      headers: { Authorization: `Bearer ${raw}` },
    });
    await ensureApiSuccess(response, "getBookingById");
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getBookingById");
  }
}

/* ----------------------------------------------------------------
 * Invoices & payments
 * ---------------------------------------------------------------- */

export async function getInvoice(id) {
  const token = await getRawToken();
  if (!token) return null;
  try {
    const response = await safeFetch(`${SERVICE_URL}/invoices/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    await ensureApiSuccess(response, "getInvoice");
    const invoice = await response.json();
    return response.ok && invoice?.success !== false ? invoice : null;
  } catch (error) {
    throw toDataServiceError(error, "getInvoice");
  }
}

export async function getAdminInvoice(passedToken, id) {
  const token = await getRawToken(passedToken);
  if (!token || !id) return null;

  try {
    const response = await safeFetch(`${SERVICE_URL}/invoices/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getAdminInvoice");

    const payload = await safeJson(response);
    return payload?.data?.invoice || payload?.data || payload?.invoice || payload || null;
  } catch (error) {
    throw toDataServiceError(error, "getAdminInvoice");
  }
}

export async function getInvoiceById(id) {
  const token = await getRawToken();
  if (!token) return null;
  try {
    const response = await safeFetch(`${SERVICE_URL}/invoices/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
    });
    await ensureApiSuccess(response, "getInvoiceById");
    const data = await safeJson(response);
    return data?.data || data?.invoice || data;
  } catch (error) {
    throw toDataServiceError(error, "getInvoiceById");
  }
}

export async function getAllInvoices(organizationId, passedToken, limit = 10000) {
  const token = await getRawToken(passedToken);
  if (!token) return [];
  try {
    const params = new URLSearchParams({ page: "1", limit: String(limit), sortBy: "createdAt", sortOrder: "desc" });
    if (organizationId) params.set("organizationId", organizationId);
    const response = await safeFetch(
      `${SERVICE_URL}/invoices?${params.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    await ensureApiSuccess(response, "getAllInvoices");
    return await response.json();
  } catch (error) {
    throw toDataServiceError(error, "getAllInvoices");
  }
}

export async function getInvoiceList() {
  return []
}

export async function getPaymentById(id) {
  return null
}

export async function getPaymentsForInvoice(invoiceId) {
  return null
}

/* ----------------------------------------------------------------
 * Leases, tenants, units, buildings, owners (management)
 * ---------------------------------------------------------------- */

export async function getLeases({propertyId}) {
  const token = await getRawToken();
  if (!token) return [];
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/properties/${propertyId}/leases`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getLeases");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getLeases");
  }
}

export async function getAllLeases() {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/leases?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAllLeases");
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    throw toDataServiceError(err, "getAllLeases");
  }
}

export async function getLeaseById(id) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/properties/${id}/leases`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getLeaseById");

    const { data } = await safeJson(response);
    return data;
  } catch (err) {
    throw toDataServiceError(err, "getLeaseById");
  }
}

export async function getSingleLease(leaseId) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/leases/${leaseId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getSingleLease");

    const result = await safeJson(response);
    return result?.data || result?.lease || result || null;
  } catch (err) {
    throw toDataServiceError(err, "getSingleLease");
  }
}

export async function getAllTenants() {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/tenants?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAllTenants");
    const json = await safeJson(response);
    const data = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
        ? json
        : Array.isArray(json?.items)
          ? json.items
          : [];
    return data && data.length > 0 ? data : SAMPLE_TENANTS;
  } catch (err) {
    if (Array.isArray(SAMPLE_TENANTS) && SAMPLE_TENANTS.length > 0) {
      return SAMPLE_TENANTS;
    }
    throw toDataServiceError(err, "getAllTenants");
  }
}

export async function getTenantById(id) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(`https://services.xpacy.com/api/v1/tenants/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getTenantById");
    const json = await safeJson(response);
    const tenant = json?.data || json || null;
    console.log(tenant)
    if (tenant && typeof tenant === "object" && !Array.isArray(tenant)) {
      return tenant;
    }
  } catch (err) {
    if (id === SAMPLE_TENANT_DETAIL.id) return SAMPLE_TENANT_DETAIL;
    const fallback = SAMPLE_TENANTS.find((t) => t.id === id);
    if (fallback) return fallback;
    throw toDataServiceError(err, "getTenantById");
  }
  if (id === SAMPLE_TENANT_DETAIL.id) return SAMPLE_TENANT_DETAIL;
  const fallback = SAMPLE_TENANTS.find((t) => t.id === id);
  return fallback || null;
}

export async function getAllUnits(propertyId) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/properties/${propertyId}/units?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAllUnits");
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    throw toDataServiceError(err, "getAllUnits");
  }
}

export async function getUnitById(id) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/units/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getUnitById");
    const  data  = await safeJson(response);
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getUnitById");
  }
}

export async function getAllBuildings(propertyId) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/properties/${propertyId}/buildings?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAllBuildings");
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    throw toDataServiceError(err, "getAllBuildings");
  }
}

export async function getBuildingById(propertyId, id) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/buildings/${propertyId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getBuildingById");
    const  data  = await response.json();
    return data || null;
  } catch (err) {
    throw toDataServiceError(err, "getBuildingById");
  }
}

export async function getAllPropertyOwners() {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/owners?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAllPropertyOwners");
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    throw toDataServiceError(err, "getAllPropertyOwners");
  }
}

export async function getPropertyOwnerById(id) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/owners/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getPropertyOwnerById");
    const { data } = await response.json();
    return data || null;
  } catch (err) {
    throw toDataServiceError(err, "getPropertyOwnerById");
  }
}

/* ----------------------------------------------------------------
 * Maintenance, expenses, documents
 * ---------------------------------------------------------------- */

export async function getAllMaintenanceRequest(propertyId) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/properties/${propertyId}/maintenance?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAllMaintenanceRequest");
    const data = await response.json();
    return data || [];
  } catch (err) {
    throw toDataServiceError(err, "getAllMaintenanceRequest");
  }
}

export async function getMaintenanceById(id) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/maintenance/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getMaintenanceById");
    const json = await response.json();
    return json?.data ?? json?.maintenance ?? json ?? null;
  } catch (err) {
    throw toDataServiceError(err, "getMaintenanceById");
  }
}

export async function getAllExpenses(organisationId) {
  const cookieStore = await cookies();
  const token = await getRawToken();
  if (!token) return [];

  const rawOrgId =
    organisationId ||
    cookieStore.get("organizationId")?.value ||
    cookieStore.get("organization_id")?.value ||
    "";
  const resolvedOrgId =
    typeof rawOrgId === "string" &&
    rawOrgId.trim() &&
    rawOrgId !== "undefined" &&
    rawOrgId !== "null"
      ? rawOrgId.trim()
      : "";

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const candidates = [];
  if (resolvedOrgId) {
    candidates.push(
      `${SERVICE_URL}/expenses?organizationId=${encodeURIComponent(resolvedOrgId)}&page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      `${SERVICE_URL}/expenses?organizationId=${encodeURIComponent(resolvedOrgId)}`
    );
  }
  candidates.push(`${SERVICE_URL}/expenses`);

  try {
    let response = null;
    let lastUrl = candidates[0];

    for (const url of candidates) {
      lastUrl = url;
      response = await safeFetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
      });
      if (response.ok) break;
      if (response.status !== 400) break;
    }

    if (!response.ok) {
      let errBody = null;
      try {
        errBody = await response.clone().json();
      } catch {
        errBody = await response.clone().text().catch(() => null);
      }
      console.log("getAllExpenses error body:", {
        url: lastUrl,
        status: response.status,
        resolvedOrgId,
        body: errBody,
      });
    }

    await ensureApiSuccess(response, "getAllExpenses");
    const json = await response.json();
    return (
      [json, json?.data, json?.expenses, json?.data?.expenses].find(
        Array.isArray
      ) || []
    );
  } catch (err) {
    throw toDataServiceError(err, "getAllExpenses");
  }
}

export async function getExpenseById(id) {
  const token = await getRawToken();
  if (!token || !id) return null;
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/expenses/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getExpenseById");
    const json = await response.json();
    return json?.data?.expense || json?.data || json?.expense || json || null;
  } catch (err) {
    throw toDataServiceError(err, "getExpenseById");
  }
}

export async function getAllDocuments(options = {}) {
  const token = await getRawToken();
  if (!token) return [];
  const params = new URLSearchParams({
    page: "1",
    limit: "50",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  if (options?.propertyId) params.set("propertyId", String(options.propertyId));
  if (options?.organizationId) {
    params.set("organizationId", String(options.organizationId));
  }
  try {
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/documents?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAllDocuments");
    const payload = await response.json();
    console.log(payload)
    const list =
      [payload, payload?.data, payload?.documents, payload?.data?.documents].find(
        Array.isArray
      ) || [];
    if (options?.propertyId) {
      const targetId = String(options.propertyId);
      const filtered = list.filter(
        (d) =>
          String(d?.propertyId || d?.property?.id || d?.property?._id || "") ===
          targetId
      );
      return filtered;
    }
    return list;
  } catch (error) {
    throw toDataServiceError(error, "getAllDocuments");
  }
}

export async function getDocumentById(id) {
  const token = await getRawToken();
  if (!token || !id) return null;
  try {
    const response = await safeFetch(`${SERVICE_URL}/documents/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getDocumentById");
    const payload = await response.json();
    return payload?.data?.document || payload?.data || payload?.document || payload || null;
  } catch (error) {
    throw toDataServiceError(error, "getDocumentById");
  }
}

export async function getAllMedia(options = {}) {
  const token = await getRawToken();
  if (!token) return [];
  const propertyId =
    typeof options === "string"
      ? options.trim()
      : String(options?.propertyId || options?.id || "").trim();

  if (!propertyId) return [];

  try {
    const response = await safeFetch(
      `${SERVICE_URL}/property-media/property/${encodeURIComponent(propertyId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAllMedia");
    const payload = await response.json();
    const list =
      [
        payload,
        payload?.data,
        payload?.media,
        payload?.items,
        payload?.data?.media,
        payload?.data?.items,
        payload?.data?.data,
      ].find(Array.isArray) || [];

    return list;
  } catch (error) {
    throw toDataServiceError(error, "getAllMedia");
  }
}

export async function getMediaById(id) {
  const token = await getRawToken();
  if (!token || !id) return null;
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/property-media/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getMediaById");
    const payload = await response.json();
    return (
      payload?.data?.media ||
      payload?.data ||
      payload?.media ||
      payload ||
      null
    );
  } catch (error) {
    throw toDataServiceError(error, "getMediaById");
  }
}

export async function getAuditLogs(options = {}) {
  const token = await getRawToken();
  if (!token) return [];

  const propertyId = String(options?.propertyId || "").trim();
  const organizationId = String(options?.organizationId || "").trim();
  if (!propertyId && !organizationId) return [];

  const params = new URLSearchParams({
    page: String(options?.page || 1),
    limit: String(options?.limit || 20),
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const endpoint = propertyId
    ? `${SERVICE_URL}/audit/property/${encodeURIComponent(propertyId)}?${params.toString()}`
    : `${SERVICE_URL}/audit/organization/${encodeURIComponent(organizationId)}?${params.toString()}`;

  try {
    const response = await safeFetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      await logApiFailure(response, "getAuditLogs");
      return [];
    }
    const payload = await response.json();
    console.log(payload)

    return (
      [
        payload,
        payload?.data,
        payload?.logs,
        payload?.auditLogs,
        payload?.items,
        payload?.data?.logs,
        payload?.data?.auditLogs,
        payload?.data?.items,
        payload?.data?.data,
      ].find(Array.isArray) || []
    );
  } catch (error) {
    console.warn("getAuditLogs error:", error?.message);
    return [];
  }
}

/* ----------------------------------------------------------------
 * Organizations, users, members
 * ---------------------------------------------------------------- */
export async function getAllAdminOrganization(){
 const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/admin/organizations?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAllAdminOrganization");
    const  data  = await response.json();
    return data || [];
  } catch (err) {
    throw toDataServiceError(err, "getAllAdminOrganization");
  }  
}

export async function getAdminOrganizationById(id) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/admin/organizations/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getAdminOrganizationById");
    const data = await response.json();
    return data || null;
  } catch (err) {
    throw toDataServiceError(err, "getAdminOrganizationById");
  }
}

export async function getAdminOrganizationMembers(id, limit = 100) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/admin/organizations/${id}/members?page=1&limit=${encodeURIComponent(limit)}&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAdminOrganizationMembers");
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    throw toDataServiceError(err, "getAdminOrganizationMembers");
  }
}
export async function getAllOrganization({ throwOnError = false } = {}) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/organizations?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );
    if (throwOnError) {
      await ensureApiSuccess(response, "getAllOrganization");
    } else {
      await logApiFailure(response, "getAllOrganization");
    }
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    if (throwOnError) throw toDataServiceError(err, "getAllOrganization");
    console.warn(err);
    return [];
  }
}

export async function getOrganizationById(id) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/organizations/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getOrganizationById");
    const data = await response.json();
    return data || null;
  } catch (err) {
    throw toDataServiceError(err, "getOrganizationById");
  }
}

export async function getPublicOrganizationById(id) {
  if (!id) return null;
  try {
    const token = await getRawToken();
    const response = await safeFetch(`${SERVICE_URL}/organizations/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
    await logApiFailure(response, "getPublicOrganizationById");
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.organization || payload?.data?.organization || payload?.data || payload || null;
  } catch (error) {
    console.warn("Error fetching public organization:", error);
    return null;
  }
}

export function getOrganizationIdFromProperty(property) {
  const value = property?.organizationId || property?.organization_id || property?.organization?.id || property?.organization?._id;
  return String(value?.id || value?._id || value || "");
}

export function filterPropertiesByOrganization(properties, organizationId) {
  if (!Array.isArray(properties) || !organizationId) return [];
  return properties.filter((property) => {
    const propertyOrganizationId = getOrganizationIdFromProperty(property);
    // These results were requested from an organization-scoped endpoint; retain
    // records that omit the relation field, but reject explicitly mismatched IDs.
    return !propertyOrganizationId || propertyOrganizationId === String(organizationId);
  });
}

export async function getOrganizationMembers(id) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/organizations/${id}/members?page=1&limit=100&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getOrganizationMembers");
    const payload = await response.json();
    return payload?.data?.members || payload?.data || payload?.members || payload || [];
  } catch (err) {
    throw toDataServiceError(err, "getOrganizationMembers");
  }
}

export async function getAllUsers(passedToken, limit = 20) {
  const token = await getRawToken(passedToken);
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/admin/users?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAllUsers");
    const {data} = await response.json();
return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getAllUsers");
  }
}

export async function getUserById(id) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(`https://services.xpacy.com/api/v1/users/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getUserById");
    const data = await response.json();
    console.log(data)
    return data || null;
  } catch (err) {
    throw toDataServiceError(err, "getUserById");
  }
}

/* ----------------------------------------------------------------
 * Property management (organizations)
 * ---------------------------------------------------------------- */

export async function getOrganizationProperties(organizationId) {
  if (!organizationId) return [];
  const token = await getRawToken();
  try {
    const properties = [];
    let totalPages = 1;
    for (let page = 1; page <= totalPages; page += 1) {
      const response = await safeFetch(
        `${SERVICE_URL}/properties?organizationId=${encodeURIComponent(organizationId)}&page=${page}&limit=20&sortBy=createdAt&sortOrder=desc`,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );
      await logApiFailure(response, "getOrganizationProperties");
      if (!response.ok) break;
      const payload = await response.json();
      const pageProperties = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.properties)
            ? payload.properties
            : Array.isArray(payload?.data?.properties)
              ? payload.data.properties
              : Array.isArray(payload?.data?.data)
                ? payload.data.data
              : [];
      properties.push(...pageProperties);
      const meta = payload?.meta || payload?.pagination || payload?.data?.meta || payload?.data?.pagination;
      totalPages = Math.max(page, Number(meta?.totalPages) || 1);
    }
    return properties || [];
  } catch (err) {
    console.warn(err);
    return [];
  }
}

export async function getPropertyById(id) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/properties/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getPropertyById");
    const data = await response.json();
    console.log(data)
    return data || null;
  } catch (err) {
    throw toDataServiceError(err, "getPropertyById");
  }
}

export async function getPropertyTenants(propertyId) {
  const token = await getRawToken();
  if (!propertyId) return [];
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/properties/${encodeURIComponent(propertyId)}/tenants?page=1&limit=50&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getPropertyTenants");
    const json = await safeJson(response);
    return Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json?.tenants)
        ? json.tenants
        : Array.isArray(json)
          ? json
          : [];
  } catch (err) {
    console.warn("getPropertyTenants error:", err?.message);
    return [];
  }
}

export async function getMyProperties(limit = 20) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/me/owned-properties?page=1&limit=${encodeURIComponent(limit)}&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    await ensureApiSuccess(response, "getMyProperties");
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    throw toDataServiceError(err, "getMyProperties");
  }
}

export async function getManagedProperties(limit = 20) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/me/managed-properties?page=1&limit=${encodeURIComponent(limit)}&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    await ensureApiSuccess(response, "getManagedProperties");
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    throw toDataServiceError(err, "getManagedProperties");
  }
}

export async function getMyRentedProperties() {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/me/rented-properties?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    await ensureApiSuccess(response, "getMyRentedProperties");
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    throw toDataServiceError(err, "getMyRentedProperties");
  }
}

export async function getMyLeases() {
  const token = await getRawToken();
  if (!token) return [];

  const limit = 100;
  const leases = [];

  try {
    for (let page = 1; page <= 100; page += 1) {
      const response = await safeFetch(
        `https://services.xpacy.com/api/v1/me/leases?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );
      await ensureApiSuccess(response, "getMyLeases");


      const payload = await response.json();
      const pageLeases = [
        payload,
        payload?.data,
        payload?.leases,
        payload?.results,
        payload?.items,
        payload?.data?.leases,
        payload?.data?.results,
        payload?.data?.items,
      ].find(Array.isArray) || [];
      leases.push(...pageLeases);

      const pagination = payload?.pagination || payload?.data?.pagination;
      const totalPages = Number(pagination?.totalPages);
      if (
        pageLeases.length === 0 ||
        (Number.isFinite(totalPages) && totalPages > 0 && page >= totalPages) ||
        (!totalPages && pageLeases.length < limit)
      ) {
        break;
      }
    }

    return leases;
  } catch (err) {
    throw toDataServiceError(err, "getMyLeases");
  }
}

export async function getMyBookings() {
  const token = await getRawToken();
  try {
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/me/bookings?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    await ensureApiSuccess(response, "getMyBookings");
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    throw toDataServiceError(err, "getMyBookings");
  }
}

/* ----------------------------------------------------------------
 * Admin — profile, properties, services, bookings, users
 * ---------------------------------------------------------------- */

export async function getAdminProfile(token) {
  return []
}

export async function getAdminProperties() {
  const tokenResult = await getRawToken();
  const raw = tokenResult?.data || tokenResult;
  if (!raw) return { properties: [], pagination: {} };

  try {
    const response = await safeFetch(
      `${url}/admin/fetch-all-propreties`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${raw}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getAdminProperties");
    const { properties, pagination } = await response.json();
    return { properties: properties || [], pagination: pagination || {} };
  } catch (error) {
    throw toDataServiceError(error, "getAdminProperties");
  }
}

export async function getAdminServices(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const response = await safeFetch(`${url}/service/fetch-services`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getAdminServices");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getAdminServices");
  }
}

export async function getAdminServiceById(token, id) {
  const raw = await getRawToken(token);
  if (!raw) return null;
  try {
    const response = await safeFetch(`${url}/service/fetch-service/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getAdminServiceById");
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getAdminServiceById");
  }
}

export async function getPropertyOwner(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const response = await safeFetch(
      `${SERVICE_URL}/owners?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${raw}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getPropertyOwner");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getPropertyOwner");
  }
}

export async function getPropertyOwnerProperties(token, searchParams = {}) {
  const raw = await getRawToken(token);
  if (!raw) return [[], {}];

  let paramsObj = {};
  if (typeof searchParams === "string" || typeof searchParams === "number") {
    paramsObj.page = searchParams;
  } else {
    paramsObj = { ...(searchParams || {}) };
  }

  const activeOrganizationId = await getActiveOrganizationId();
  if (activeOrganizationId) paramsObj.organizationId = activeOrganizationId;

  const params = new URLSearchParams({
    ...(paramsObj.page && { page: paramsObj.page }),
    ...(paramsObj.limit && { limit: paramsObj.limit }),
    ...(paramsObj.organizationId && { organizationId: paramsObj.organizationId }),
  });

  try {
    const urlStr = params.toString()
      ? `${url}/property-owner/fetch-properties?${params.toString()}`
      : `${url}/property-owner/fetch-properties`;
    const response = await safeFetch(urlStr, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getPropertyOwnerProperties");
    const { properties, pagination } = await response.json();
    return [properties || [], pagination || {}];
  } catch (error) {
    throw toDataServiceError(error, "getPropertyOwnerProperties");
  }
}

export async function getAllAdmin(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const response = await safeFetch(`${url}/admin/fetch-admin`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getAllAdmin");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getAllAdmin");
  }
}

export async function getAdminBooking(propertyIdOrToken, passedToken) {
  let propertyId = null;
  let token = passedToken;

  if (
    propertyIdOrToken &&
    typeof propertyIdOrToken === "string" &&
    !propertyIdOrToken.startsWith("eyJ") &&
    !propertyIdOrToken.includes(".") &&
    propertyIdOrToken.length < 50
  ) {
    propertyId = propertyIdOrToken;
  } else if (!passedToken && propertyIdOrToken) {
    token = propertyIdOrToken;
  }

  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const endpoint = propertyId
      ? `${SERVICE_URL}/properties/${encodeURIComponent(propertyId)}/bookings?page=1&limit=10000&sortBy=createdAt&sortOrder=desc`
      : `${url}/admin/fetch-bookings`;

    const response = await safeFetch(endpoint, {
      next: { tags: ["admin-bookings"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
    });

    if (!response.ok && response.status === 404 && !propertyId) {
      return [];
    }
    await ensureApiSuccess(response, "getAdminBooking");
    const json = await response.json();
    return json?.data || json?.bookings || (Array.isArray(json) ? json : []);
  } catch (error) {
    throw toDataServiceError(error, "getAdminBooking");
  }
}

export async function getAdminBookingById(token, id) {
  const raw = await getRawToken(token);
  if (!raw) return null;
  try {
    const response = await safeFetch(`${url}/admin/fetch-booking/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getAdminBookingById");
    const data = await response.json();
    return data.booking || data.data || null;
  } catch (error) {
    throw toDataServiceError(error, "getAdminBookingById");
  }
}

export async function getAdminServiceProviders(token) {
  const raw = await getRawToken(token);
  try {
    const response = await safeFetch(`${url}/admin/service-providers`, {
      headers: { Authorization: `Bearer ${raw}` },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getAdminServiceProviders");
    const { serviceProviders } = await response.json();
    return serviceProviders || [];
  } catch (error) {
    throw toDataServiceError(error, "getAdminServiceProviders");
  }
}

export async function getAdminServiceProviderById(token, id) {
  const raw = await getRawToken(token);
  try {
    const response = await safeFetch(`${url}/admin/service-provider/${id}`, {
      headers: { Authorization: `Bearer ${raw}` },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getAdminServiceProviderById");
    const { serviceProvider } = await response.json();
    return serviceProvider || null;
  } catch (error) {
    throw toDataServiceError(error, "getAdminServiceProviderById");
  }
}

/* ----------------------------------------------------------------
 * Property owner (dashboard)
 * ---------------------------------------------------------------- */

export async function getPropertyOwnerBookings(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const organizationId = await getActiveOrganizationId();
    const query = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : "";
    const response = await safeFetch(`${url}/property-owner/fetch-bookings${query}`, {
      next: { tags: ["property-owner-bookings"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
    });
    await ensureApiSuccess(response, "getPropertyOwnerBookings");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getPropertyOwnerBookings");
  }
}

export async function getPropertyOwnerServices(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const organizationId = await getActiveOrganizationId();
    const query = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : "";
    const response = await safeFetch(`${url}/property-owner/fetch-services${query}`, {
      next: { tags: ["property-owner-services"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
    });
    await ensureApiSuccess(response, "getPropertyOwnerServices");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getPropertyOwnerServices");
  }
}

export async function getPropertyOwnerInvoices(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const organizationId = await getActiveOrganizationId();
    const query = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : "";
    const response = await safeFetch(`${url}/property-owner/fetch-invoices${query}`, {
      next: { tags: ["property-owner-invoices"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
    });
    await ensureApiSuccess(response, "getPropertyOwnerInvoices");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getPropertyOwnerInvoices");
  }
}

export async function getPropertyOwnerNotifications(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const organizationId = await getActiveOrganizationId();
    const query = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : "";
    const response = await safeFetch(`${url}/notification/fetch-notifications${query}`, {
      next: { tags: ["property-owner-notifications"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
    });
    await ensureApiSuccess(response, "getPropertyOwnerNotifications");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getPropertyOwnerNotifications");
  }
}

export async function getOwnerProperties(token) {
  const raw = await getRawToken(token);
  try {
    const response = await safeFetch(`${url}/property-owner/fetch-properties`, {
      headers: { Authorization: `Bearer ${raw}` },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getOwnerProperties");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getOwnerProperties");
  }
}

export async function getOwnerServiceById(token, id) {
  const raw = await getRawToken(token);
  try {
    const response = await safeFetch(
      `${url}/property-owner/fetch-service/${id}`,
      {
        headers: { Authorization: `Bearer ${raw}` },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getOwnerServiceById");
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getOwnerServiceById");
  }
}

/* ----------------------------------------------------------------
 * Service providers, saved items
 * ---------------------------------------------------------------- */

export async function getAllServiceProviders() {
  try {
    const response = await safeFetch(
      `${url}/service-provider/get-all-service-providers`
    );
    await ensureApiSuccess(response, "getAllServiceProviders");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getAllServiceProviders");
  }
}

export async function getServiceProviderById(id) {
  try {
    const response = await safeFetch(
      `${url}/service-provider/get-service-provider/${id}`
    );
    await ensureApiSuccess(response, "getServiceProviderById");
    const { serviceProvider } = await response.json();
    return serviceProvider || null;
  } catch (error) {
    throw toDataServiceError(error, "getServiceProviderById");
  }
}

export async function getSavedPropertyById(token, id) {
  const raw = await getRawToken(token);
  try {
    const response = await safeFetch(
      `${url}/user-property/saved-properties/${id}`,
      {
        headers: { Authorization: `Bearer ${raw}` },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getSavedPropertyById");
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getSavedPropertyById");
  }
}

export async function getServiceRequestById(token, id) {
  const raw = await getRawToken(token);
  try {
    const response = await safeFetch(`${url}/service/fetch-service/${id}`, {
      headers: { Authorization: `Bearer ${raw}` },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getServiceRequestById");
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getServiceRequestById");
  }
}

/* ----------------------------------------------------------------
 * Referrals
 * ---------------------------------------------------------------- */

export async function getReferralLeaderboard() {
  try {
    const response = await safeFetch(`${url}/user/fetch-leaderboard`);
    await logApiFailure(response, "getReferralLeaderboard");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.warn("Error fetching leaderboard:", error);
    return [];
  }
}

export async function getReferralDownline(referralCode) {
  try {
    const response = await safeFetch(
      `${url}/user/fetch-downline/${referralCode}`
    );
    await logApiFailure(response, "getReferralDownline");
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    console.warn("Error fetching downline:", error);
    return null;
  }
}

/* ----------------------------------------------------------------
 * Debug helper
 * ---------------------------------------------------------------- */

export async function debugFetch(urlStr) {
  try {
    const response = await safeFetch(urlStr);
    await logApiFailure(response, "debugFetch");
    const text = await response.text();
    return text;
  } catch (err) {
    console.warn("Debug Fetch Error:", urlStr, err);
    return null;
  }
}


/*
Listings


*/
export async function getListingById(id, passedToken) {
  if (!id) return [];
  const token = await getRawToken(passedToken);
  try {
    const response = await safeFetch(`${SERVICE_URL}/properties/${id}/listings?page=1&limit=20&sortBy=createdAt&sortOrder=desc`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getListingById");
    const payload = await safeJson(response);
    return payload?.data ?? payload?.listings ?? payload ?? [];
  } catch (error) {
    throw toDataServiceError(error, "getListingById");
  }
}

export async function getPublicListingsForProperty(propertyId) {
  if (!propertyId) return { listings: [], meta: null };
  try {
    const token = await getRawToken();
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const fetchPage = async (page) => {
      const response = await safeFetch(
        `${SERVICE_URL}/properties/${encodeURIComponent(propertyId)}/listings?page=${page}&limit=20&sortBy=createdAt&sortOrder=desc`,
        { method: "GET", headers, cache: "no-store" }
      );
      await logApiFailure(response, "getPublicListingsForProperty");
      if (!response.ok) return null;
      return safeJson(response);
    };
    const firstPage = await fetchPage(1);
    if (!firstPage) return { listings: [], meta: null };
    const extractListings = (payload) =>
      Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.listings)
          ? payload.listings
          : Array.isArray(payload?.data?.listings)
            ? payload.data.listings
            : Array.isArray(payload?.data?.records)
              ? payload.data.records
              : [];
    const listings = [...extractListings(firstPage)];
    const meta = firstPage.meta || firstPage.pagination || firstPage.data?.meta || firstPage.data?.pagination || null;
    const totalPages = Math.max(1, Number(meta?.totalPages) || 1);
    for (let page = 2; page <= totalPages; page += 1) {
      const payload = await fetchPage(page);
      listings.push(...extractListings(payload));
    }
    return { listings, meta };
  } catch (error) {
    console.warn("Error fetching public property listings:", error);
    return { listings: [], meta: null };
  }
}
export async function getSingleListing(id) {
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/listings/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getSingleListing");
    const json = await safeJson(response);
    return json?.data ?? json?.listing ?? json ?? null;
  } catch (error) {
    throw toDataServiceError(error, "getSingleListing");
  }
}

export async function getTrialPlans(){
   const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/subscription-plans/trial`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getTrialPlans");
    const data  = await safeJson(response);
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getTrialPlans");
  }
}

export async function getSubscriptionList(){
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/subscription-plans`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getSubscriptionList");
    const data  = await safeJson(response);
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getSubscriptionList");
  }
}

export async function getSubscriptionPlans(){
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/admin/subscription-plans?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getSubscriptionPlans");
    const { data } = await safeJson(response);
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getSubscriptionPlans");
  }
}

export async function getAccountSubscriptions(){
  const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/account/subscription`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getAccountSubscriptions");
    const data = await safeJson(response);
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getAccountSubscriptions");
  }
}

function normalizeOrganizationSubscription(rawSub, orgFallback = null) {
  const candidateList = Array.isArray(rawSub?.subscriptions)
    ? rawSub.subscriptions
    : Array.isArray(rawSub?.data?.subscriptions)
      ? rawSub.data.subscriptions
      : Array.isArray(orgFallback?.subscriptions)
        ? orgFallback.subscriptions
        : null;

  const activeFromList = candidateList
    ? candidateList.find((s) =>
        ["ACTIVE", "TRIALING", "TRIAL"].includes(
          String(s?.status || "").toUpperCase()
        )
      ) || candidateList[0]
    : null;

  const sub =
    rawSub?.subscription ??
    rawSub?.data?.subscription ??
    (rawSub?.data && typeof rawSub.data === "object" && !Array.isArray(rawSub.data) && (rawSub.data.status || rawSub.data.plan || rawSub.data.endDate)
      ? rawSub.data
      : null) ??
    (rawSub && typeof rawSub === "object" && (rawSub.status || rawSub.plan || rawSub.endDate) && !rawSub.name
      ? rawSub
      : null) ??
    orgFallback?.subscription ??
    orgFallback?.owner?.subscription ??
    activeFromList ??
    null;

  const explicitFlag =
    rawSub?.hasActiveSubscription ??
    rawSub?.isSubscriptionActive ??
    rawSub?.data?.hasActiveSubscription ??
    orgFallback?.hasActiveSubscription ??
    orgFallback?.isSubscriptionActive;

  const rawStatus =
    sub?.status ??
    rawSub?.subscriptionStatus ??
    rawSub?.data?.subscriptionStatus ??
    orgFallback?.subscriptionStatus ??
    orgFallback?.subscription_status ??
    (explicitFlag === true ? "ACTIVE" : "NONE");

  const statusUpper = String(rawStatus || "NONE").toUpperCase();
  const endDate = sub?.endDate || sub?.expiresAt || sub?.currentPeriodEnd || null;
  const isExpired = endDate ? new Date(endDate).getTime() < Date.now() : false;
  const isActive =
    explicitFlag === true
      ? !isExpired
      : (statusUpper === "ACTIVE" || statusUpper === "TRIALING" || statusUpper === "TRIAL") &&
        !isExpired;

  return {
    data: sub,
    plan: sub?.plan ?? orgFallback?.plan ?? null,
    status: rawStatus || "NONE",
    isActive,
    isExpired,
    endDate,
  };
}

export async function getOrganizationSubscription(organizationId, orgObject = null) {
  const cleanId = String(organizationId || orgObject?.id || "").trim();
  const token = await getRawToken();

  // 1. Check if the organization object already includes subscription details
  if (
    orgObject &&
    (orgObject.subscription ||
      Array.isArray(orgObject.subscriptions) ||
      orgObject.subscriptionStatus ||
      orgObject.subscription_status ||
      typeof orgObject.hasActiveSubscription === "boolean" ||
      typeof orgObject.isSubscriptionActive === "boolean")
  ) {
    const embedded = normalizeOrganizationSubscription(null, orgObject);
    if (embedded.isActive || embedded.data) {
      return embedded;
    }
  }

  if (!cleanId || !token) {
    return normalizeOrganizationSubscription(null, orgObject);
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // 2. Try dedicated organization subscription endpoint first
  try {
    const res = await safeFetch(
      `${SERVICE_URL}/organizations/${encodeURIComponent(cleanId)}/subscription`,
      { method: "GET", headers, cache: "no-store" }
    );
    if (res.ok) {
      const payload = await safeJson(res);
      if (payload) {
        return normalizeOrganizationSubscription(payload, orgObject);
      }
    }
  } catch {
    // fall through to next endpoint
  }

  // 3. Try full organization details endpoint (may embed subscription or owner.subscription)
  try {
    const res = await safeFetch(
      `${SERVICE_URL}/organizations/${encodeURIComponent(cleanId)}`,
      { method: "GET", headers, cache: "no-store" }
    );
    if (res.ok) {
      const payload = await safeJson(res);
      const orgData =
        payload?.organization ?? payload?.data?.organization ?? payload?.data ?? payload;
      if (
        orgData &&
        (orgData.subscription ||
          Array.isArray(orgData.subscriptions) ||
          orgData.subscriptionStatus ||
          orgData.subscription_status ||
          typeof orgData.hasActiveSubscription === "boolean" ||
          typeof orgData.isSubscriptionActive === "boolean" ||
          orgData.owner?.subscription)
      ) {
        return normalizeOrganizationSubscription(null, orgData);
      }
    }
  } catch {
    // fall through
  }

  // 4. Fallback: query /account/subscription?organizationId=...
  try {
    const res = await safeFetch(
      `${SERVICE_URL}/account/subscription?organizationId=${encodeURIComponent(cleanId)}`,
      { method: "GET", headers, cache: "no-store" }
    );
    if (res.ok) {
      const payload = await safeJson(res);
      if (payload) {
        return normalizeOrganizationSubscription(payload, orgObject);
      }
    }
  } catch {
    // fall through
  }

  return normalizeOrganizationSubscription(null, orgObject);
}

export async function getActiveOrganizationRole() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("organizationRole")?.value || "";
  } catch {
    return "";
  }
}


export async function getWallet() {
   const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/wallet`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getWallet");
    const data = await safeJson(response);
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getWallet");
  }
}

export async function getWalletTransactions() {
   const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/wallet/transactions?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getWalletTransactions");
    const data = await safeJson(response);
    return data || null;
  } catch (error) {
    throw toDataServiceError(error, "getWalletTransactions");
  }
}

export async function getVirtualAccounts() {
   const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/virtual-accounts`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getVirtualAccounts");
    const data = await safeJson(response);
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getVirtualAccounts");
  }
}

export async function getAdminVirtualAccounts(params = {}) {
   const token = await getRawToken();
   const page = params?.page || 1;
   const limit = params?.limit || 20;
   const sortBy = params?.sortBy || "createdAt";
   const sortOrder = params?.sortOrder || "desc";
   const searchParam = params?.search ? `&search=${encodeURIComponent(params.search)}` : "";
  try {
    const response = await safeFetch(`${SERVICE_URL}/admin/virtual-accounts?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}${searchParam}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getAdminVirtualAccounts");
    const data = await safeJson(response);
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getAdminVirtualAccounts");
  }
}

export async function getVirtualAccountById(id) {
   const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/virtual-accounts/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getVirtualAccountById");
    const data = await safeJson(response);
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getVirtualAccountById");
  }
}

export async function getAdminVirtualAccountById(id) {
   const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/admin/virtual-accounts/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getAdminVirtualAccountById");
    const data = await safeJson(response);
    console.log(data)
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getAdminVirtualAccountById");
  }
}

export async function getVirtualAccountTransactions(id) {
   const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/virtual-accounts/${encodeURIComponent(id)}/transactions`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getVirtualAccountTransactions");
    const data = await safeJson(response);
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getVirtualAccountTransactions");
  }
}

export async function getAdminVirtualAccountTransactions(id) {
   const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/admin/virtual-accounts/${encodeURIComponent(id)}/transactions`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getAdminVirtualAccountTransactions");
    const data = await safeJson(response);
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getAdminVirtualAccountTransactions");
  }
}

export async function getSubscriptionPayments(params = {}) {
   const token = await getRawToken();
   const page = params?.page || 1;
   const limit = params?.limit || 1000;
   const sortBy = params?.sortBy || "createdAt";
   const sortOrder = params?.sortOrder || "desc";
  try {
    const response = await safeFetch(`${SERVICE_URL}/admin/subscription-payments?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getSubscriptionPayments");
    const data = await safeJson(response);
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getSubscriptionPayments");
  }
}

export async function getSubscriptionPaymentById(id) {
   const token = await getRawToken();
  try {
    const response = await safeFetch(`${SERVICE_URL}/admin/subscription-payments/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    await ensureApiSuccess(response, "getSubscriptionPaymentById");
    const data = await safeJson(response);
    return data || [];
  } catch (error) {
    throw toDataServiceError(error, "getSubscriptionPaymentById");
  }
}


export async function getManagerDashboard(orgId) {
  const cookieStore = await cookies();
  const raw = await getRawToken();
  if (!raw) return null;

  const resolvedOrgId =
    orgId ||
    cookieStore.get("organizationId")?.value ||
    cookieStore.get("organization_id")?.value ||
    "";
  const query = resolvedOrgId
    ? `?organizationId=${encodeURIComponent(resolvedOrgId)}`
    : "";

  try {
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/dashboard/manager${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${raw}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getDashboard");
    const json = await safeJson(response);
    console.log("manager dashboard",json)

    return json?.data ?? json ?? null;
  } catch (error) {
    throw toDataServiceError(error, "getDashboard");
  }
}

export async function getOwnerDashboard(orgId) {
  const cookieStore = await cookies();
  const raw = await getRawToken();
  if (!raw) return null;

  const resolvedOrgId =
    orgId ||
    cookieStore.get("organizationId")?.value ||
    cookieStore.get("organization_id")?.value ||
    "";
  const query = resolvedOrgId
    ? `?organizationId=${encodeURIComponent(resolvedOrgId)}`
    : "";

  try {
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/dashboard/owner`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${raw}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getDashboard");
    const json = await safeJson(response);
    console.log("owner dashboard",json)
    return json?.data ?? json ?? null;
  } catch (error) {
    throw toDataServiceError(error, "getDashboard");
  }
}

export async function getTenantDashboard(orgId) {
  const cookieStore = await cookies();
  const raw = await getRawToken();
  if (!raw) return null;

  const resolvedOrgId =
    orgId ||
    cookieStore.get("organizationId")?.value ||
    cookieStore.get("organization_id")?.value ||
    "";
  const query = resolvedOrgId
    ? `?organizationId=${encodeURIComponent(resolvedOrgId)}`
    : "";

  try {
    const response = await safeFetch(
      `https://services.xpacy.com/api/v1/dashboard/tenant`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${raw}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );
    await ensureApiSuccess(response, "getDashboard");
    const json = await safeJson(response);
    console.log("tenant dashboard",json)

    return json?.data ?? json ?? null;
  } catch (error) {
    throw toDataServiceError(error, "getDashboard");
  }
}