"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { refreshToken, checkTokenStatus } from "@/app/_lib/action";
import { notifyTokenRefreshed } from "@/app/_lib/token-utils";

const REFRESH_BUFFER_MS = 60 * 1000; // Proactively refresh 60s before expiry
const MIN_TIMER_DELAY_MS = 5 * 1000;
const FAILURE_COOLDOWN_MS = 30 * 1000;

export default function TokenRefreshModal() {
  const router = useRouter();
  const timerRef = useRef(null);
  const refreshInFlightRef = useRef(null);
  const lastFailureAtRef = useRef(0);

  const scheduleTimer = useCallback((expiresInMs, fn) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (typeof expiresInMs !== "number" || !Number.isFinite(expiresInMs)) return;

    const delay = Math.max(MIN_TIMER_DELAY_MS, expiresInMs - REFRESH_BUFFER_MS);
    timerRef.current = setTimeout(() => {
      void fn();
    }, delay);
  }, []);

  const refreshSessionSilently = useCallback(async () => {
    if (refreshInFlightRef.current) return refreshInFlightRef.current;

    // Avoid tight retry loops if refresh recently failed
    if (Date.now() - lastFailureAtRef.current < FAILURE_COOLDOWN_MS) {
      return false;
    }

    const refreshAttempt = (async () => {
      try {
        const res = await refreshToken();

        if (res?.success) {
          lastFailureAtRef.current = 0;
          notifyTokenRefreshed(res);
          router.refresh();
          return res;
        }

        lastFailureAtRef.current = Date.now();
        return false;
      } catch (err) {
        console.warn("Silent token refresh failed:", err);
        lastFailureAtRef.current = Date.now();
        return false;
      } finally {
        refreshInFlightRef.current = null;
      }
    })();

    refreshInFlightRef.current = refreshAttempt;
    return refreshAttempt;
  }, [router]);

  const scheduleCheck = useCallback(async () => {
    try {
      const status = await checkTokenStatus();

      if (!status?.isAuthenticated || !status?.hasRefreshToken) {
        if (timerRef.current) clearTimeout(timerRef.current);
        return;
      }

      const needsRefreshNow =
        status.isExpired ||
        (typeof status.expiresInMs === "number" &&
          status.expiresInMs <= REFRESH_BUFFER_MS);

      if (needsRefreshNow) {
        const res = await refreshSessionSilently();
        if (res && typeof res.expiresInMs === "number" && res.expiresInMs > 0) {
          scheduleTimer(res.expiresInMs, scheduleCheck);
        }
        return;
      }

      if (typeof status.expiresInMs === "number" && status.expiresInMs > 0) {
        scheduleTimer(status.expiresInMs, scheduleCheck);
      }
    } catch (err) {
      console.warn("Failed to check token status:", err);
    }
  }, [refreshSessionSilently, scheduleTimer]);

  useEffect(() => {
    void scheduleCheck();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void scheduleCheck();
      }
    };

    const interval = setInterval(() => {
      void scheduleCheck();
    }, 60 * 1000);

    const handleExpiredEvent = async () => {
      const res = await refreshSessionSilently();
      if (res && typeof res.expiresInMs === "number" && res.expiresInMs > 0) {
        scheduleTimer(res.expiresInMs, scheduleCheck);
      }
    };

    const handleRefreshedEvent = (event) => {
      const expiresInMs = event?.detail?.expiresInMs;
      if (typeof expiresInMs === "number" && expiresInMs > 0) {
        scheduleTimer(expiresInMs, scheduleCheck);
      } else {
        void scheduleCheck();
      }
    };

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    window.addEventListener("xpacy:token-expired", handleExpiredEvent);
    window.addEventListener("xpacy:token-refreshed", handleRefreshedEvent);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      window.removeEventListener("xpacy:token-expired", handleExpiredEvent);
      window.removeEventListener("xpacy:token-refreshed", handleRefreshedEvent);
    };
  }, [scheduleCheck, refreshSessionSilently, scheduleTimer]);

  return null;
}
