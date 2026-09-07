import { IoClose } from "react-icons/io5";

const UploadingFileModal = ({ isOpenModal, setIsOpenModal, uploadingProgress, estimatedTime, controller }) => {
  if (!isOpenModal) return null;

  return (
    <div className="fixed top-0 w-full left-0 bottom-0 h-screen bg-gray-0/50 backdrop-blur-sm z-50 transition-all duration-300 ease-in overflow-hidden">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-8 transition-all duration-300 border border-primary-100">
        <div className="w-[330px] flex justify-center items-center flex-col gap-6 font-mono text-center">
          <div className="flex flex-col gap-2 items-center">
            <h3 className="text-xl font-bold text-primary-700">Uploading File</h3>
            <p className="text-xs text-neutrals-500 italic">Please wait while we process your request</p>
          </div>

          {/* Progress bar */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-primary-600">Progress</span>
                <span className="text-primary-700">{uploadingProgress}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-primary-50 overflow-hidden border border-primary-100/50">
              <div 
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out" 
                style={{ width: `${uploadingProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col gap-1 items-center bg-neutrals-50 w-full py-3 rounded-lg border border-primary-50">
            <span className="text-[10px] uppercase font-bold text-neutrals-400">Estimated remaining time</span>
            <p className="text-sm font-bold text-primary-700">{Math.abs(estimatedTime)} seconds</p>
          </div>

          <div className="flex items-center justify-center pt-2">
            <button 
                onClick={() => controller.abort()} 
                className="flex items-center gap-2 cursor-pointer font-bold text-error-600 justify-center px-6 py-2.5 rounded-lg border-2 border-error-100 hover:bg-error-50 hover:border-error-200 transition-all active:scale-95 group"
            >
              <IoClose className="text-xl group-hover:rotate-90 transition-transform duration-300" />
              <span>Cancel Upload</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadingFileModal;