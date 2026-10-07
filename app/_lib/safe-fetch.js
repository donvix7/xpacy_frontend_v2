const unavailableMessage = "The service is temporarily unavailable. Please try again.";

/**
 * Fetch a response without letting network or body parsing failures escape into
 * a page render or server action. HTTP errors still expose their status and
 * parsed body so callers can keep their existing fallback and error handling.
 */
export async function safeFetch(input, init) {
    let response;

    try {
        response = await globalThis.fetch(input, init);
    } catch {
        return {
            ok: false,
            status: 0,
            statusText: unavailableMessage,
            text: async () => "",
            json: async () => ({ success: false, message: unavailableMessage }),
        };
    }

    let bodyPromise;
    let invalidJson = false;
    const readBody = async () => {
        if (!bodyPromise) {
            bodyPromise = response.text().catch(() => "");
        }
        return bodyPromise;
    };

    return {
        get ok() {
            return response.ok && !invalidJson;
        },
        status: response.status,
        statusText: response.statusText,
        text: readBody,
        json: async () => {
            const body = await readBody();
            if (!body) {
                return response.ok
                    ? {}
                    : {
                        success: false,
                        message: response.statusText || "The request failed. Please try again.",
                        data: null,
                    };
            }
            try {
                const payload = JSON.parse(body);
                if (response.ok) return payload;
                const details = payload && typeof payload === "object" && !Array.isArray(payload)
                    ? payload
                    : {};
                const message = [
                    details.message,
                    typeof details.error === "string" ? details.error : details.error?.message,
                    response.statusText,
                ].find((value) => typeof value === "string" && value.trim());
                return {
                    ...details,
                    success: false,
                    message: message || "The request failed. Please try again.",
                    data: null,
                };
            } catch {
                invalidJson = true;
                return {
                    success: false,
                    message: response.ok
                        ? "The service returned an unreadable response. Please try again."
                        : response.statusText || "The request failed. Please try again.",
                };
            }
        },
    };
}
