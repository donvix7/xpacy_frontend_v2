import { cookies } from "next/headers";

import { url } from "./constants";
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
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || null;
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
    const response = await fetch(`${url}/settings/homepage-sliders`);
    if (!response.ok) return [];
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

export async function getFaqs() {
  try {
    const response = await fetch(`${url}/faq/get-all-faqs`);
    if (!response.ok) return [];
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching faqs:", error);
    return [];
  }
}

export async function getFaqById(id) {
  try {
    const response = await fetch(`${url}/faq/get-faq/${id}`);
    const { faq } = await response.json();
    return faq || null;
  } catch (error) {
    console.error("Error fetching faq:", error);
    return null;
  }
}

/* ----------------------------------------------------------------
 * Properties (public)
 * ---------------------------------------------------------------- */

export async function getFeaturedProperties() {
  try {
    const response = await fetch(`${url}/property/fetch-featured-properties`);
    if (!response.ok) return [];
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    return [];
  }
}

export async function getRentProperties() {
  try {
    const response = await fetch(`${url}/property/fetch-properties?purpose=rent`);
    const { properties, pagination } = await response.json();
    return [properties, pagination];
  } catch (error) {
    console.error("Error fetching rent properties:", error);
    return [[], {}];
  }
}

export async function getProperties(search = {}) {
  const apiUrl = `${url}/property/fetch-properties?${new URLSearchParams(search)}`;
  try {
    const response = await fetch(apiUrl);
    const { properties, pagination } = await response.json();
    return [properties, pagination];
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [[], {}];
  }
}

export async function getLatestProperties() {
  try {
    const response = await fetch(`${url}/property/fetch-properties?limit=5`);
    const { properties } = await response.json();
    return properties;
  } catch (error) {
    console.error("Error fetching latest properties:", error);
    return [];
  }
}

export async function getProperty(id) {
  try {
    const response = await fetch(`${url}/property/fetch-property/${id}`);
    const { property } = await response.json();
    return property;
  } catch (error) {
    console.error("Error fetching property:", error);
    return null;
  }
}

export async function getOtherProperties() {
  try {
    const response = await fetch(`${url}/property/fetch-properties?limit=6`);
    const { properties } = await response.json();
    return properties;
  } catch (error) {
    console.error("Error fetching other properties:", error);
    return [];
  }
}

export async function getCities() {
  try {
    const response = await fetch(`${url}/location/fetch-states`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const { state } = await response.json();
    return state;
  } catch (error) {
    console.error("Error fetching states:", error);
    return [];
  }
}

/* ----------------------------------------------------------------
 * Blogs
 * ---------------------------------------------------------------- */

export async function getBlogs() {
  try {
    const response = await fetch(`${url}/blog/all-posts`);
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export async function getBlog(id) {
  try {
    const response = await fetch(`${url}/blog/post/${id}`);
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

export async function getBlogCategories() {
  try {
    const response = await fetch(`${url}/blog/all-categories`);
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return [];
  }
}

/* ----------------------------------------------------------------
 * User profile & auth
 * ---------------------------------------------------------------- */

export async function getUserProfile(passedToken) {
  const token = await getRawToken(passedToken);
  if (!token) return null;
  try {
    const response = await fetch(`${SERVICE_URL}/auth/profile`, {
      next: { tags: ["user-profile"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      if (![400, 401, 403].includes(response.status)) {
        console.error(`Error fetching user profile: ${response.status}`);
      }
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function getPropertyOwnerProfile(token) {
  const raw = await getRawToken(token);
  if (!raw) return null;
  try {
    const response = await fetch(`${url}/property-owner/fetch-profile`, {
      next: { tags: ["property-owner-profile"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      if (![401, 403].includes(response.status)) {
        console.error(
          "Failed to fetch property owner profile:",
          response.status,
          response.statusText
        );
      }
      return null;
    }
    const data = await response.json();
    return data.owner || data.user || data.data || data;
  } catch (error) {
    console.error("Error fetching property owner profile:", error);
    return null;
  }
}

export async function getPropertyOwnerInfo(tokenKey) {
  try {
    const response = await fetch(
      `${url}/property-owner/fetch-owner-information?token=${tokenKey}`
    );
    const { property_owner } = await response.json();
    return property_owner || null;
  } catch (error) {
    console.error("Error fetching owner info:", error);
    return null;
  }
}

/* ----------------------------------------------------------------
 * User dashboard — saved, notifications, services, bookings
 * ---------------------------------------------------------------- */

export async function getSavedProperties() {
  const token = await getRawToken();
  if (!token) return { data: [], pagination: {} };
  try {
    const response = await fetch(`${url}/user-property/saved-properties`, {
      next: { tags: ["saved-properties"] },
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data, pagination } = await response.json();
    return { data: data || [], pagination: pagination || {} };
  } catch (error) {
    console.error("Error fetching saved properties:", error);
    return { data: [], pagination: {} };
  }
}

export async function getUnreadNotificationsCount(passedToken) {
  const token = await getRawToken(passedToken);
  if (!token) return 0;
  try {
    const response = await fetch(
      `${SERVICE_URL}/notifications/unread-count`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) return 0;
    const resData = await response.json();
    if (typeof resData?.data === "number") return resData.data;
    if (typeof resData?.data?.count === "number") return resData.data.count;
    if (typeof resData?.count === "number") return resData.count;
    if (typeof resData?.unreadCount === "number") return resData.unreadCount;
    if (typeof resData === "number") return resData;
    return 0;
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    return 0;
  }
}
export async function getUserNotifications() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token?.value) return [];
    try {
        const response = await fetch(
            `https://services.xpacy.com/api/v1/notifications?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
                cache: "no-store",
            }
        );
        if (!response.ok) return [];
        console.log(response)
        const json = await response.json();

        // Normalize common API envelope shapes
        if (Array.isArray(json)) return json;
        if (Array.isArray(json?.data)) return json.data;
        if (Array.isArray(json?.notifications)) return json.notifications;
        if (Array.isArray(json?.data?.notifications)) return json.data.notifications;

        return [];
    } catch (error) {
        console.error("Error fetching user notifications:", error);
        return [];
    }
}

export async function getBookedServices(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const response = await fetch(`${url}/user/fetch-services`, {
      next: { tags: ["booked-services"] },
      method: "GET",
      headers: { Authorization: `Bearer ${raw}` },
    });
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching user booked services:", error);
    return [];
  }
}

export async function getRentedProperties() {
  const token = await getRawToken();
  if (!token) return [];
  try {
    const response = await fetch(
      `${SERVICE_URL}/me/rented-properties?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching rented properties:", error);
    return [];
  }
}

export async function getBookingList() {
  const token = await getRawToken();
  if (!token) return [];
  try {
    const response = await fetch(`${url}/user/fetch-bookings`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

export async function getBookingSlots() {
  try {
    const response = await fetch(`${url}/bookings/fetch-slots`);
    const { slots } = await response.json();
    return slots || [];
  } catch (error) {
    console.error("Error fetching booking slots:", error);
    return [];
  }
}

export async function getBookingById(token, id) {
  const raw = await getRawToken(token);
  try {
    const response = await fetch(`${url}/user/fetch-booking/${id}`, {
      headers: { Authorization: `Bearer ${raw}` },
    });
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    console.error("Error fetching booking:", error);
    return null;
  }
}

/* ----------------------------------------------------------------
 * Invoices & payments
 * ---------------------------------------------------------------- */

export async function getInvoice(id) {
  const token = await getRawToken();
  if (!token) return null;
  try {
    const response = await fetch(`${SERVICE_URL}/invoices/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
}

export async function getInvoiceById(id) {
  const token = await getRawToken();
  if (!token) return null;
  try {
    const response = await fetch(`${SERVICE_URL}/invoices/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Invoice ${id} endpoint not found (404).`);
      } else {
        console.error(`Error fetching invoice ${id}: ${response.status}`);
      }
      return null;
    }
    const data = await safeJson(response);
    return data?.data || data?.invoice || data;
  } catch (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    return null;
  }
}

export async function getAllInvoices(organizationId, passedToken) {
  const token = await getRawToken(passedToken);
  if (!token) return [];
  try {
    const response = await fetch(
      `${SERVICE_URL}/invoices?organizationId=${organizationId}&page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching all invoices:", error);
    return [];
  }
}

export async function getInvoiceList() {
  const token = await getRawToken();
  if (!token) return [];
  try {
    const response = await fetch(`${url}/user/fetch-invoices`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    const data = await safeJson(response);
    return toArray(data);
  } catch (error) {
    console.error("Error fetching user invoices:", error);
    return [];
  }
}

export async function getPaymentById(id) {
  const token = await getRawToken();
  try {
    const response = await fetch(`${SERVICE_URL}/payments/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const { data } = await response.json();
    return data || null;
  } catch (err) {
    console.error("Error fetching payment:", err);
    return null;
  }
}

export async function getPaymentsForInvoice(invoiceId) {
  const token = await getRawToken();
  try {
    const response = await fetch(`${SERVICE_URL}/payments/${invoiceId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.error("Error fetching payments for invoice:", err);
    return [];
  }
}

/* ----------------------------------------------------------------
 * Leases, tenants, units, buildings, owners (management)
 * ---------------------------------------------------------------- */

export async function getLeases() {
  const token = await getRawToken();
  if (!token) return [];
  try {
    const response = await fetch(
      `${SERVICE_URL}/me/leases?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching user leases:", error);
    return [];
  }
}

export async function getAllLeases() {
  const token = await getRawToken();
  try {
    const response = await fetch(
      `${SERVICE_URL}/leases?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getLeaseById(id) {
  const token = await getRawToken();
  try {
    const response = await fetch(`${SERVICE_URL}/leases/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const { data } = await response.json();
    return data || null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getAllTenants() {
  const token = await getRawToken();
  try {
    const response = await fetch(
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
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getTenantById(id) {
  const token = await getRawToken();
  try {
    const response = await fetch(`${SERVICE_URL}/tenants/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const { data } = await response.json();
    return data || null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getAllUnits(propertyId) {
  const token = await getRawToken();
  try {
    const response = await fetch(
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
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getUnitById(id) {
  const token = await getRawToken();
  try {
    const response = await fetch(`${SERVICE_URL}/units/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const { data } = await response.json();
    return data || null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getAllBuildings(propertyId) {
  const token = await getRawToken();
  try {
    const response = await fetch(
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
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getBuildingById(propertyId, id) {
  const token = await getRawToken();
  try {
    const response = await fetch(`${SERVICE_URL}/buildings/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const { data } = await response.json();
    return data || null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getAllPropertyOwners() {
  const token = await getRawToken();
  try {
    const response = await fetch(
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
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getPropertyOwnerById(id) {
  const token = await getRawToken();
  try {
    const response = await fetch(`${SERVICE_URL}/owners/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const { data } = await response.json();
    return data || null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

/* ----------------------------------------------------------------
 * Maintenance, expenses, documents
 * ---------------------------------------------------------------- */

export async function getAllMaintenanceRequest(propertyId) {
  const token = await getRawToken();
  try {
    const response = await fetch(
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
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getMaintenanceById(id) {
  const token = await getRawToken();
  try {
    const response = await fetch(`${SERVICE_URL}/maintenance/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const { data } = await response.json();
    return data || null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getAllExpenses(organisationId) {
  const token = await getRawToken();
  try {
    const response = await fetch(
      `${SERVICE_URL}/expenses?organizationId=${organisationId}&page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getExpenseById(id) {
  const token = await getRawToken();
  try {
    const response = await fetch(`${SERVICE_URL}/expenses/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const { data } = await response.json();
    return data || null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getAllDocuments() {
  const token = await getRawToken();
  const response = await fetch(
    `${SERVICE_URL}/documents?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );
  return response.json();
}

export async function getDocumentById(id) {
  const token = await getRawToken();
  const response = await fetch(`${SERVICE_URL}/documents/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  return response.json();
}

/* ----------------------------------------------------------------
 * Organizations, users, members
 * ---------------------------------------------------------------- */

export async function getAllOrganization() {
  const token = await getRawToken();
  try {
    const response = await fetch(
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
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getOrganizationById(id) {
  const token = await getRawToken();
  try {
    const response = await fetch(`${SERVICE_URL}/organizations/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const { data } = await response.json();
    return data || null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getOrganizationMembers(id) {
  const token = await getRawToken();
  try {
    const response = await fetch(
      `${SERVICE_URL}/organizations/${id}/members?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getAllUsers() {
  const token = await getRawToken();
  try {
    const response = await fetch(
      `${SERVICE_URL}/users?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );
    console.log(response)

    if (!response.ok) {
      if (response.status === 404) {
        console.warn("Fetch users endpoint not found (404).");
      } else if (![401, 403].includes(response.status)) {
        console.error(`Error fetching users: ${response.status}`);
      }
      return [];
    }
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function getUserById(id) {
  const token = await getRawToken();
  try {
    const response = await fetch(`${SERVICE_URL}/users/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const { data } = await response.json();
    return data || null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

/* ----------------------------------------------------------------
 * Property management (organizations)
 * ---------------------------------------------------------------- */

export async function getOrganizationProperties(organizationId) {
  const token = await getRawToken();
  try {
    const response = await fetch(
      `${SERVICE_URL}/properties?organizationId=${organizationId}&page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getPropertyById(id) {
  const token = await getRawToken();
  try {
    const response = await fetch(`${SERVICE_URL}/properties/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    console.log("Response from getPropertyById", response)
    const { data } = await response.json();
    return data || null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getMyProperties() {
  const token = await getRawToken();
  try {
    const response = await fetch(
      `${SERVICE_URL}/me/owned-properties?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getManagedProperties() {
  const token = await getRawToken();
  try {
    const response = await fetch(
      `${SERVICE_URL}/me/managed-properties?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getMyRentedProperties() {
  const token = await getRawToken();
  try {
    const response = await fetch(
      `${SERVICE_URL}/me/rented-properties?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getMyLeases() {
  const token = await getRawToken();
  try {
    const response = await fetch(
      `${SERVICE_URL}/me/leases?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getMyBookings() {
  const token = await getRawToken();
  try {
    const response = await fetch(
      `${SERVICE_URL}/me/bookings?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const { data } = await response.json();
    return data || [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

/* ----------------------------------------------------------------
 * Admin — profile, properties, services, bookings, users
 * ---------------------------------------------------------------- */

export async function getAdminProfile(token) {
  const raw = await getRawToken(token);
  if (!raw) return null;
  try {
    const response = await fetch(`${url}/admin/fetch-admin-profile`, {
      next: { tags: ["admin-profile"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      if (![401, 403].includes(response.status)) {
        console.error(`Error fetching admin profile: ${response.status}`);
      }
      return null;
    }
    const { admin } = await response.json();
    return admin;
  } catch (error) {
    console.error("Error fetching admin profile (catch):", error);
    return null;
  }
}

export async function getAdminProperties(token, searchParams = {}) {
  const raw = await getRawToken(token);
  if (!raw) return { properties: [], pagination: {} };

  let paramsObj = {};
  if (typeof searchParams === "string" || typeof searchParams === "number") {
    paramsObj.page = searchParams;
  } else {
    paramsObj = searchParams || {};
  }

  const params = new URLSearchParams({
    page: paramsObj.page || 1,
    ...(paramsObj.limit && { limit: paramsObj.limit }),
    ...(paramsObj.location && { location: paramsObj.location }),
    ...(paramsObj.status && { status: paramsObj.status }),
    ...(paramsObj.type && { type: paramsObj.type }),
    ...(paramsObj.minPrice && { minPrice: paramsObj.minPrice }),
    ...(paramsObj.maxPrice && { maxPrice: paramsObj.maxPrice }),
  });

  try {
    const response = await fetch(
      `${url}/admin/fetch-all-propreties?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${raw}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      const text = await response.text();
      console.error(
        `Error fetching admin properties: ${response.status} ${response.statusText}`,
        text.slice(0, 100)
      );
      return { properties: [], pagination: {} };
    }
    const { properties, pagination } = await response.json();
    return { properties: properties || [], pagination: pagination || {} };
  } catch (error) {
    console.error("Error fetching admin properties (catch):", error);
    return { properties: [], pagination: {} };
  }
}

export async function getAdminServices(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const response = await fetch(`${url}/service/fetch-services`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      const text = await response.text();
      console.error(
        `Error fetching admin services: ${response.status} ${response.statusText}`,
        text.slice(0, 100)
      );
      return [];
    }
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching admin services (catch):", error);
    return [];
  }
}

export async function getAdminServiceById(token, id) {
  const raw = await getRawToken(token);
  if (!raw) return null;
  try {
    const response = await fetch(`${url}/service/fetch-service/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      if (response.status !== 404) {
        const text = await response.text();
        console.error(
          `Error fetching admin service: ${response.status} ${response.statusText}`,
          text.slice(0, 100)
        );
      }
      return null;
    }
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    console.error("Error fetching admin service (catch):", error);
    return null;
  }
}

export async function getPropertyOwner(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const response = await fetch(
      `${url}/admin/property-owner/fetch-propertowners`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${raw}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(
          "Property owners endpoint not found (404). Returning empty list."
        );
      } else {
        console.error(`Error fetching property owners: ${response.status}`);
      }
      return [];
    }
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching property owner (catch):", error);
    return [];
  }
}

export async function getPropertyOwnerProperties(token, searchParams = {}) {
  const raw = await getRawToken(token);
  if (!raw) return [[], {}];

  let paramsObj = {};
  if (typeof searchParams === "string" || typeof searchParams === "number") {
    paramsObj.page = searchParams;
  } else {
    paramsObj = searchParams || {};
  }

  const params = new URLSearchParams({
    ...(paramsObj.page && { page: paramsObj.page }),
    ...(paramsObj.limit && { limit: paramsObj.limit }),
  });

  try {
    const urlStr = params.toString()
      ? `${url}/property-owner/fetch-properties?${params.toString()}`
      : `${url}/property-owner/fetch-properties`;
    const response = await fetch(urlStr, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) return [[], {}];
    const { properties, pagination } = await response.json();
    return [properties || [], pagination || {}];
  } catch (error) {
    console.error("Error fetching property-owner properties:", error);
    return [[], {}];
  }
}

export async function getAllAdmin(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const response = await fetch(`${url}/admin/fetch-admin`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      if (![401, 403].includes(response.status)) {
        console.error(`Error fetching admins: ${response.status}`);
      }
      return [];
    }
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error(`Error in getAllAdmin: ${url}/admin/fetch-admin`, error);
    return [];
  }
}

export async function getAdminBooking(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const response = await fetch(`${url}/admin/fetch-bookings`, {
      next: { tags: ["admin-bookings"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(
          "Admin bookings endpoint not found (404). Returning empty list."
        );
      } else {
        console.error(
          "Failed to fetch admin bookings:",
          response.status,
          response.statusText
        );
      }
      return [];
    }
    const json = await response.json();
    return toArray(json);
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    return [];
  }
}

export async function getAdminBookingById(token, id) {
  const raw = await getRawToken(token);
  if (!raw) return null;
  try {
    const response = await fetch(`${url}/admin/fetch-booking/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.booking || data.data || null;
  } catch (error) {
    console.error("Error fetching admin booking:", error);
    return null;
  }
}

export async function getAdminServiceProviders(token) {
  const raw = await getRawToken(token);
  try {
    const response = await fetch(`${url}/admin/service-providers`, {
      headers: { Authorization: `Bearer ${raw}` },
      cache: "no-store",
    });
    const { serviceProviders } = await response.json();
    return serviceProviders || [];
  } catch (error) {
    console.error("Error fetching admin service providers:", error);
    return [];
  }
}

export async function getAdminServiceProviderById(token, id) {
  const raw = await getRawToken(token);
  try {
    const response = await fetch(`${url}/admin/service-provider/${id}`, {
      headers: { Authorization: `Bearer ${raw}` },
      cache: "no-store",
    });
    const { serviceProvider } = await response.json();
    return serviceProvider || null;
  } catch (error) {
    console.error("Error fetching admin service provider:", error);
    return null;
  }
}

/* ----------------------------------------------------------------
 * Property owner (dashboard)
 * ---------------------------------------------------------------- */

export async function getPropertyOwnerBookings(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const response = await fetch(`${url}/property-owner/fetch-bookings`, {
      next: { tags: ["property-owner-bookings"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(
          "Property owner bookings endpoint not found (404). Returning empty list."
        );
      } else {
        console.error(
          "Failed to fetch property owner bookings:",
          response.status,
          response.statusText
        );
      }
      return [];
    }
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching property owner bookings:", error);
    return [];
  }
}

export async function getPropertyOwnerServices(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const response = await fetch(`${url}/property-owner/fetch-services`, {
      next: { tags: ["property-owner-services"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(
          "Property owner services endpoint not found (404). Returning empty list."
        );
      } else {
        console.error(
          "Failed to fetch property owner services:",
          response.status,
          response.statusText
        );
      }
      return [];
    }
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching property owner services:", error);
    return [];
  }
}

export async function getPropertyOwnerInvoices(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const response = await fetch(`${url}/property-owner/fetch-invoices`, {
      next: { tags: ["property-owner-invoices"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(
          "Property owner invoices endpoint not found (404). Returning empty list."
        );
      } else {
        console.error(
          "Failed to fetch property owner invoices:",
          response.status,
          response.statusText
        );
      }
      return [];
    }
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching property owner invoices:", error);
    return [];
  }
}

export async function getPropertyOwnerNotifications(token) {
  const raw = await getRawToken(token);
  if (!raw) return [];
  try {
    const response = await fetch(`${url}/notification/fetch-notifications`, {
      next: { tags: ["property-owner-notifications"] },
      method: "GET",
      headers: {
        Authorization: `Bearer ${raw}`,
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(
          "Property owner notifications endpoint not found (404). Returning empty list."
        );
      } else {
        console.error(
          "Failed to fetch property owner notifications:",
          response.status,
          response.statusText
        );
      }
      return [];
    }
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching property owner notifications:", error);
    return [];
  }
}

export async function getOwnerProperties(token) {
  const raw = await getRawToken(token);
  try {
    const response = await fetch(`${url}/property-owner/fetch-properties`, {
      headers: { Authorization: `Bearer ${raw}` },
      cache: "no-store",
    });
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching owner properties:", error);
    return [];
  }
}

export async function getOwnerServiceById(token, id) {
  const raw = await getRawToken(token);
  try {
    const response = await fetch(
      `${url}/property-owner/fetch-service/${id}`,
      {
        headers: { Authorization: `Bearer ${raw}` },
        cache: "no-store",
      }
    );
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    console.error("Error fetching owner service:", error);
    return null;
  }
}

/* ----------------------------------------------------------------
 * Service providers, saved items
 * ---------------------------------------------------------------- */

export async function getAllServiceProviders() {
  try {
    const response = await fetch(
      `${url}/service-provider/get-all-service-providers`
    );
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching service providers:", error);
    return [];
  }
}

export async function getServiceProviderById(id) {
  try {
    const response = await fetch(
      `${url}/service-provider/get-service-provider/${id}`
    );
    const { serviceProvider } = await response.json();
    return serviceProvider || null;
  } catch (error) {
    console.error("Error fetching service provider:", error);
    return null;
  }
}

export async function getSavedPropertyById(token, id) {
  const raw = await getRawToken(token);
  try {
    const response = await fetch(
      `${url}/user-property/saved-properties/${id}`,
      {
        headers: { Authorization: `Bearer ${raw}` },
        cache: "no-store",
      }
    );
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    console.error("Error fetching saved property:", error);
    return null;
  }
}

export async function getServiceRequestById(token, id) {
  const raw = await getRawToken(token);
  try {
    const response = await fetch(`${url}/service/fetch-service/${id}`, {
      headers: { Authorization: `Bearer ${raw}` },
      cache: "no-store",
    });
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    console.error("Error fetching service request:", error);
    return null;
  }
}

/* ----------------------------------------------------------------
 * Referrals
 * ---------------------------------------------------------------- */

export async function getReferralLeaderboard() {
  try {
    const response = await fetch(`${url}/user/fetch-leaderboard`);
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}

export async function getReferralDownline(referralCode) {
  try {
    const response = await fetch(
      `${url}/user/fetch-downline/${referralCode}`
    );
    const { data } = await response.json();
    return data || null;
  } catch (error) {
    console.error("Error fetching downline:", error);
    return null;
  }
}

/* ----------------------------------------------------------------
 * Debug helper
 * ---------------------------------------------------------------- */

export async function debugFetch(urlStr) {
  try {
    const response = await fetch(urlStr);
    const text = await response.text();
    console.log("Debug Fetch Response:", urlStr, text.slice(0, 500));
    return text;
  } catch (err) {
    console.error("Debug Fetch Error:", urlStr, err);
    return null;
  }
}