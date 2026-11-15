"use client";

import Link from "next/link";
import { CircleAlert } from "lucide-react";

const GENERIC_SERVER_MESSAGE = /server components render|specific message is omitted|an error occurred/i;

/**
 * Shared error boundary body for dashboard segments. Surfaces the message the
 * data layer captured (API message in development, reference digest in
 * production) without dropping the user out of the app shell styling.
 */
export default function DashboardErrorState({ error, reset, fallbackMessage }) {
  const rawMessage = typeof error?.message === "string" ? error.message.trim() : "";
  const message = rawMessage && !GENERIC_SERVER_MESSAGE.test(rawMessage)
    ? rawMessage
    : fallbackMessage || "We couldn't load this page. Please try again.";
  const digest = typeof error?.digest === "string" ? error.digest : "";

  return (
    <div className="xp-dashboard flex min-h-[420px] w-full items-center justify-center bg-canvas p-4 sm:p-6">
      <div className="xp-card w-full max-w-md p-6 text-center sm:p-8">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
          <CircleAlert aria-hidden="true" className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-sans text-xl font-bold text-ink">Something went wrong</h1>
        <p className="mt-2 font-mono text-[13.5px] leading-6 text-mute">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="xp-btn xp-btn-fill w-full sm:w-auto">
            Try again
          </button>
          <Link href="/" className="xp-btn w-full sm:w-auto">
            Back to home
          </Link>
        </div>
        {digest ? (
          <p className="mt-5 break-all font-mono text-[11px] text-mute">Reference: {digest}</p>
        ) : null}
      </div>
    </div>
  );
}
