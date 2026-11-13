import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Building2, CheckCircle2 } from "lucide-react";

export default function PMBottomCta() {
  const partnerNames = [
    "FOUR SEASONS",
    "espaceslokalia",
    "DevMcGill",
    "Parkbridge",
    "QuadReal",
    "Prével",
    "BROCCOLINI",
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#14242f] via-[#203645] to-[#121c24] px-5 py-14 text-white sm:px-6 sm:py-20 md:px-[7%] md:py-28">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-secondary/10 blur-[120px]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        {/* Eyebrow */}
        <p className="mb-6 font-mono text-[11px] font-bold uppercase leading-relaxed tracking-widest text-secondary md:mb-8 md:text-xs">
          TRUSTED BY LEADING PROPERTY MANAGERS &amp; INSTITUTIONS
        </p>

        {/* Logos Marquee / Grid */}
       

        {/* Heading */}
        <h2 className="max-w-3xl font-sans text-[28px] font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          Ready to Streamline Your PM Operations?
        </h2>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-gray-300 sm:text-base md:text-lg">
          Join modern property managers and landlords automating rent collection, tenant screening, and maintenance workflows on Xpacy.
        </p>

        {/* Action Button */}
        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <a
            href="#demo-form-card"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-sans text-base font-bold text-primary shadow-xl transition-all duration-200 hover:bg-secondary-100 hover:shadow-2xl group cursor-pointer sm:w-auto"
          >
            <span>Book a Free Demo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <Link
            href="/auth/register"
            className="flex w-full items-center justify-center rounded-xl border border-white/20 bg-transparent px-8 py-4 font-sans text-base font-bold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            Get Started Free
          </Link>
        </div>

       
      </div>
    </section>
  );
}

