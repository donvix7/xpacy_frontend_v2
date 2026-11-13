import React from "react";
import { Search, Key, Building2, RefreshCw, ArrowRight } from "lucide-react";

export default function PMLifecycleSection() {
  const steps = [
    {
      title: "Prospect",
      description: "Online applications, lead capture, virtual tours & automated screening",
      icon: (
        <Search className="w-6 h-6 text-primary group-hover:text-secondary transition-colors duration-300" />
      ),
      badge: "Stage 01",
      bgColor: "bg-primary-100",
    },
    {
      title: "Lease",
      description: "Digital leases, e-signatures, move-in scheduling & onboarding",
      icon: (
        <Key className="w-6 h-6 text-[#c2a269] group-hover:text-secondary transition-colors duration-300" />
      ),
      badge: "Stage 02",
      bgColor: "bg-[#F5F0E7]",
    },
    {
      title: "Manage",
      description: "Maintenance workflows, work orders, vendor mgmt & inspections",
      icon: (
        <Building2 className="w-6 h-6 text-primary-700 group-hover:text-secondary transition-colors duration-300" />
      ),
      badge: "Stage 03",
      bgColor: "bg-blue-50",
    },
    {
      title: "Renew",
      description: "Automated renewals, satisfaction surveys & retention campaigns",
      icon: (
        <RefreshCw className="w-6 h-6 text-emerald-600 group-hover:text-secondary transition-colors duration-300" />
      ),
      badge: "Stage 04",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <section className="border-b border-gray-100 bg-white px-5 py-14 sm:px-6 sm:py-20 md:px-[7%] md:py-28">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-2xl space-y-3 text-center md:mb-16">
         
          <h2 className="text-2xl font-bold font-sans text-primary tracking-tight">
            The Complete PM Lifecycle
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-mono">
            From tenant discovery and credit checks to automated lease renewals and accounting.
          </p>
        </div>

        {/* 4-Step Flow */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-4 lg:gap-4 relative">
          {steps.map((step, idx) => (
            <div key={step.title} className="relative flex flex-col items-center text-center group">
              {/* Card Container - Solid bg-primary when hovered just like Built for PM card */}
              <div className="flex h-full w-full cursor-pointer flex-col items-center rounded-2xl border border-gray-200/80 bg-primary p-5 transition-all duration-300 hover:border-primary sm:p-6 md:p-7">
                {/* Stage Badge */}
                <span className="mb-4 rounded-full border border-secondary/30 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-secondary transition-all duration-300">
                  {step.badge}
                </span>

                {/* Icon Container */}
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl sm:mb-5 sm:h-14 sm:w-14 ${step.bgColor} shadow-2xs transition-all duration-300 group-hover:scale-110 group-hover:border group-hover:border-white/20 group-hover:bg-white/10`}
                >
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="mb-2 font-sans text-lg font-bold text-white transition-colors duration-300 sm:text-xl">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="font-mono text-[12.5px] leading-relaxed text-gray-200 transition-colors duration-300 sm:text-sm">
                  {step.description}
                </p>
              </div>

              {/* Connecting Arrow for Desktop */}
            
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
