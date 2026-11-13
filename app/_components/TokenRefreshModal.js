"use client";

import { useEffect, useState, useRef, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RefreshCw, Clock, LogOut, X, AlertCircle } from "lucide-react";
import { refreshToken, checkTokenStatus, handleLogOut } from "@/app/_lib/action";
import { notifyTokenRefreshed } from "@/app/_lib/token-utils";

export default function TokenRefreshModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPendingLogout, startLogoutTransition] = useTransition();
  const [hasRefreshToken, setHasRefreshToken] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const router = useRouter();
  const timerRef = useRef(null);
  const refreshInFlightRef = useRef(null);

  const handleRefreshSession = useCallback(async () => {
    if (refreshInFlightRef.current) return refreshInFlightRef.current;

    setIsRefreshing(true);
    setErrorMessage(null);

    const refreshAttempt = (async () => {
      try {
        const res = await refreshToken();

        if (res.success) {
          toast.success(res.message || "Session refreshed successfully!");
          setIsOpen(false);
          setErrorMessage(null);
          notifyTokenRefreshed(res);
          router.refresh();
          return true;
        }

        setErrorMessage(res.message || "Failed to refresh session. Please try again.");
        toast.error(res.message || "Session refresh failed");
        return false;
      } catch (err) {
        console.error("Error calling refreshToken:", err);
        setErrorMessage(err.message || "An unexpected error occurred while refreshing your session.");
        toast.error("Failed to refresh session");
        return false;
      } finally {
        refreshInFlightRef.current = null;
        setIsRefreshing(false);
      }
    })();

    refreshInFlightRef.current = refreshAttempt;
    return refreshAttempt;
  }, [router]);

  const scheduleCheck = useCallback(async () => {
    try {
      const status = await checkTokenStatus();

      // If user isn't authenticated or no refresh token, don't show modal
      if (!status.isAuthenticated) {
        setIsOpen(false);
        return;
      }

      setHasRefreshToken(status.hasRefreshToken);

      if (status.isExpired) {
        setIsOpen(true);
        return;
      }

      // Schedule timer for when access token expires
      if (typeof status.expiresInMs === "number" && status.expiresInMs > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          void scheduleCheck();
        }, status.expiresInMs);
      }
    } catch (err) {
      console.error("Failed to check token status:", err);
    }
  }, []);

  useEffect(() => {
    scheduleCheck();

    // Check when window regains focus or visibility
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        scheduleCheck();
      }
    };

    // Heartbeat check every 60 seconds
    const interval = setInterval(scheduleCheck, 60000);

    // Event listener for manual or 401 interceptor trigger
    const handleExpiredEvent = async () => {
      setIsOpen(true);
      const status = await checkTokenStatus();
      setHasRefreshToken(status.hasRefreshToken);
    };

    // Event listener for manual re-schedule
    const handleRefreshedEvent = () => {
      scheduleCheck();
    };

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    window.addEventListener("xpacy:token-expired", handleExpiredEvent);
    window.addEventListener("xpacy:token-refreshed", handleRefreshedEvent);

    // Expose for testing/debugging in browser console
    if (typeof window !== "undefined") {
      window.__triggerTokenExpiryModal = () => setIsOpen(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      window.removeEventListener("xpacy:token-expired", handleExpiredEvent);
      window.removeEventListener("xpacy:token-refreshed", handleRefreshedEvent);
    };
  }, [scheduleCheck]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  function handleLogoutClick() {
    startLogoutTransition(async () => {
      await handleLogOut();
    });
  }

  if (!isOpen) return null;

  return (
    <div className="xp-surface fixed inset-0 z-[9999] flex items-center justify-center bg-side/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative flex w-full max-w-md flex-col items-center rounded-2xl border border-line bg-card p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="token-modal-title"
      >
        {/* Subtle close button if user wishes to temporarily dismiss */}
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Dismiss"
          title="Dismiss"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-mute transition-colors hover:bg-soft hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Pulse / Icon Container */}
        <div className="relative mb-4">
          <span className="grid h-14 w-14 place-items-center rounded-xl border border-warn/25 bg-warn-bg text-warn">
            <Clock className="h-7 w-7" />
          </span>
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-warn/40" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-warn" />
          </span>
        </div>

        {/* Heading */}
        <p id="token-modal-title" className="text-[19px] font-semibold leading-tight text-ink sm:text-[21px]">
          Session expired
        </p>

        {/* Description */}
        <p className="mb-6 mt-2 max-w-xs text-[13.5px] leading-6 text-mute">
          Your session has expired. Refresh it now to continue without losing your changes.
        </p>

        {/* Error notification if refresh failed */}
        {errorMessage && (
          <div role="alert" className="mb-4 flex w-full items-start gap-2.5 rounded-xl border border-down/30 bg-down-bg/60 p-3 text-left text-[12.5px] leading-5 text-down">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-semibold">Refresh failed</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Primary Action Button: Refresh Token */}
        <div className="flex w-full flex-col gap-3">
          {hasRefreshToken ? (
            <button
              onClick={handleRefreshSession}
              disabled={isRefreshing || isPendingLogout}
              className="xp-btn xp-btn-fill w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              <span>{isRefreshing ? "Refreshing session…" : errorMessage ? "Try refreshing again" : "Refresh session"}</span>
            </button>
          ) : (
            <button
              onClick={handleLogoutClick}
              disabled={isPendingLogout}
              className="xp-btn xp-btn-fill w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>{isPendingLogout ? "Redirecting…" : "Log in again"}</span>
            </button>
          )}

          {/* Secondary Action: Log Out */}
          <button
            onClick={handleLogoutClick}
            disabled={isPendingLogout || isRefreshing}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-medium text-mute transition-colors hover:bg-soft hover:text-ink disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isPendingLogout ? "Logging out…" : "Log out"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
