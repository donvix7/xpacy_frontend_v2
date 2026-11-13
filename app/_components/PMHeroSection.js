"use client";

import React, { useState, useEffect } from "react";
import DemoBookingForm from "./DemoBookingForm";
import Image from "next/image";

// Fallback slides used when backend banners are missing/empty
const DEFAULT_SLIDES = [
  "/carousel-photo01.png",
  "/management_banner.jpg",
];

export default function PMHeroSection({ banners = [], isAuthenticated = false }) {
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
    <section className="relative flex items-center overflow-hidden px-5 pb-14 pt-10 text-white sm:px-6 sm:pb-20 sm:pt-12 md:px-[7%] md:pb-28 md:pt-16 lg:min-h-[740px]">
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
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-10">
        {/* Left Column */}
        <div className="flex flex-col items-start space-y-6 sm:space-y-7 lg:col-span-7">
          <h1 className="text-[27px] font-bold leading-[1.15] tracking-tight text-white font-sans sm:text-4xl md:text-[42px] lg:text-5xl">
            Property search refined for ease.
            <span className="mt-1 block bg-gradient-to-r from-secondary-500 via-secondary to-[#e8d5b5] bg-clip-text text-transparent">
              with Xpacy.
            </span>
          </h1>

          <p className="max-w-xl font-mono text-[15px] leading-relaxed text-gray-200 sm:text-base md:text-lg">
            From lease signing to maintenance requests. Tenant portals, owner
            portals, automated workflows &amp; AI-powered operations — one
            unified platform.
          </p>

          {/* Slide Indicator Dots */}
          <div className="-ml-2 flex items-center gap-1 pt-1">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentSlide(dotIdx)}
                aria-label={`Jump to slide ${dotIdx + 1}`}
                aria-current={currentSlide === dotIdx ? "true" : undefined}
                className="grid h-9 w-9 cursor-pointer place-items-center"
              >
                <span
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === dotIdx
                      ? "w-8 bg-secondary"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Demo Form Card */}
        <div className="lg:col-span-5 w-full">
          <DemoBookingForm isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </section>
  );
}
