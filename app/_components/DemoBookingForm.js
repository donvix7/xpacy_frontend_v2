"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles, Loader2, CalendarCheck, ShieldCheck, Server } from "lucide-react";

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

    // Simulate quick demo submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

  if (!isAuthenticated) {
    return (
      <div 
  id="demo-form-card" 
  className="relative overflow-hidden rounded-2xl p-8 text-center text-gray-900 shadow-2xl border border-white/40 bg-gradient-to-br from-white via-primary-50/60 to-primary-100/80 backdrop-blur-xl"
>
  {/* Decorative gradient blobs */}
  <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br from-primary-300/40 to-primary-500/20 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-gradient-to-tr from-primary-200/40 to-primary-400/20 blur-3xl" />

  {/* Subtle top highlight line */}
  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

  {/* Content (relative so it sits above decorations) */}
  <div className="relative">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-700 text-white  ring-4 ring-white/60">
      <Server className="h-7 w-7" />
    </div>

    <h3 className="bg-gradient-to-r from-primary-700 via-primary to-primary-600 bg-clip-text text-2xl font-bold font-sans text-transparent">
      Access Features
    </h3>

    <p className="mt-2 text-sm text-gray-600">
      Log in to access features and services.
    </p>

    <Link
      href="/auth/log-in?redirectUrl=%2F"
      className="group relative mt-6 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary-700 px-6 py-3 text-sm font-bold text-white  transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"
    >
      {/* Shine sweep on hover */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">Log in to Access</span>
    </Link>
  </div>
</div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-2xl border border-primary-100 text-center flex flex-col items-center justify-center min-h-[460px] animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold font-sans text-primary">
          Demo Request Confirmed!
        </h3>
        <p className="mt-2 text-sm text-gray-600 font-mono max-w-xs">
          Thanks <span className="font-bold text-gray-900">{formData.firstName || "there"}</span>. Our property management specialist will reach out to schedule your 30-minute walkthrough.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-primary-50/60 border border-primary-100 text-left w-full text-xs font-mono text-gray-700 space-y-1.5">
          <p><span className="font-bold text-primary">Company:</span> {formData.company || "Your organization"}</p>
          <p><span className="font-bold text-primary">Units:</span> {formData.units || "Flexible portfolio"}</p>
          <p><span className="font-bold text-primary">Priority:</span> {formData.challenge || "Streamlining operations"}</p>
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
    <div id="demo-form-card" className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-primary-100 text-gray-900">
      <div className="mb-6">
        <h3 className="text-2xl font-bold font-sans text-primary tracking-tight">
          See the Platform
        </h3>

      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-mono">
        {/* Name fields */}
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
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 bg-white"
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
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 bg-white"
            />
          </div>
        </div>

        {/* Email */}
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
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 bg-white"
          />
        </div>

        {/* Company Name */}
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
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 bg-white"
          />
        </div>

        {/* Phone Number */}
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
              className="w-full text-xs sm:text-sm px-3 py-2.5 focus:outline-none text-gray-900"
            />
          </div>
        </div>

        {/* How many units do you manage? */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            How many units do you manage?<span className="text-error">*</span>
          </label>
          <select
            name="units"
            required
            value={formData.units}
            onChange={handleChange}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 bg-white cursor-pointer"
          >
            <option value="">Please select one...</option>
            <option value="1-20">1 - 20 units</option>
            <option value="21-50">21 - 50 units</option>
            <option value="51-200">51 - 200 units</option>
            <option value="200+">200+ units</option>
          </select>
        </div>

        {/* What's your biggest PM challenge? */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            What&apos;s your biggest PM challenge?<span className="text-error">*</span>
          </label>
          <select
            name="challenge"
            required
            value={formData.challenge}
            onChange={handleChange}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 bg-white cursor-pointer"
          >
            <option value="">Please select one...</option>
            <option value="Tenant screening & leasing">Tenant screening & digital leasing</option>
            <option value="Rent collection & invoicing">Rent collection & financial accounting</option>
            <option value="Maintenance & work orders">Maintenance workflows & work orders</option>
            <option value="Owner reporting">Owner reporting & transparency</option>
            <option value="All of the above">All of the above (Complete automation)</option>
          </select>
        </div>

        {/* Submit CTA Button */}
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
