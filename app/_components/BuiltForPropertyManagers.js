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
    <section className="py-20 md:py-28 px-6 md:px-[7%] bg-gray-50/70 border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          
          <h2 className="text-2xl font-bold font-sans text-primary tracking-tight">
            Built for Property Managers
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-mono">
            Every tool you need, engineered specifically to eliminate administrative bottlenecks and maximize rental yields.
          </p>
        </div>

        {/* Expanding Cards Row - Matching "Our Services" layout & interaction */}
        <div className="md:h-[400px] lg:h-[430px] flex md:space-x-2.5 md:flex-row flex-col space-y-4 md:space-y-0">
          {pmServices.map((service, idx) => (
            <div
              key={idx}
              className="group md:flex-1 md:h-full h-[380px] relative md:hover:flex-2 transition-all duration-300 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl border border-primary-100"
            >
              {/* Background & Default Content View */}
              <div
                className="h-full w-full bg-cover bg-center flex flex-col justify-between p-5 relative"
                style={{ backgroundImage: `url(${service.bg})` }}
              >
                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 z-0" />

              

                {/* Center Icon */}
                <div className="relative z-10 flex items-center justify-center my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                </div>

                {/* Bottom Title (Default view) */}
                <div className="relative z-10 text-center">
                
                  {/* Mobile-only CTA */}
                  <div className="md:hidden mt-3">
                    <a
                      href="#demo-form-card"
                      className="inline-flex items-center gap-1 px-3 py-1.5 font-mono rounded-lg font-bold bg-secondary text-primary-900 text-xs"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Hover / Active Expansion Overlay - Exact "Our Services" style */}
              <div className="hidden h-full bg-primary/95 absolute inset-0 group-active:flex group-active:flex-col group-active:items-center group-active:justify-center group-hover:flex group-hover:flex-col group-hover:items-center group-hover:justify-center space-y-4 text-white text-center p-6 font-mono z-20 backdrop-blur-xs transition-all duration-300">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary/20 text-secondary border border-secondary/30">
                  {service.tag}
                </span>
                <p className="text-lg md:text-xl font-bold font-sans text-white">
                  {service.title}
                </p>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-xs">
                  {service.body}
                </p>
                <div className="pt-2">
                  <a
                    href="#demo-form-card"
                    className="inline-flex items-center gap-1.5 px-4 py-2 font-mono rounded-lg font-bold bg-secondary hover:bg-secondary-500 text-primary-900 text-xs transition-colors shadow-sm"
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
