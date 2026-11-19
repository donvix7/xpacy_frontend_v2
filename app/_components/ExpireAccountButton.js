"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { expireVirtualAccount } from "@/app/_lib/action";

export default function ExpireAccountButton({ accountId }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const confirmed = window.confirm(
      accountId
        ? "Expire this virtual account? Incoming transfers will be rejected."
        : "Expire all inactive virtual accounts? This cannot be undone.",
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await expireVirtualAccount({ accountId });
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Failed to expire account. Please try again.");
      }
    });
  };

  return (
    <button type="button" onClick={handleClick} disabled={isPending}>
      {isPending ? "Expiring…" : "Expire account"}
    </button>
  );
}