"use client";

import { IoCheckmark, IoCloudUploadOutline } from "react-icons/io5";
import { useDropzone } from "react-dropzone";
import { BiPlus } from "react-icons/bi";
import { LiaFileVideoSolid, LiaFileImageSolid } from "react-icons/lia";
import { PiFloppyDiskThin } from "react-icons/pi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useCompressImage } from "../_hooks/useCompressImage";

export default function DragnDrop({existingImages = [], onRemoveExisting, imageUrlBase, accept, maxFiles, files, setFiles, isReadOnly = false }) {
  const {
    compressImage,
    files: selectedFiles,
    chosenFile,
    setChosenFile,
    removeFile,
  } = useCompressImage(files, setFiles);

  const { getRootProps, getInputProps, open } = useDropzone({
    noKeyboard: true,
    noClick: true,
    maxFiles,
    accept,
    onDrop: compressImage,
    disabled: isReadOnly,
  });

  return (
    <>
      {selectedFiles.length ? (
        <div className="w-full h-full px-6 py-4 flex flex-col gap-4 border border-gray-200 rounded-lg font-mono">

          {/* Main preview */}
          {chosenFile && (
            <div className="w-full h-[500px]">
              {chosenFile.type.startsWith("image") ? (
                <img
                  src={chosenFile.url}
                  className="object-contain w-full h-full rounded-lg"
                />
              ) : (
                <video
                  src={chosenFile.url}
                  controls
                  className="w-full h-full rounded-lg"
                />
              )}
            </div>
          )}

          {/* Thumbnails */}
          <div className="flex items-center gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={file.id}
                onClick={() => setChosenFile(file)}
                className={`w-20 h-20 relative rounded-lg cursor-pointer ${
                  chosenFile?.id === file.id && "border-2 border-[#E63855]"
                }`}
              >
                {file.type.startsWith("image") ? (
                  <img
                    src={file.url}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={file.url}
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}

                <div className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-xs">
                  {index + 1}
                </div>

                {chosenFile?.id === file.id && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-[#E63855] text-white">
                    <IoCheckmark />
                  </div>
                )}
              </div>
            ))}

            {!isReadOnly && maxFiles > 1 && (
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button
                  type="button"
                  onClick={open}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col gap-1 items-center justify-center text-sm text-gray-600"
                >
                  <BiPlus className="text-xl" />
                  Add more
                </button>
              </div>
            )}
          </div>

          {/* File info */}
          {chosenFile && (
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                {chosenFile.type.startsWith("image") ? (
                  <LiaFileImageSolid />
                ) : (
                  <LiaFileVideoSolid />
                )}
                {chosenFile.type}
              </div>

              {!chosenFile.isRemote && (
                <div className="flex items-center gap-1">
                  <PiFloppyDiskThin />
                  {Math.round(chosenFile.size / 1_000_000)}MB
                </div>
              )}
            </div>
          )}

          {/* Remove */}
          {!isReadOnly && chosenFile && (
            <div
              className="flex items-center gap-2 text-[#E03131] cursor-pointer"
              onClick={() => removeFile(chosenFile)}
            >
              <RiDeleteBin6Line />
              <span className="text-sm font-medium">Remove</span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full border border-gray-200 flex items-center justify-center font-mono rounded-2xl p-8">
          <div {...getRootProps()} className="flex flex-col items-center gap-4">
            <input {...getInputProps()} />
            <IoCloudUploadOutline className="text-[40px]" />
            <div className="text-center space-y-1">
              <button
                type="button"
                disabled={isReadOnly}
                onClick={!isReadOnly ? open : undefined}
                className={`text-primary font-bold text-lg ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isReadOnly ? "No images uploaded" : "Click to upload"}
              </button>
              {!isReadOnly && (
                <p className="text-gray-500 text-sm">
                  PNG, JPG, GIF, MP4, MOV up to 100MB
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
