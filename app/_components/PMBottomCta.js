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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#14242f] via-[#203645] to-[#121c24] text-white py-20 md:py-28 px-6 md:px-[7%]">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <p className="text-xs uppercase tracking-widest text-secondary font-mono font-bold mb-8">
          TRUSTED BY LEADING PROPERTY MANAGERS & INSTITUTIONS
        </p>

        {/* Logos Marquee / Grid */}
       

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-sans tracking-tight max-w-3xl leading-[1.15]">
          Ready to Streamline Your PM Operations?
        </h2>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 font-mono max-w-2xl">
          Join modern property managers and landlords automating rent collection, tenant screening, and maintenance workflows on Xpacy.
        </p>

        {/* Action Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="#demo-form-card"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-primary hover:bg-secondary-100 font-sans font-bold text-base transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Book a Free Demo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent border border-white/20 text-white hover:bg-white/10 font-sans font-bold text-base transition-colors flex items-center justify-center"
          >
            Get Started Free
          </Link>
        </div>

       
      </div>
    </section>
  );
}

