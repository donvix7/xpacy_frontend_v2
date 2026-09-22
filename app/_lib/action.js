"use server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"
import { revalidatePath, revalidateTag } from "next/cache";

const URL = "https://app.xpacy.com";

export const submitSubscribe = async (formData) => {
  const email = formData.get("email");
  const response = await fetch(`${URL}/newsletter/subscribe`, {
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
  redirect(`/search?purpose=${purpose}&type=${type}&state=${location}&minBedrooms=${minBedrooms}&minPrice=${minPrice}&maxPrice=${maxPrice}`)
}

export async function handleUserLogin(userData, redirectUrl) {
  const response = await fetch(`https://services.xpacy.com/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...userData }),
  });
  const data = await response.json();
  if (!response.ok) return { success: false, message: data.message };

  const cookieStore = await cookies();
  cookieStore.set("token", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
  cookieStore.set("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  if (data.role === "USER" || data.role === "user") redirect(redirectUrl);
  return { success: true, message: 'Logged in successfully' };
};

export async function handleAdminLogin(userData, redirectUrl) {
  const response = await fetch(`${URL}/admin/admin-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...userData }),
  });
  const data = await response.json();
  if (!response.ok) return { success: false, message: data.message }

  const cookieStore = await cookies();
  cookieStore.set("token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
  if (data.role === "Admin" || data.role === "admin") redirect(redirectUrl)
  return { success: true, message: data.message }
};

export async function handlePropertyOwnerLogin(userData, redirectUrl) {
  const response = await fetch(`${URL}/property-owner/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...userData }),
  });
  const data = await response.json();
  if (!response.ok) return { success: false, message: data.message }

  const cookieStore = await cookies();
  cookieStore.set("token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
  if (data.role === "PropertyOwner" || data.role === "property-owner") redirect(redirectUrl)
  return { success: true, message: data.message }
};


export async function handleSignup(userData, referralCode) {
  const payload = {
    firstName: userData.firstname,
    lastName: userData.lastname,
    phone: userData.phoneNumber,
    email: userData.email,
    password: userData.password,
  }
  //const response = await fetch(`${URL}/user/register?referralCode=${referralCode}`, {
  const response = await fetch(`https://services.xpacy.com/api/v1/auth/register`, {

    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  })
  const data = await response.json();
  console.log(data)

  if (!response.ok) return { success: false, message: data.message }

  return { success: true, message: data.message, user: data.user }
}

export async function handlePropertyOwnerSignup(userData, referralCode) {
  const response = await fetch(`${URL}/property-owner/register?referralCode=${referralCode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...userData })
  })
  const data = await response.json();

  if (!response.ok) return { success: false, message: data.message }

  return { success: true, message: data.message, user: data.user }
}

// ...existing imports...
import { headers } from "next/headers"

// ...

export async function handleCompleteOwnerRegistration(userData, token) {
  try {
    if (!token) return { success: false, message: "Token is missing" }

    const response = await fetch(`${URL}/property-owner/complete-registration?token=${token}`, {
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
  const response = await fetch(`${URL}/property-owner/resend-registration-email`, {
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

  const response = await fetch(`${URL}/user-property/saved-properties`, {
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
    const res = await fetch(`${URL}/user/create-booking`, {
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
  const response = await fetch(`${URL}/user-property/delete-saved-property/${savedPropertyId}`, {
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
    await fetch(`https://services.xpacy.com/api/v1/auth/logout`, {
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
  redirect("/auth/log-in");
}


export async function uploadDisplayPhoto(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) throw new Error("Please Log in to continue");
  const response = await fetch(`${URL}/user/upload-display-image`, {
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
  const response = await fetch(`https://services.xpacy.com/api/v1/users/${userData.id}`,
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

export async function updateUserPassword(userData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) throw new Error("Please Log in to continue");
  const response = await fetch(`${URL}/user/change-password`, {
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
    
    const response = await fetch(`${URL}/user/create-booking`, {
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
  const response = await fetch(`${URL}/service/request-service`, {
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
  const response = await fetch(`${URL}/contact/send-mail`, {
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
  const response = await fetch(`${URL}/admin/register-propertyowner`, {
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
  const res = await fetch(`https://services.xpacy.com/api/v1/invoices?organizationId=${organisationId}`, {
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




export async function cancelInvoice(id) {
  const cookieStore = await cookies();
const token = cookieStore.get("token");
  const res = await fetch(`https://services.xpacy.com/api/v1/invoices/${id}/cancel`, {
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
  const response = await fetch(`${URL}/payment/paystack/initialize`, {
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
  const res = await fetch(`https://services.xpacy.com/api/v1/payments/initialize`, {
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
  const res = await fetch(`https://services.xpacy.com/api/v1/payments/verify
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
  const response = await fetch(`${URL}/user/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  return data;
}

export async function resetPassword(token, newPassword) {
  const response = await fetch(`${URL}/user/reset-password`, {
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

  const response = await fetch(`${URL}/user/upload-kyc`, {
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
  const response = await fetch(`${URL}/property/add-featured-property/${propertyId}`, {
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
  const response = await fetch(`${URL}/property/remove-featured-property/${propertyId}`, {
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
  const response = await fetch(`${URL}/property/delete-property/${propertyId}`, {
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
  const response = await fetch(`${URL}/user/update-service/${serviceId}`, {
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
  const response = await fetch(`${URL}/user/cancel-service/${serviceId}`, {
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
  const response = await fetch(`${URL}/service-provider/create-service-provider`, {
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
  const response = await fetch(`${URL}/service-provider/update-service-provider/${id}`, {
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
  const response = await fetch(`${URL}/service-provider/delete-service-provider/${id}`, {
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
  const response = await fetch(`https://services.xpacy.com/api/v1/invoices/${invoiceId}
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
  const response = await fetch(`${URL}/invoice/delete-invoice/${id}`, {
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
  const response = await fetch(`https://services.xpacy.com/api/v1/invoices/${id}/issue`, {
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
  const response = await fetch(`https://services.xpacy.com/api/v1/invoices/${id}/cancel
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
  const response = await fetch(`https://services.xpacy.com/api/v1/notifications
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
  const response = await fetch(`https://services.xpacy.com/api/v1/notifications/broadcast
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
    const response = await fetch(`https://services.xpacy.com/api/v1/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token?.value}`,
      }
    });
    const { data } = await response.json();
    revalidatePath("/dashboard/user/notifications");
    return data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

export async function updatePropertyOwnerDisplayPicture(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await fetch(`${URL}/property-owner/upload-display-image`, {
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

  const response = await fetch(`${URL}/property-owner/update-profile`, {
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
  const response = await fetch(`${URL}/faq/create-faq`, {
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
  const response = await fetch(`${URL}/faq/update-faq/${id}`, {
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
  const response = await fetch(`${URL}/faq/delete-faq/${id}`, {
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

  const response = await fetch(`${URL}/contact/send-mail`, {
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
    subject: "Invitation to Join Xpacy as Property Manager",
    message: `${formData.get("message") || "You have been invited to join Xpacy as a property manager. Please sign up to start managing properties."}\n\nAccept your invitation here: ${origin}/auth/accept-invite?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
  };

  const response = await fetch(`${URL}/contact/send-mail`, {
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

  const response = await fetch(`${URL}/contact/send-mail`, {
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
  const response = await fetch(`${URL}/property/create-property`, {
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

    const response = await fetch(`https://services.xpacy.com/api/v1/properties`, {
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
    console.error("Error creating property:", error);
    return { success: false, message: error.message || "Failed to create property" };
  }
}


// Blog Actions
export async function createBlog(formData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    
    const response = await fetch(`${URL}/blog/create-post`, {
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

    const response = await fetch(`${URL}/blog/update-post/${id}`, {
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

    const response = await fetch(`${URL}/blog/delete-post/${id}`, {
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

    const response = await fetch(`https://services.xpacy.com/api/v1/auth/refresh`, {
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
    console.error("Error refreshing token:", error);
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
    console.error("Error checking token status:", error);
    return { isAuthenticated: false, isExpired: false, hasRefreshToken: false, expiresInMs: null, expiresAt: null };
  }
}

export async function getUserProfileAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token?.value) return null;

    const response = await fetch(`https://services.xpacy.com/api/v1/auth/profile`, {
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
    console.error("Error fetching user profile:", error);
    return null;
  }
}


export async function markAllAsRead() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token?.value) return [];
  try {
    const response = await fetch(`https://services.xpacy.com/api/v1/notifications/read-all`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token?.value}`,
      }
    });
    const { data } = await response.json();
    revalidatePath("/dashboard/user/notifications");
    return data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
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
  const response = await fetch(`https://services.xpacy.com/api/v1/documents
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
  const response = await fetch(`https://services.xpacy.com/api/v1/documents/${id}
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
  const response = await fetch(`https://services.xpacy.com/api/v1/properties

`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(propertyData)
  });
  return response.json(); 
}

export async function addOwner(payload){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await fetch(`https://services.xpacy.com/api/v1/owners
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

const response = await fetch(`https://services.xpacy.com/api/v1/expenses?organizationId=${organizationId}
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

const response = await fetch(`https://services.xpacy.com/api/v1/expenses/${id}
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

  const response = await fetch(`https://services.xpacy.com/api/v1/leases?organizationId=${organizationId}
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

  const response = await fetch(`https://services.xpacy.com/api/v1/leases/${id}

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
  const response = await fetch(`https://services.xpacy.com/api/v1/leases/${id}/activate?organizationId=${organizationId}

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
  const response = await fetch(`https://services.xpacy.com/api/v1/leases/${id}/terminate
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
  const response = await fetch(`https://services.xpacy.com/api/v1/tenants
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
  const response = await fetch(`https://services.xpacy.com/api/v1/tenants/${id}

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
  const response = await fetch(`https://services.xpacy.com/api/v1/tenants/${id}/link-user`,
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
  const response = await fetch(`https://services.xpacy.com/api/v1/properties/${propertyId}/maintenance
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
  const response = await fetch(`https://services.xpacy.com/api/v1/maintenance/${id}
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
  const response = await fetch(`https://services.xpacy.com/api/v1/maintenance/${id}/assign
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
  const response = await fetch(`https://services.xpacy.com/api/v1/maintenance/${id}/comments
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
  const response = await fetch(`https://services.xpacy.com/api/v1/properties/${propertyId}/units
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
  const response = await fetch(`https://services.xpacy.com/api/v1/units/${id}
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

export async function deleteUnit(id){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await fetch(`https://services.xpacy.com/api/v1/units/${id}`,
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
  const response = await fetch(`https://services.xpacy.com/api/v1/properties/${propertyId}/buildings
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

export async function updateBuilding(id,data){
  
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const payload = {
  "name": data.name,
  "description": data.description,
  "totalFloors": Number(data.totalFloors)
}
  const response = await fetch(`https://services.xpacy.com/api/v1/buildings/${id}
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

export async function deleteBuilding(id){
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await fetch(`https://services.xpacy.com/api/v1/buildings/${id}`,
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
  const response = await fetch(`https://services.xpacy.com/api/v1/owners
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
  const response = await fetch(`https://services.xpacy.com/api/v1/owners/2`,
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
  const response = await fetch(`https://services.xpacy.com/api/v1/owners/${id}`,
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
  const response = await fetch(`https://services.xpacy.com/api/v1/owners/${id}/link-user
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
  const response = await fetch(`https://services.xpacy.com/api/v1/owners/${id}/unlink-to-user`,
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
  const response = await fetch(`https://services.xpacy.com/api/v1/users/${id}`,
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
  const response = await fetch(`https://services.xpacy.com/api/v1/organizations
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
  const response = await fetch(`https://services.xpacy.com/api/v1/organizations/${id}`,
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
  const response = await fetch(`https://services.xpacy.com/api/v1/properties
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
  const response = await fetch(`https://services.xpacy.com/api/v1/properties/${id}`,
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
  const response = await fetch(`https://services.xpacy.com/api/v1/properties/${id}`,
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
  const response = await fetch(`https://services.xpacy.com/api/v1/properties/${id}/managers`,
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
  const response = await fetch(`https://services.xpacy.com/api/v1/properties/${id}/managers/${managerId}`,
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
  const response = await fetch(`https://services.xpacy.com/api/v1/properties/${id}/owners
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