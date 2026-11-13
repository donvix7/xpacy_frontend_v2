import React from "react";
import Link from "next/link";
import {
  User,
  Briefcase,
  Wrench,
  ClipboardList,
  Bot,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function BuiltForPropertyManagers() {
  const pmServices = [
    {
      title: "Tenant Portal",
      body: "Self-service portal for instant rent payments, maintenance requests, lease documents, and direct messaging.",
      tag: "Self-Service",
      bg: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000&auto=format&fit=crop",
      icon: <User className="w-8 h-8 text-secondary" />,
    },
    {
      title: "Owner Portal",
      body: "Real-time reports, automated financial statements, occupancy rates, and transparent portfolio performance for owners.",
      tag: "Transparency",
      bg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop",
      icon: <Briefcase className="w-8 h-8 text-secondary" />,
    },
    {
      title: "Maintenance Workflows",
      body: "AI-triaged requests, automated work orders, vendor assignments, and completion tracking with photo proof.",
      tag: "Automation",
      bg: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop",
      icon: <Wrench className="w-8 h-8 text-secondary" />,
    },
    {
      title: "Lease Management",
      body: "Digital leases, automated renewals, rent escalation tracking, and full regional compliance management.",
      tag: "E-Signatures",
      bg: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
      icon: <ClipboardList className="w-8 h-8 text-secondary" />,
    },
    {
      title: "Unified Dashboard",
      body: "Live occupancy, NOI, rent collection velocities, and operational KPIs — all in one centralized real-time view.",
      tag: "Analytics",
      bg: "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1000&auto=format&fit=crop",
      icon: <BarChart3 className="w-8 h-8 text-secondary" />,
    },
  ];

  return (
    <section className="border-b border-gray-200/60 bg-gray-50/70 px-5 py-14 sm:px-6 sm:py-20 md:px-[7%] md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-2xl space-y-3 text-center md:mb-14">
          
          <h2 className="text-2xl font-bold font-sans text-primary tracking-tight">
            Built for Property Managers
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-mono">
            Every tool you need, engineered specifically to eliminate administrative bottlenecks and maximize rental yields.
          </p>
        </div>

        {/* Expanding Cards Row - Matching "Our Services" layout & interaction */}
        <div className="flex flex-col space-y-3 sm:space-y-4 md:h-[400px] md:flex-row md:space-x-2.5 md:space-y-0 lg:h-[430px]">
          {pmServices.map((service, idx) => (
            <div
              key={idx}
              className="group relative h-[300px] w-full overflow-hidden rounded-xl border border-primary-100 shadow-md transition-all duration-300 md:h-full md:flex-1 md:hover:flex-2 md:hover:shadow-2xl"
            >
              {/* Background & Default Content View */}
              <div
                className="relative flex h-full w-full flex-col bg-cover bg-center"
                style={{ backgroundImage: `url(${service.bg})` }}
              >
                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/90 via-black/50 to-black/25" />

                {/* Mobile: always-on readable summary (no hover on touch) */}
                <div className="relative z-10 flex h-full flex-col justify-end gap-2 p-5 md:hidden">
                  <span className="w-fit rounded-full border border-secondary/30 bg-secondary/15 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-secondary">
                    {service.tag}
                  </span>
                  <p className="font-sans text-lg font-bold leading-snug text-white">
                    {service.title}
                  </p>
                  <p className="line-clamp-3 font-mono text-[12.5px] leading-relaxed text-gray-200">
                    {service.body}
                  </p>
                  <a
                    href="#demo-form-card"
                    className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg bg-secondary px-3.5 py-2 font-mono text-xs font-bold text-primary-900"
                  >
                    <span>Book a Demo</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Desktop: centered icon + title until hover */}
                <div className="relative z-10 hidden h-full flex-col items-center justify-center p-5 md:flex">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-black/40 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                    {service.icon}
                  </div>
                  <p className="absolute inset-x-0 bottom-5 px-4 text-center font-sans text-base font-bold text-white">
                    {service.title}
                  </p>
                </div>
              </div>

              {/* Desktop hover / active expansion overlay - "Our Services" style */}
              <div className="absolute inset-0 z-20 hidden flex-col items-center justify-center gap-3 bg-primary/95 p-6 text-center font-mono text-white opacity-0 backdrop-blur-xs transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 md:flex">
                <span className="rounded-full border border-secondary/30 bg-secondary/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                  {service.tag}
                </span>
                <p className="font-sans text-lg font-bold text-white md:text-xl">
                  {service.title}
                </p>
                <p className="max-w-xs text-xs leading-relaxed text-gray-200 sm:text-sm">
                  {service.body}
                </p>
                <div className="pt-2">
                  <a
                    href="#demo-form-card"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 font-mono text-xs font-bold text-primary-900 shadow-sm transition-colors hover:bg-secondary-500"
                  >
                    <span>Book a Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
