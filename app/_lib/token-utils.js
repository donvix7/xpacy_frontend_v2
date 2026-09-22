/**
 * Dispatches a client-side event indicating that the access token has expired.
 * This triggers the refresh popup modal from anywhere in the application.
 */
export function notifyTokenExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("xpacy:token-expired"));
  }
}

/**
 * Dispatches a client-side event indicating that the token was successfully refreshed.
 */
export function notifyTokenRefreshed(data) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("xpacy:token-refreshed", { detail: data }));
  }
}
