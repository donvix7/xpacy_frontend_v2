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
  const autoRefreshAttemptedRef = useRef(false);

  const handleRefreshSession = useCallback(async () => {
    if (refreshInFlightRef.current) return refreshInFlightRef.current;

    setIsRefreshing(true);
    setErrorMessage(null);

    const refreshAttempt = (async () => {
      try {
        const res = await refreshToken();

        if (res.success) {
          autoRefreshAttemptedRef.current = false;
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
        if (status.hasRefreshToken && !autoRefreshAttemptedRef.current) {
          autoRefreshAttemptedRef.current = true;
          await handleRefreshSession();
        }
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
  }, [handleRefreshSession]);

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
      if (status.hasRefreshToken && !autoRefreshAttemptedRef.current) {
        autoRefreshAttemptedRef.current = true;
        await handleRefreshSession();
      }
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
  }, [handleRefreshSession, scheduleCheck]);

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="token-modal-title"
      >
        {/* Subtle close button if user wishes to temporarily dismiss */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pulse / Icon Container */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 shadow-inner">
            <Clock className="w-8 h-8 animate-pulse text-amber-500" />
          </div>
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        {/* Heading */}
        <h3 id="token-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Session Expired
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Your access token has expired. Refresh your session now to continue working smoothly without losing your changes.
        </p>

        {/* Error notification if refresh failed */}
        {errorMessage && (
          <div className="w-full mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-left text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Refresh Failed</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Primary Action Button: Refresh Token */}
        <div className="w-full flex flex-col gap-3">
          {hasRefreshToken ? (
            <button
              onClick={handleRefreshSession}
              disabled={isRefreshing || isPendingLogout}
              className="w-full py-3.5 px-4 bg-primary text-white rounded-xl font-semibold shadow-md hover:bg-primary-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Refreshing Session..." : errorMessage ? "Try Refreshing Again" : "Refresh Session"}</span>
            </button>
          ) : (
            <button
              onClick={handleLogoutClick}
              disabled={isPendingLogout}
              className="w-full py-3.5 px-4 bg-primary text-white rounded-xl font-semibold shadow-md hover:bg-primary-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              <span>{isPendingLogout ? "Redirecting..." : "Log In Again"}</span>
            </button>
          )}

          {/* Secondary Action: Log Out */}
          <button
            onClick={handleLogoutClick}
            disabled={isPendingLogout || isRefreshing}
            className="w-full py-2.5 px-4 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isPendingLogout ? "Logging out..." : "Log Out"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
