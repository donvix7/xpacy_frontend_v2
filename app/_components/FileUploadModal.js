"use client";

import React, { useState, useCallback, useRef } from 'react';
import { ImageUp, LoaderCircle, UploadCloud, X } from 'lucide-react';
import { compressImages } from '../_lib/image-compression';

const FileUploadModal = ({ isOpen, onClose, onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Configuration
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
  const SUPPORTED_EXTENSIONS = '.jpg,.jpeg,.png';

  const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than 100MB. Current file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }

    // Check file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please upload JPEG or PNG files only.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFile = async(file) => {

    if (validateFile(file)) {
    const compressedImage = await compressImages(file);
      
      setSelectedFile(compressedImage);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      await onFileUpload(selectedFile);
      setSelectedFile(null);
      setError(null);
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setError(null);
      setDragActive(false);
      onClose();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="xp-surface fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-side/60 p-4 backdrop-blur-sm">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <p id="upload-modal-title" className="text-[16px] font-semibold text-ink">
              Upload file
            </p>
            <p className="mt-0.5 text-[12.5px] text-mute">JPEG or PNG, up to 100MB.</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            aria-label="Close dialog"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-mute transition-colors hover:bg-soft hover:text-ink disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative rounded-xl border-2 border-dashed p-6 text-center
              transition-colors duration-200
              ${dragActive
                ? 'border-side-active bg-soft'
                : 'border-line bg-soft/50 hover:border-side-active/60'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            {/* Upload Icon */}
            <div className="mb-3 flex justify-center">
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${dragActive ? "bg-card text-side-active" : "bg-card text-mute"}`}>
                <UploadCloud className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>

            <p className="text-[13.5px] text-mute">
              Drag a file here to upload
            </p>

            <div className="my-4 flex items-center justify-center">
              <div className="h-px flex-grow bg-line"></div>
              <span className="mx-4 text-[12px] uppercase tracking-[0.14em] text-mute">or</span>
              <div className="h-px flex-grow bg-line"></div>
            </div>

            <button
              type="button"
              onClick={handleBrowseClick}
              disabled={isUploading}
              className="xp-btn px-4 py-2.5 font-mono text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Browse files
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept={SUPPORTED_EXTENSIONS}
              onChange={handleFileInput}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="mt-4 rounded-xl border border-line bg-soft/50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {/* File Icon based on type */}
                  {selectedFile.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="h-10 w-10 rounded-lg border border-line object-cover"
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-card text-mute">
                      <ImageUp className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium text-ink">{selectedFile.name}</p>
                    <p className="text-[12px] text-mute">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                  aria-label="Remove selected file"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-mute transition-colors hover:bg-card hover:text-ink"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-down/30 bg-down-bg/60 p-3">
              <p className="text-[12.5px] leading-5 text-down">{error}</p>
            </div>
          )}

          {/* File Requirements */}
          <div className="mt-5 text-center">
            <p className="text-[12px] leading-5 text-mute">
              Maximum file size: 100MB
              <br />
              Supported file type: JPEG, PNG
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="xp-btn px-4 py-2.5 font-mono text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="xp-btn xp-btn-fill px-4 py-2.5 font-mono text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Uploading…
              </>
            ) : (
              'Upload'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
