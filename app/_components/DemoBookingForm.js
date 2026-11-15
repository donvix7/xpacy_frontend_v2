"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  CalendarCheck,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function DemoBookingForm({ isAuthenticated = false }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    countryCode: "+234",
    phone: "",
    units: "",
    challenge: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

  if (!isAuthenticated) {
    const trendPath =
      "M0,95 C20,92 40,80 60,78 C80,76 100,82 120,72 C140,62 160,55 180,58 C200,61 220,45 240,42 C260,39 280,30 300,28 C320,26 340,20 360,15 C375,12 390,10 400,8";

    const comparePath =
      "M0,105 C20,100 40,95 60,92 C80,90 100,88 120,84 C140,80 160,75 180,72 C200,70 220,65 240,60 C260,58 280,52 300,48 C320,45 340,40 360,36 C375,32 390,30 400,28";

    const peaks = [
      { cx: 240, cy: 42, value: "48k", delay: "0.85s" },
      { cx: 300, cy: 28, value: "76k", delay: "1.15s" },
      { cx: 360, cy: 15, value: "98k", delay: "1.5s" },
    ];

    return (
      <>
        <style>{`
          @keyframes line-draw {
            0%   { stroke-dashoffset: 1200; opacity: 0; }
            15%  { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes area-fade {
            0%   { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes point-pop {
            0%   { transform: scale(0); opacity: 0; }
            55%  { transform: scale(1.35); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes point-ring {
            0%, 100% { transform: scale(1); opacity: 0.55; }
            50%      { transform: scale(1.7); opacity: 0.15; }
          }
          @keyframes grid-fade {
            0%, 100% { opacity: 0.32; }
            50%      { opacity: 0.55; }
          }
          @keyframes bg-hue {
            0%, 100% { background-position: 0% 50%; }
            50%      { background-position: 100% 50%; }
          }
          @keyframes orb-pulse {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.55; }
            50%      { transform: translateY(-8px) scale(1.06); opacity: 0.85; }
          }
          @keyframes drift {
            0%, 100% { transform: translate(0, 0); }
            50%      { transform: translate(8px, -8px); }
          }
          @keyframes live-pulse {
            0%, 100% { opacity: 1;   transform: scale(1); }
            50%      { opacity: 0.6; transform: scale(1.1); }
          }
          @keyframes label-fade {
            0%   { opacity: 0; transform: translateY(4px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes live-dot-ring {
            0%   { transform: scale(1); opacity: 0.6; }
            80%  { transform: scale(2.4); opacity: 0; }
            100% { transform: scale(2.4); opacity: 0; }
          }

          .estate-bg {
            background: linear-gradient(
              125deg,
              #fdfbf6 0%,
              #f0f4fb 30%,
              #fbf5ea 55%,
              #eef3fc 80%,
              #fdfbf6 100%
            );
            background-size: 240% 240%;
            animation: bg-hue 22s ease-in-out infinite;
          }

          .trend-line {
            stroke-dasharray: 1200;
            stroke-dashoffset: 1200;
            animation: line-draw 3.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          .trend-area   { animation: area-fade 2.4s ease-out 1.1s both; }
          .trend-point  { transform-box: fill-box; transform-origin: center; animation: point-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
          .trend-ring   { transform-box: fill-box; transform-origin: center; animation: point-ring 3s ease-in-out infinite; }
          .peak-label   { transform-box: fill-box; transform-origin: center; animation: label-fade 0.6s ease-out both; }
          .grid-line    { animation: grid-fade 4s ease-in-out infinite; }
          .orb-pulse    { animation: orb-pulse 6s ease-in-out infinite; }
          .drift-a      { animation: drift 12s ease-in-out infinite; }
          .drift-b      { animation: drift 14s ease-in-out infinite reverse; }
          .live-dot     { animation: live-pulse 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          .live-ring    { animation: live-dot-ring 2s ease-out infinite; transform-box: fill-box; transform-origin: center; }

          .arrow-group { filter: drop-shadow(0 0 3px rgba(245, 158, 11, 0.6)); }

          @media (prefers-reduced-motion: reduce) {
            .estate-bg, .trend-line, .trend-area, .trend-point, .trend-ring,
            .grid-line, .orb-pulse, .drift-a, .drift-b, .live-dot, .live-ring,
            .peak-label { animation: none !important; }
            .trend-line { stroke-dashoffset: 0; }
            .arrow-group { display: none; }
          }
        `}</style>

        <div
          id="demo-form-card"
          className="estate-bg relative overflow-hidden rounded-2xl border border-primary-100/80 p-5 text-center text-gray-900 shadow-xl shadow-primary-900/10 sm:p-8"
        >
          {/* Warm halo */}
          <div className="orb-pulse pointer-events-none absolute left-1/2 top-1/3 -z-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-100/70 via-primary-100/40 to-transparent blur-3xl" />

          {/* Drifting accents */}
          <div className="drift-a pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-gradient-to-br from-primary-200/40 to-primary-300/20 blur-3xl" />
          <div className="drift-b pointer-events-none absolute -bottom-24 -left-20 h-44 w-44 rounded-full bg-gradient-to-tr from-amber-100/50 to-amber-200/30 blur-3xl" />

          {/* ============ Trending line chart (dominant) ============ */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] select-none sm:h-[72%]"
            aria-hidden="true"
          >
            {/* Chart header (left) + Live badge (right) */}
            <div className="absolute left-5 top-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-primary-800 backdrop-blur-sm ring-1 ring-primary-100/80">
                <TrendingUp className="h-2.5 w-2.5" />
                Portfolio value
              </span>
            </div>
            <div className="absolute right-4 top-2 flex items-center gap-1 rounded-full bg-white/70 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.1em] text-emerald-700 backdrop-blur-sm ring-1 ring-emerald-100">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </div>

            {/* Y-axis */}
            <div className="absolute inset-y-9 left-2 flex flex-col justify-between text-[8px] font-medium tabular-nums text-primary-900/35">
              <span>100k</span>
              <span>75k</span>
              <span>50k</span>
              <span>25k</span>
              <span>0</span>
            </div>

            {/* Gridlines */}
            <div className="absolute inset-x-6 inset-y-9 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="relative h-px w-full">
                  <div
                    className={`grid-line h-px w-full ${
                      i === 4 ? "bg-primary-300/50" : "bg-primary-200/40"
                    }`}
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                  {i < 4 && (
                    <div
                      className="grid-line absolute inset-x-0 top-[12px] h-px w-full bg-primary-200/20"
                      style={{ animationDelay: `${i * 0.3 + 0.15}s` }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* SVG chart */}
            <svg
              className="absolute inset-x-6 inset-y-9 h-[calc(100%-2.25rem)] w-[calc(100%-3rem)]"
              viewBox="0 0 400 120"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="55%" stopColor="#6366f1" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="45%" stopColor="#3b82f6" />
                  <stop offset="80%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <filter id="arrowGlow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="1.8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                className="trend-area"
                d={`${trendPath} L400,120 L0,120 Z`}
                fill="url(#areaGrad)"
              />

              <path
                d={comparePath}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.3"
                strokeDasharray="4 4"
                strokeLinecap="round"
                opacity="0.5"
              />

              <path
                className="trend-line"
                d={trendPath}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path id="arrowGuide" d={trendPath} fill="none" stroke="none" />

              {peaks.map((p, i) => (
                <g key={i}>
                  <circle
                    className="trend-ring"
                    cx={p.cx}
                    cy={p.cy}
                    r="4"
                    fill="#f59e0b"
                    opacity="0.25"
                    style={{ animationDelay: p.delay }}
                  />
                  <circle
                    className="trend-point"
                    cx={p.cx}
                    cy={p.cy}
                    r="2.4"
                    fill="#f59e0b"
                    stroke="#fff"
                    strokeWidth="1.2"
                    style={{ animationDelay: p.delay }}
                  />
                  <g className="peak-label" style={{ animationDelay: p.delay }}>
                    <rect
                      x={p.cx - 18}
                      y={p.cy - 22}
                      width="36"
                      height="13"
                      rx="3"
                      fill="#ffffff"
                      stroke="#fcd34d"
                      strokeWidth="0.8"
                    />
                    <text
                      x={p.cx}
                      y={p.cy - 12.5}
                      textAnchor="middle"
                      fontSize="6.5"
                      fontWeight="700"
                      fill="#92400e"
                      fontFamily="ui-monospace, monospace"
                    >
                      {p.value}
                    </text>
                  </g>
                </g>
              ))}

              <g className="arrow-group" filter="url(#arrowGlow)">
                <g>
                  <path
                    d="M0,0 L-7,3.5 L-3.5,0 L-7,-3.5 Z"
                    fill="#f59e0b"
                    stroke="#fff"
                    strokeWidth="0.9"
                    strokeLinejoin="round"
                  />
                  <animateMotion
                    dur="3.6s"
                    fill="freeze"
                    rotate="auto"
                    calcMode="spline"
                    keyPoints="0;1"
                    keyTimes="0;1"
                    keySplines="0.22 1 0.36 1"
                  >
                    <mpath href="#arrowGuide" />
                  </animateMotion>
                </g>
              </g>

              <g>
                <circle
                  className="live-ring"
                  cx="400"
                  cy="8"
                  r="3.2"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                />
                <circle
                  className="trend-ring"
                  cx="400"
                  cy="8"
                  r="5"
                  fill="#f59e0b"
                  opacity="0.2"
                />
                <circle
                  className="live-dot"
                  cx="400"
                  cy="8"
                  r="3"
                  fill="#fff"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                />
              </g>
            </svg>

            <div className="absolute inset-x-6 bottom-3 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
          </div>

          {/* ============ Minimal foreground ============ */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Icon */}
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg shadow-primary-900/25 ring-1 ring-white/60">
              <TrendingUp className="h-7 w-7" />
            </div>

            {/* Single headline */}
            <h3 className="max-w-[15ch] text-[28px] font-bold leading-[1.15] tracking-[-0.5px] text-ink">
              Access the platform
            </h3>

            {/* CTA */}
            <Link
              href="/auth/log-in?redirectUrl=%2F"
              className="group relative mt-6 inline-flex items-center justify-center overflow-hidden rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-800 hover:shadow-lg hover:shadow-primary-900/30"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Log in to access</span>
            </Link>

            {/* One security line */}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Secure sign-in · SSO supported
            </p>
          </div>
        </div>
      </>
    );
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-2xl border border-primary-100 text-center flex flex-col items-center justify-center sm:min-h-[460px] sm:p-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold font-sans text-primary">
          Demo Request Confirmed!
        </h3>
        <p className="mt-2 text-sm text-gray-600 font-mono max-w-xs">
          Thanks{" "}
          <span className="font-bold text-gray-900">
            {formData.firstName || "there"}
          </span>
          . Our property management specialist will reach out to schedule your
          30-minute walkthrough.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-primary-50/60 border border-primary-100 text-left w-full text-xs font-mono text-gray-700 space-y-1.5">
          <p>
            <span className="font-bold text-primary">Company:</span>{" "}
            {formData.company || "Your organization"}
          </p>
          <p>
            <span className="font-bold text-primary">Units:</span>{" "}
            {formData.units || "Flexible portfolio"}
          </p>
          <p>
            <span className="font-bold text-primary">Priority:</span>{" "}
            {formData.challenge || "Streamlining operations"}
          </p>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-xs text-primary font-bold hover:underline"
        >
          Book for another property
        </button>
      </div>
    );
  }

  return (
    <div
      id="demo-form-card"
      className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-primary-100 text-gray-900"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold font-sans text-primary tracking-tight">
          See the Platform
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Name<span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              required
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Last Name<span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              required
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Professional Email<span className="text-error">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="your@company.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Company name<span className="text-error">*</span>
          </label>
          <input
            type="text"
            name="company"
            required
            placeholder="e.g. Xpacy, Apex Real Estate"
            value={formData.company}
            onChange={handleChange}
            className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary bg-white">
            <div className="flex items-center gap-1.5 px-3 bg-gray-50 border-r border-gray-200 text-xs text-gray-700 shrink-0 font-sans">
              <span>🇳🇬</span>
              <span className="font-bold">+234</span>
            </div>
            <input
              type="tel"
              name="phone"
              placeholder="801 234 5678"
              value={formData.phone}
              onChange={handleChange}
              className="w-full text-base sm:text-sm px-3 py-3 focus:outline-none text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            How many units do you manage?<span className="text-error">*</span>
          </label>
          <select
            name="units"
            required
            value={formData.units}
            onChange={handleChange}
            className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 bg-white cursor-pointer"
          >
            <option value="">Please select one...</option>
            <option value="1-20">1 - 20 units</option>
            <option value="21-50">21 - 50 units</option>
            <option value="51-200">51 - 200 units</option>
            <option value="200+">200+ units</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            What&apos;s your biggest PM challenge?<span className="text-error">*</span>
          </label>
          <select
            name="challenge"
            required
            value={formData.challenge}
            onChange={handleChange}
            className="w-full text-base sm:text-sm px-3.5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 bg-white cursor-pointer"
          >
            <option value="">Please select one...</option>
            <option value="Tenant screening & leasing">Tenant screening & digital leasing</option>
            <option value="Rent collection & invoicing">Rent collection & financial accounting</option>
            <option value="Maintenance & work orders">Maintenance workflows & work orders</option>
            <option value="Owner reporting">Owner reporting & transparency</option>
            <option value="All of the above">All of the above (Complete automation)</option>
          </select>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-900 text-white font-sans font-bold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scheduling walkthrough...</span>
              </>
            ) : (
              <span>Join us</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}