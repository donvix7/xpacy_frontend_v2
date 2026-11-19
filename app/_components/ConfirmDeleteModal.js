"use client";

import { useTransition } from "react";
import { Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import SpinnerMini from "./SpinnerMini";

export default function ConfirmDeleteModal({
  title,
  heading,
  description,
  confirmLabel = "Yes, delete",
  cancelLabel = "No, undo",
  variant = "danger",
  icon: CustomIcon,
  onConfirm,
  onClose,
  isPending: externalPending = false,
}) {
  const [internalPending, startTransition] = useTransition();
  const isPending = externalPending || internalPending;

  const handleConfirm = () => {
    if (isPending || !onConfirm) return;
    startTransition(async () => {
      try {
        await onConfirm();
      } catch (err) {
        console.error("Action error:", err);
      }
    });
  };

  const resolvedHeading = heading || (variant === "danger" ? "Delete this item?" : "Are you sure?");
  const resolvedDescription = description || title;

  const variantStyles = {
    danger: {
      iconBg: "bg-down-bg text-down",
      btnBg: "bg-red-600 hover:bg-red-700 text-white border-transparent",
      defaultIcon: Trash2,
    },
    warning: {
      iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      btnBg: "bg-amber-600 hover:bg-amber-700 text-white border-transparent",
      defaultIcon: AlertTriangle,
    },
    success: {
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent",
      defaultIcon: CheckCircle2,
    },
    neutral: {
      iconBg: "bg-soft text-ink",
      btnBg: "xp-btn-fill",
      defaultIcon: AlertTriangle,
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;
  const IconComponent = CustomIcon || currentVariant.defaultIcon;

  return (
    <div className="flex flex-col p-5 sm:p-6">
      <div className="flex items-start gap-3.5">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${currentVariant.iconBg}`}>
          <IconComponent className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 pr-8">
          <p className="text-[16px] font-semibold text-ink">{resolvedHeading}</p>
          {resolvedDescription && (
            <p className="mt-1 text-[13.5px] leading-6 text-mute">{resolvedDescription}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="xp-btn px-4 py-2.5 font-mono text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cancelLabel}
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className={`xp-btn gap-2 px-4 py-2.5 font-mono text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${currentVariant.btnBg}`}
        >
          {isPending ? (
            <SpinnerMini />
          ) : (
            <IconComponent className="h-4 w-4" aria-hidden="true" />
          )}
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
