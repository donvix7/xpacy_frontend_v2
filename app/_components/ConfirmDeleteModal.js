import { Trash2 } from "lucide-react";
import SpinnerMini from "./SpinnerMini";

export default function ConfirmDeleteModal({ title, onConfirm, onClose, isPending = false }) {
  return (
    <div className="flex flex-col p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-down-bg text-down">
          <Trash2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 pr-8">
          <p className="text-[16px] font-semibold text-ink">Delete this item?</p>
          <p className="mt-1 text-[13.5px] leading-6 text-mute">{title}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="xp-btn px-4 py-2.5 font-mono text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          No, undo
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="xp-btn xp-btn-fill gap-2 px-4 py-2.5 font-mono text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <SpinnerMini /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
          Yes, delete
        </button>
      </div>
    </div>
  );
}
