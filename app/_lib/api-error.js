import { safeFetch } from "./safe-fetch";

const DEFAULT_ERROR_MESSAGE = "The request failed. Please try again.";
const NETWORK_ERROR_MESSAGE = "The service is temporarily unavailable. Please try again.";

const STATUS_MESSAGES = {
  400: "The request could not be completed. Please check the details and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to access this resource.",
  404: "The requested record could not be found.",
  409: "This record conflicts with existing data. Please review it and try again.",
  422: "Some of the details are invalid. Please check them and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "The service ran into a problem. Please try again.",
  502: "The service is temporarily unavailable. Please try again.",
  503: "The service is temporarily unavailable. Please try again.",
  504: "The service took too long to respond. Please try again.",
};

/**
 * Error thrown when the Xpacy API rejects a request. Carries the message the
 * API returned along with the HTTP status so callers can decide how to react.
 */
export class DataServiceError extends Error {
  constructor(message, { status = 0, context = "", payload = null, cause } = {}) {
    super(message || DEFAULT_ERROR_MESSAGE);
    this.name = "DataServiceError";
    this.status = Number(status) || 0;
    this.context = context;
    this.payload = payload;
    if (cause) this.cause = cause;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

/** Pull the first readable message out of any API error shape. */
function firstMessage(value) {
  if (value === null || value === undefined || value === false) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value !== "object") return "";
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstMessage(item);
      if (message) return message;
    }
    return "";
  }
  const knownKeys = ["message", "msg", "error", "detail", "reason", "description", "title"];
  for (const key of knownKeys) {
    const message = firstMessage(value[key]);
    if (message) return message;
  }
  // Field-level maps such as { email: ["The email is already taken."] }
  for (const item of Object.values(value)) {
    const message = firstMessage(item);
    if (message) return message;
  }
  return "";
}

const GENERIC_REASON_PHRASES = new Set([
  "bad request",
  "unauthorized",
  "forbidden",
  "not found",
  "internal server error",
  "not implemented",
  "bad gateway",
  "service unavailable",
  "gateway timeout",
  "conflict",
  "unprocessable entity",
  "too many requests",
  "request failed",
  "error",
]);

/**
 * Choose the most useful message for a failed response. Prefers whatever the
 * API sent, then falls back to a status-specific hint.
 */
export function getApiErrorMessage(payload, response) {
  const apiMessage = firstMessage([
    typeof payload === "string" ? payload : "",
    payload?.message,
    payload?.msg,
    payload?.error,
    payload?.errors,
    payload?.detail,
    payload?.reason,
    payload?.data?.message,
    payload?.data?.error,
    payload?.data?.errors,
  ]);
  if (apiMessage && !GENERIC_REASON_PHRASES.has(apiMessage.toLowerCase())) return apiMessage;

  const status = Number(response?.status) || 0;
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  if (status === 0) return NETWORK_ERROR_MESSAGE;

  const statusText = typeof response?.statusText === "string" ? response.statusText.trim() : "";
  if (statusText && statusText.toLowerCase() !== NETWORK_ERROR_MESSAGE.toLowerCase()) {
    return `${statusText}${status ? ` (${status})` : ""}`;
  }
  return DEFAULT_ERROR_MESSAGE;
}

export function isApiFailure(response, payload) {
  return !response?.ok || payload?.success === false;
}

/** Read the body once; `safeFetch` memoises the text so this is cheap. */
export async function readApiPayload(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function assertApiSuccess(response, payload, context) {
  if (!isApiFailure(response, payload)) return payload;

  const error = new DataServiceError(getApiErrorMessage(payload, response), {
    status: response?.status,
    context,
    payload,
  });

  // `next build` prerenders pages before cookies force them dynamic. Keep the
  // build resilient when the API is unreachable; the browser request will
  // still surface the error at runtime.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    console.warn(`${context}: ${error.status ? `[${error.status}] ` : ""}${error.message}`);
    return payload;
  }

  throw error;
}

/**
 * Throw a `DataServiceError` when the response is not successful. Returns the
 * parsed payload otherwise so callers can keep using their existing shapes.
 */
export async function ensureApiSuccess(response, context) {
  const payload = await readApiPayload(response);
  return assertApiSuccess(response, payload, context);
}

/** Log a failed response without throwing. Returns true when it failed. */
export async function logApiFailure(response, context) {
  const payload = await readApiPayload(response);
  if (!isApiFailure(response, payload)) return false;
  const error = new DataServiceError(getApiErrorMessage(payload, response), {
    status: response?.status,
    context,
    payload,
  });
  console.warn(`${context}: ${error.status ? `[${error.status}] ` : ""}${error.message}`);
  return true;
}

/**
 * Collect readable messages from `Promise.allSettled` results. Pages use this
 * to keep rendering partial data while still showing what failed.
 */
export function getSettledErrorMessages(results = []) {
  const messages = [];
  for (const result of results) {
    if (result?.status !== "rejected") continue;
    const message = toDataServiceError(result.reason).message;
    if (message && !messages.includes(message)) messages.push(message);
  }
  return messages;
}

/** Wrap unknown errors so every failure carries a readable message. */
export function toDataServiceError(error, context) {
  if (error instanceof DataServiceError) return error;
  return new DataServiceError(firstMessage(error?.message) || DEFAULT_ERROR_MESSAGE, {
    context,
    cause: error,
  });
}

/** Convenience for read helpers that want to surface failures to the caller. */
export async function fetchApiJson(context, input, init) {
  const response = await safeFetch(input, init);
  return ensureApiSuccess(response, context);
}
