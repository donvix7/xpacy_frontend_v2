"use client";

import { useEffect } from "react";
import DashboardErrorState from "@/app/_components/DashboardErrorState";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <DashboardErrorState
      error={error}
      reset={reset}
      fallbackMessage="We encountered an error while loading this dashboard. Please try again."
    />
  );
}
