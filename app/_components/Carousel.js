"use client";

import { useEffect, useState } from "react";

function Carousel({
  slides,
  indicators,
  interval = 5000,
  currentSlideIndex: controlledIndex,
  onSlideChange,
  indicatorTone = "secondary",
  className = "",
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isControlled = controlledIndex !== undefined;
  const currentSlideIndex = isControlled ? controlledIndex : internalIndex;

  const goTo = (next) => {
    const total = slides?.length || 1;
    const wrapped = (next + total) % total;
    if (!isControlled) setInternalIndex(wrapped);
    onSlideChange?.(wrapped);
  };

  useEffect(() => {
    if (!slides?.length) return;
    const id = setInterval(() => goTo(currentSlideIndex + 1), interval);
    return () => clearInterval(id);
  }, [currentSlideIndex, slides?.length, interval]);

  return (
    <div className={`w-full h-full overflow-hidden relative ${className}`}>
      <div
        style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
        className={`flex min-w-full h-full ${
          mounted ? "transition-transform duration-700 ease-in-out" : ""
        }`}
      >
        {slides?.map((slide, index) => (
          // 👇 relative — required for <Image fill>
          <div key={index} className="w-full h-full shrink-0 relative">
            {slide}
          </div>
        ))}
      </div>

      {indicators && (
        <div className="absolute top-19/20 z-30 flex w-full items-center justify-center">
          <div className="flex items-center gap-2">
            {Array.from({ length: slides?.length }, (_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentSlideIndex === i
                    ? indicatorTone === "light"
                      ? "w-6.5 bg-white"
                      : "w-6.5 bg-secondary"
                    : indicatorTone === "light"
                      ? "w-2.5 bg-white/40 hover:bg-white/70"
                      : "w-3 bg-secondary-100"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Carousel;