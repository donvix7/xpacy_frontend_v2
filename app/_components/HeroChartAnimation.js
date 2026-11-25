"use client";

import { useEffect, useState } from "react";

const CHART_FRAMES = [
  [32, 44, 39, 54, 61, 57, 69, 74, 71, 82, 88, 94],
  [48, 52, 60, 56, 68, 75, 72, 81, 86, 84, 91, 96],
  [36, 42, 51, 47, 59, 64, 70, 67, 78, 85, 83, 92],
];

function buildSvgPoints(values, width = 360, height = 160, padX = 14, padY = 18) {
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;
  const stepX = values.length > 1 ? usableW / (values.length - 1) : 0;

  return values.map((val, idx) => {
    const x = padX + idx * stepX;
    const clamped = Math.max(0, Math.min(100, val));
    const y = padY + usableH - (clamped / 100) * usableH;
    return { x, y };
  });
}

function pointsToLinePath(points) {
  if (!points.length) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

function pointsToAreaPath(points, height = 160) {
  if (!points.length) return "";
  const line = pointsToLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x.toFixed(1)} ${height} L ${first.x.toFixed(1)} ${height} Z`;
}

export default function HeroChartAnimation() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const frameTimer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % CHART_FRAMES.length);
    }, 3600);
    return () => clearInterval(frameTimer);
  }, []);

  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 12);
    }, 550);
    return () => clearInterval(pulseTimer);
  }, []);

  const bars = CHART_FRAMES[frameIndex];
  const svgPoints = buildSvgPoints(bars);
  const linePath = pointsToLinePath(svgPoints);
  const areaPath = pointsToAreaPath(svgPoints);
  const activePoint = svgPoints[pulseIndex] || svgPoints[svgPoints.length - 1];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#0f1f2b]/80 p-6 shadow-2xl backdrop-blur-xl"
      aria-hidden="true"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-primary/25 blur-3xl" />

      <div className="relative z-10 rounded-xl border border-white/10 bg-white/[0.04] p-5">
        {/* Animated SVG Curve */}
        <div className="relative h-44 w-full">
          <svg
            viewBox="0 0 360 160"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id="xpacyHeroArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8d5b5" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#e8d5b5" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="xpacyHeroLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7fb3d5" />
                <stop offset="55%" stopColor="#e8d5b5" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>

            {[32, 72, 112].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="360"
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4 4"
              />
            ))}

            <path
              d={areaPath}
              fill="url(#xpacyHeroArea)"
              className="transition-all duration-1000 ease-out"
            />
            <path
              d={linePath}
              fill="none"
              stroke="url(#xpacyHeroLine)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-1000 ease-out"
            />

            {activePoint && (
              <g className="transition-all duration-500 ease-out">
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="10"
                  fill="rgba(52, 211, 153, 0.22)"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="4.5"
                  fill="#34d399"
                  stroke="#0f1f2b"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Animated Bars */}
        <div className="mt-5 grid h-24 grid-cols-12 items-end gap-2">
          {bars.map((val, idx) => {
            const isHighlighted = idx === pulseIndex;
            return (
              <div
                key={idx}
                style={{ height: `${Math.max(18, val)}%` }}
                className={`w-full rounded-t-md transition-all duration-700 ease-out ${
                  isHighlighted
                    ? "bg-gradient-to-t from-emerald-500 to-secondary shadow-[0_0_14px_rgba(232,213,181,0.5)]"
                    : "bg-white/15"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
