import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EmptyState({
    message,
    description,
    cta,
    link,
    onAction,
    secondaryCta,
    secondaryLink,
    compact = false,
    className = "",
}) {
    const hasPrimary = Boolean(cta);
    const hasSecondary = Boolean(secondaryCta);

    const renderAction = (label, href, onClick, variant = "primary") => {
        const base =
            "inline-flex items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-semibold transition-all duration-200";
        const styles =
            variant === "primary"
                ? "bg-primary px-4 py-2.5 text-white shadow-sm shadow-primary/20 hover:bg-primary-800 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/30"
                : "border border-gray-300 bg-white px-4 py-2.5 text-gray-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary";

        if (href) {
            return (
                <Link href={href} className={`${base} ${styles}`}>
                    {label}
                    {variant === "primary" && (
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                </Link>
            );
        }
        return (
            <button type="button" onClick={onClick} className={`${base} ${styles}`}>
                {label}
            </button>
        );
    };

    return (
        <div
            className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-5 text-center ${
                compact ? "py-8" : "py-12 sm:py-16"
            } ${className}`}
        >
            {/* Illustration — your provided SVG */}
            <Image
                src="/empty.svg"
                alt=""
                width={160}
                height={160}
                className="mb-4 h-auto w-[120px] sm:w-[150px]"
                aria-hidden="true"
                priority={false}
            />

            {/* Text */}
            <p className="max-w-sm font-sans text-[14px] font-semibold leading-snug text-ink">
                {message || "Nothing here yet"}
            </p>
            {description && (
                <p className="mt-1.5 max-w-sm font-mono text-[12px] leading-relaxed text-gray-500">
                    {description}
                </p>
            )}

            {/* Actions */}
            {(hasPrimary || hasSecondary) && (
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    {hasPrimary && renderAction(cta, link, onAction, "primary")}
                    {hasSecondary &&
                        renderAction(
                            secondaryCta,
                            secondaryLink,
                            undefined,
                            "secondary"
                        )}
                </div>
            )}
        </div>
    );
}