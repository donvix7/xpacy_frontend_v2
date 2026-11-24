"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({
    value,
    label = "Copy",
    text,
    copiedText = "Copied!",
    className,
    iconSize = 14,
}) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const t = setTimeout(() => setCopied(false), 1800);
        return () => clearTimeout(t);
    }, [copied]);

    const handleCopy = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(String(value));
            setCopied(true);
        } catch {
            /* noop */
        }
    };

    const base =
        "inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors";
    const defaultStyle = copied
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-gray-200 bg-white text-gray-500 hover:border-primary-200 hover:text-primary";

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy ${label}`}
            title={copied ? "Copied!" : `Copy ${label}`}
            className={className || `${base} ${defaultStyle}`}
        >
            {copied ? (
                <Check size={iconSize} aria-hidden="true" />
            ) : (
                <Copy size={iconSize} aria-hidden="true" />
            )}
            {text ? <span>{copied ? copiedText : text}</span> : null}
        </button>
    );
}