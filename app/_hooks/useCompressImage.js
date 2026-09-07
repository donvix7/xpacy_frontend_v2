import { useState, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";

const SERVER_BASE = "https://app.xpacy.com/src/upload/properties";

const normalizeServerFile = (file) => {
  const isString = typeof file === "string";
  const fileName = isString ? file : (file?.name || "unknown");
  return {
    id: crypto.randomUUID(),
    name: fileName,
    type: typeof fileName === "string" && fileName.endsWith(".mp4") ? "video/mp4" : "image/jpeg",
    size: file?.size || 0,
    url: isString ? `${SERVER_BASE}/${file}` : (file?.url || `${SERVER_BASE}/${fileName}`),
    isRemote: true,
  };
};

const normalizeLocalFile = (file) => ({
  id: crypto.randomUUID(),
  name: file.name,
  type: file.type,
  size: file.size,
  url: URL.createObjectURL(file),
  isRemote: false,
  raw: file,
});

export const useCompressImage = (initialFiles = [], setParentFiles) => {
  const [files, setFiles] = useState([]);
  const [chosenFile, setChosenFile] = useState(null);

  // Safely sync remote strings or local files pushed from parent
  useEffect(() => {
    if (initialFiles?.length) {
      setFiles(prev => {
        const newElements = initialFiles.filter(item => {
           if (typeof item === "string") return !prev.some(p => p.isRemote && p.name === item);
           if (item instanceof File) return !prev.some(p => p.raw === item || (!p.isRemote && p.name === item.name));
           return false;
        });

        if (newElements.length > 0) {
            const normalized = newElements.map(item => {
               if (typeof item === "string") return normalizeServerFile(item);
               return normalizeLocalFile(item);
            });
            const newState = [...prev, ...normalized];
            return newState;
        }
        return prev;
      });
    }
  }, [initialFiles]);

  // Ensure chosen file is set initially or falls back
  useEffect(() => {
    if (files.length > 0 && !chosenFile) {
        setChosenFile(files[0]);
    } else if (files.length === 0 && chosenFile) {
        setChosenFile(null);
    }
  }, [files, chosenFile]);

  const compressImage = useCallback(async (acceptedFiles) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressed = await Promise.all(
        acceptedFiles.map((file) =>
          file.type.startsWith("image")
            ? imageCompression(file, options)
            : file
        )
      );

      const normalized = compressed.map(normalizeLocalFile);

      setFiles((prev) => {
        const unique = normalized.filter(
          (nf) => !prev.some((pf) => pf.name === nf.name)
        );
        const merged = [...prev, ...unique];
        
        // Use timeout to schedule the parent state update outside the current render cycle
        setTimeout(() => {
          setParentFiles?.(
            merged.map((f) => f.isRemote ? f.name : f.raw)
          );
        }, 0);

        return merged;
      });

      if (normalized.length) {
        setChosenFile(normalized[0]);
      }
    } catch (err) {
      console.error("Compression error:", err);
    }
  }, []);

  const removeFile = (file) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== file.id);

      // Use timeout to schedule the parent state update safely
      setTimeout(() => {
        setParentFiles?.(
          next.map((f) => f.isRemote ? f.name : f.raw)
        );
      }, 0);

      setChosenFile(next[0] || null);
      return next;
    });
  };

  return {
    compressImage,
    files,
    setFiles,
    chosenFile,
    setChosenFile,
    removeFile,
  };
};
