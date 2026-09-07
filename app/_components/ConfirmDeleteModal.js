import SpinnerMini from "./SpinnerMini";

export default function ConfirmDeleteModal({ title, onConfirm, onClose, isPending = false }) {
  return (
    <div className="flex flex-col">
      <p className="px-6 pt-6 font-mono text-error font-bold">
        {title}
      </p>

      <div className="flex items-center justify-between p-6">
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="px-4 py-2 bg-red-100 flex items-center gap-2 text-primary rounded-lg font-medium cursor-pointer disabled:opacity-50"
        >
          {isPending ? <SpinnerMini /> : "Yes, delete"}
        </button>

        <button
          onClick={onClose}
          disabled={isPending}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium cursor-pointer disabled:opacity-50"
        >
          No, undo
        </button>
      </div>
    </div>
  )
}