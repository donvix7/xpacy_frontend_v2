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
  const response = await fetch(`${URL}/user/login`, {
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
    maxAge: 60 * 60 * 24, // 1 day
  });
  if (data.role === "User" || data.role === "user") redirect(redirectUrl)
  return { success: true, message: data.message }
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
  const response = await fetch(`${URL}/user/register?referralCode=${referralCode}`, {
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
  cookieStore.delete("token");
  redirect("/auth/log-in")
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
  const response = await fetch(`${URL}/user/update-profile`, {
    method: "PUT",
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


export async function submitInvoiceAction(invoice, token) {
  const payload = {
    recipientId: Number(invoice.recipientId),
    recipientType: "User",
    issuedDate: invoice.issuedDate.toISOString().split("T")[0],
    dueDate: invoice.dueDate.toISOString().split("T")[0],
    invoice_reason: invoice.invoiceReason,
    tax: Number(invoice.tax || 0),
    amountPaid: 0,
    total: Number(invoice.total || 0),
    items: invoice.items.map(item => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    })),
  }
  const res = await fetch(`${URL}/invoice/create-invoice`, {
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

export async function updateInvoice(id, invoiceData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await fetch(`${URL}/invoice/update-invoice/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(invoiceData)
  });
  return response.json();
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

export async function verifyPayment(reference) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await fetch(`${URL}/payment/paystack/verify?reference=${reference}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  return response.json();
}

export async function markNotificationRead(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await fetch(`${URL}/notification/mark-as-read/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
      "Content-Type": "application/json"
    }
  });
  return response.json();
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
  
  // Construct the payload
  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: "0000000000", // Required by endpoint but likely irrelevant for invite
    subject: "Invitation to Join Xpacy as Property Owner",
    message: formData.get("message") || "You have been invited to join Xpacy as a property owner. Please sign up to manage your properties."
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

export async function updateProperty(id, formData, token) {
  const response = await fetch(`${URL}/property/update-property/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token?.value}`,
    },
    body: formData
  });
  const data = await response.json();
  return data;
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