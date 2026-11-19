"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function RefreshButton({ children, className = "" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      className={className}
    >
      <span className={isPending ? "inline-block animate-spin" : "flex items-center gap-2"}>
        {children}
      </span>
    </button>
  );
}