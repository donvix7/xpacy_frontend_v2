import { CircleAlert } from "lucide-react";

/**
 * Inline notice for pages that keep rendering partial data after a request
 * fails. Shows the message the API returned so the gap in the page is
 * explained instead of looking like empty data.
 */
export default function DataErrorNotice({ messages = [] }) {
  const uniqueMessages = Array.from(
    new Set(messages.filter((message) => typeof message === "string" && message.trim()))
  );

  if (uniqueMessages.length === 0) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0">
        <p className="font-sans text-[14px] font-semibold">Some data could not be loaded</p>
        <ul className="mt-1 list-disc space-y-1 pl-4 font-mono text-[12.5px] leading-5">
          {uniqueMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
