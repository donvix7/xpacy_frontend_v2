"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  ShieldCheck,
  Building2,
  Sparkles,
  Zap,
  KeyRound,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Activity,
  Layers,
} from "lucide-react";

const LIVE_EVENTS = [
  {
    id: 1,
    icon: Wallet,
    iconColor: "text-emerald-400 bg-emerald-500/15 ring-emerald-500/30",
    badge: "Auto-Deposit",
    badgeColor: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
    title: "Rent Collection · ₦850,000",
    detail: "Lekki Phase 1, Unit 4B · Nomba MFB Transfer",
    time: "Just now",
  },
  {
    id: 2,
    icon: KeyRound,
    iconColor: "text-amber-400 bg-amber-500/15 ring-amber-500/30",
    badge: "Digital Lease",
    badgeColor: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
    title: "Tenancy Agreement Executed",
    detail: "Victoria Island, Suite 12 · e-Signed & Verified",
    time: "2m ago",
  },
  {
    id: 3,
    icon: Zap,
    iconColor: "text-sky-400 bg-sky-500/15 ring-sky-500/30",
    badge: "Maintenance",
    badgeColor: "bg-sky-500/10 text-sky-300 ring-sky-500/20",
    title: "Smart Work Order Dispatched",
    detail: "Ikoyi Heights, Penthouse 3 · Facility Team On-site",
    time: "5m ago",
  },
  {
    id: 4,
    icon: Building2,
    iconColor: "text-purple-400 bg-purple-500/15 ring-purple-500/30",
    badge: "Owner Payout",
    badgeColor: "bg-purple-500/10 text-purple-300 ring-purple-500/20",
    title: "Disbursement Cleared · ₦4,200,000",
    detail: "Apex Portfolio · Automated Split Settlement",
    time: "11m ago",
  },
];

export default function DemoBookingForm() {
  const [activeEventIndex, setActiveEventIndex] = useState(0);

  // Cycle through live operational events
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveEventIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const trendPath =
    "M0,88 C30,85 55,72 85,74 C115,76 135,58 165,54 C195,50 220,60 250,42 C280,24 315,30 345,18 C370,8 390,12 420,6";

  const currentEvent = LIVE_EVENTS[activeEventIndex];
  const EventIcon = currentEvent.icon;

  return (
    <>
      <style>{`
        @keyframes stroke-flow {
          0% { stroke-dashoffset: 800; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes tracer-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.6); opacity: 0.2; }
        }
        @keyframes card-drift {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes glow-shift {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.1); }
        }
        @keyframes radar-wave {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .line-flow {
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: stroke-flow 3.5s cubic-bezier(0.2, 0.8, 0.2, 1) infinite alternate;
        }
        .tracer-dot {
          transform-box: fill-box;
          transform-origin: center;
          animation: tracer-pulse 2s ease-in-out infinite;
        }
        .radar-ring {
          transform-box: fill-box;
          transform-origin: center;
          animation: radar-wave 2.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
        .floating-card {
          animation: card-drift 7s ease-in-out infinite;
        }
        .ambient-glow {
          animation: glow-shift 8s ease-in-out infinite;
        }
      `}</style>

      <div className="relative mx-auto w-full max-w-lg select-none">
        {/* Ambient atmospheric glows */}
        <div className="ambient-glow pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
        <div className="ambient-glow pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

        {/* Outer Glassmorphic Showcase Card */}
        <div className="floating-card relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/12 via-white/[0.07] to-white/[0.03] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
          {/* Subtle noise / specular line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/30 to-primary/40 ring-1 ring-white/20">
                <Sparkles className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-[13px] font-bold tracking-tight text-white sm:text-[14px]">
                  Xpacy Engine
                </p>
                <p className="text-[10.5px] font-mono text-gray-300">
                  Real-time property operations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live Automation
            </div>
          </div>

          {/* Core Metric Visual Cards Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {/* Metric 1 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                  Inflow (MTD)
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400">
                  <TrendingUp className="mr-0.5 h-3 w-3" />
                  +18.4%
                </span>
              </div>
              <p className="mt-1.5 font-mono text-[19px] font-bold tracking-tight text-white tabular-nums sm:text-[22px]">
                ₦14.85M
              </p>
              <p className="mt-0.5 text-[10px] font-mono text-gray-400">
                99.2% on-time rate
              </p>
            </div>

            {/* Metric 2 */}
            <div className="group rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                  Occupancy
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold text-secondary">
                  142/144 units
                </span>
              </div>
              <p className="mt-1.5 font-mono text-[19px] font-bold tracking-tight text-white tabular-nums sm:text-[22px]">
                98.6%
              </p>
              <p className="mt-0.5 text-[10px] font-mono text-gray-400">
                2 leases renewing
              </p>
            </div>
          </div>

          {/* Animated Growth Waveform / Operations Curve */}
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10.5px]">
              <div className="flex items-center gap-1.5 font-mono text-gray-300">
                <Activity className="h-3.5 w-3.5 text-secondary" />
                <span>Yield Curve & Portfolio Velocity</span>
              </div>
              <span className="font-mono text-[10px] font-semibold text-emerald-400">
                +₦2.4M Peak
              </span>
            </div>

            {/* SVG Interactive Wave Graph */}
            <div className="relative mt-2 h-24 w-full">
              <svg
                viewBox="0 0 420 100"
                preserveAspectRatio="none"
                className="h-full w-full overflow-visible"
              >
                <defs>
                  <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="85%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>

                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>

                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Shaded Area */}
                <path
                  d={`${trendPath} L420,100 L0,100 Z`}
                  fill="url(#areaGradient)"
                />

                {/* Static reference grid lines */}
                <line x1="0" y1="30" x2="420" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="65" x2="420" y2="65" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                {/* Animated Primary Line */}
                <path
                  d={trendPath}
                  fill="none"
                  stroke="url(#curveGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  className="line-flow"
                />

                {/* Pulsing Highlight Node 1 */}
                <g transform="translate(165, 54)">
                  <circle r="8" className="radar-ring" fill="none" stroke="#818cf8" strokeWidth="1.2" />
                  <circle r="3.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1.5" />
                </g>

                {/* Pulsing Highlight Node 2 */}
                <g transform="translate(250, 42)">
                  <circle r="8" className="radar-ring" fill="none" stroke="#fbbf24" strokeWidth="1.2" />
                  <circle r="3.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
                </g>

                {/* Terminal Apex Node */}
                <g transform="translate(420, 6)">
                  <circle r="10" className="radar-ring" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                  <circle r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.8" className="tracer-dot" />
                </g>
              </svg>
            </div>
          </div>

          {/* Live Dynamic Event Feed (Smooth Auto-Cycling Animation) */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-gray-400">
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3 text-secondary" />
                Real-Time Workflow Trigger
              </span>
              <span className="text-secondary/90">Event {activeEventIndex + 1} of 4</span>
            </div>

            {/* Event Item with smooth keyframe transition */}
            <div
              key={currentEvent.id}
              className="flex items-center gap-3.5 rounded-2xl border border-white/15 bg-white/[0.08] p-3.5 shadow-lg backdrop-blur-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-2"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${currentEvent.iconColor}`}
              >
                <EventIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${currentEvent.badgeColor}`}
                  >
                    {currentEvent.badge}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                    <Clock className="h-2.5 w-2.5" />
                    {currentEvent.time}
                  </span>
                </div>
                <p className="mt-1 truncate text-[12.5px] font-semibold text-white">
                  {currentEvent.title}
                </p>
                <p className="truncate text-[10.5px] font-mono text-gray-300">
                  {currentEvent.detail}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Verification Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-mono text-gray-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
              <span>Automated Audits &amp; Reconciled</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>99.98% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
