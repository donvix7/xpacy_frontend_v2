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
    <section className="py-20 md:py-28 px-6 md:px-[7%] bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
         
          <h2 className="text-2xl font-bold font-sans text-primary tracking-tight">
            The Complete PM Lifecycle
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-mono">
            From tenant discovery and credit checks to automated lease renewals and accounting.
          </p>
        </div>

        {/* 4-Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-4 relative">
          {steps.map((step, idx) => (
            <div key={step.title} className="relative flex flex-col items-center text-center group">
              {/* Card Container - Solid bg-primary when hovered just like Built for PM card */}
              <div className="w-full h-full p-6 sm:p-7 rounded-2xl bg-primary border border-gray-200/80 hover:border-primary transition-all duration-300 flex flex-col items-center cursor-pointer">
                {/* Stage Badge */}
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono px-2.5 py-1 rounded-full text-secondary border border-secondary/30 mb-4 transition-all duration-300">
                  {step.badge}
                </span>

                {/* Icon Container */}
                <div
                  className={`w-14 h-14 rounded-2xl ${step.bgColor} group-hover:bg-white/10 group-hover:border group-hover:border-white/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300 shadow-2xs`}
                >
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold font-sans text-white mb-2 transition-colors duration-300">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm  text-gray-200 font-mono leading-relaxed transition-colors duration-300">
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
