import { LoaderCircle, X } from "lucide-react";

const UploadingFileModal = ({ isOpenModal, setIsOpenModal, uploadingProgress, estimatedTime, controller }) => {
  if (!isOpenModal) return null;

  return (
    <div className="xp-surface fixed inset-0 z-50 flex items-center justify-center bg-side/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="uploading-modal-title"
        className="w-full max-w-sm rounded-2xl border border-line bg-card p-6 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-soft text-side-active">
            <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
          </span>

          <div>
            <p id="uploading-modal-title" className="text-[16px] font-semibold text-ink">
              Uploading file
            </p>
            <p className="mt-1 text-[12.5px] leading-5 text-mute">
              Please wait while we process your request.
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-mute">Progress</span>
              <span className="font-medium tabular-nums text-ink">{uploadingProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-soft">
              <div
                className="h-full rounded-full bg-side-active transition-all duration-300 ease-out"
                style={{ width: `${uploadingProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-1 rounded-xl border border-line bg-soft/50 py-2.5">
            <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-mute">
              Estimated remaining time
            </span>
            <p className="text-[13.5px] font-semibold tabular-nums text-ink">
              {Math.abs(estimatedTime)} seconds
            </p>
          </div>

          <button
            onClick={() => controller.abort()}
            className="xp-btn w-full border-down/40 text-down hover:bg-down-bg hover:text-down"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Cancel upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadingFileModal;
