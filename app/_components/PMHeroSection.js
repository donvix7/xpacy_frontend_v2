"use client";

import React, { useState, useEffect } from "react";
import DemoBookingForm from "./DemoBookingForm";
import Image from "next/image";

// Fallback slides used when backend banners are missing/empty
const DEFAULT_SLIDES = [
  "/carousel-photo01.png",
  "/management_banner.jpg",
];

export default function PMHeroSection({ banners = [] }) {
  const backendImages = (banners || [])
    .filter((b) => b?.image_url)
    .map((b) => ({
      src: `https://app.xpacy.com/src/upload/homepage_slider/${b.image_url}`,
      isLocal: false,
    }));

  const slides =
    backendImages.length > 0
      ? backendImages
      : DEFAULT_SLIDES.map((src) => ({ src, isLocal: true }));

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance every 5s
  useEffect(() => {
    if (!slides.length) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative overflow-hidden min-h-[680px] lg:min-h-[740px] text-white pt-12 pb-20 md:pt-16 md:pb-28 px-6 md:px-[7%] flex items-center">
      {/* 1. Background Images with Cross-Fade + Scale */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slides.map(({ src, isLocal }, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                isActive
                  ? "opacity-100 scale-105"
                  : "opacity-0 scale-100 pointer-events-none"
              }`}
            >
              <Image
                src={src}
                alt="Xpacy Hero"
                fill
                unoptimized={!isLocal}
                priority={index === 0}   // 👈 preload the first slide
                sizes="100vw"
                className="object-cover"
              />
            </div>
          );
        })}
      </div>

      {/* 2. Cinematic Navy & Gradient Dark Overlays */}
      <div className="absolute inset-0 z-1 bg-gradient-to-r from-[#14242f]/30 via-[#203645]/40 to-[#14242f]/50" />
      <div className="absolute inset-0 z-1 bg-gradient-to-t from-[#14242f]/5 via-transparent to-black/20" />

      {/* 3. Subtle ambient light accents */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-700/25 blur-[130px] rounded-full pointer-events-none z-2" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-secondary/20 blur-[140px] rounded-full pointer-events-none z-2" />

      {/* 4. Foreground Hero Content Grid */}
      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-7">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-sans tracking-tight text-white leading-[1.12]">
            Property search refined for ease.
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-secondary-500 via-secondary to-[#e8d5b5]">
              with Xpacy.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-200 font-mono leading-relaxed max-w-xl">
            From lease signing to maintenance requests. Tenant portals, owner
            portals, automated workflows &amp; AI-powered operations — one
            unified platform.
          </p>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-2 pt-2">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentSlide(dotIdx)}
                aria-label={`Jump to slide ${dotIdx + 1}`}
                aria-current={currentSlide === dotIdx ? "true" : undefined}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === dotIdx
                    ? "w-8 bg-secondary"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Demo Form Card */}
        <div className="lg:col-span-5 w-full">
          <DemoBookingForm />
        </div>
      </div>
    </section>
  );
}