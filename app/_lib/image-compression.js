import imageCompression from "browser-image-compression";

/**
 * Compresses an image or an array of images.
 * @param {File|File[]} files - The file or array of files to compress.
 * @param {Object} options - Compression options.
 * @returns {Promise<File|File[]>} - The compressed file or array of files.
 */
export async function compressImages(files, options = {}) {
    const defaultOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        ...options,
    };

    if (Array.isArray(files)) {
        try {
            return await Promise.all(
                files.map((file) =>
                    file.type.startsWith("image")
                        ? imageCompression(file, defaultOptions)
                        : file
                )
            );
        } catch (error) {
            console.error("Multi-image compression error:", error);
            return files;
        }
    } else {
        try {
            if (files.type.startsWith("image")) {
                return await imageCompression(files, defaultOptions);
            }
            return files;
        } catch (error) {
            console.error("Single image compression error:", error);
            return files;
        }
    }
}
