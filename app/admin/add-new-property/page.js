"use client";

import { useCallback, useState } from "react";
import CreateNewPropertyForm from "@/app/_components/CreateNewPropertyForm";
import {
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Tag,
  User as UserIcon,
} from "lucide-react";
import AdminHeader from "@/app/_components/AdminHeader";

const stepMeta = [
  {
    id: 1,
    title: "Owners",
    description: "Pick who owns the property. The first becomes the primary owner.",
  },
  {
    id: 2,
    title: "Property",
    description: "Name, type, description and property attributes.",
  },
  {
    id: 3,
    title: "Location",
    description: "Address, city, state, country and coordinates.",
  },
];

const propertyTypeLabels = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  INDUSTRIAL: "Industrial",
  MIXED_USE: "Mixed use",
  LAND: "Land",
};

const initialPreview = {
  title: "",
  description: "",
  property_type: "RESIDENTIAL",
  city: "",
  state: "",
  address: "",
  country: "",
  owners: [],
};

export default function CreatePropertyWithPreview({
  owners,
  organizationId,
}) {
  const [preview, setPreview] = useState(initialPreview);
  const [step, setStep] = useState(1);

  const handleFormChange = useCallback((next) => {
    setPreview((prev) => (prev === next ? prev : { ...prev, ...next }));
  }, []);

  // Progress from fields that actually exist on the form.
  const required = [
    preview.owners?.length ? "ok" : "",
    preview.title,
    preview.property_type,
    preview.address,
    preview.city,
    preview.state,
    preview.country,
  ];
  const filled = required.filter((v) => String(v || "").trim() !== "").length;
  const completion = Math.round((filled / required.length) * 100);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-canvas text-ink">
      {/* ---------- Navigation ---------- */}
      <AdminHeader title="New Property" backHref="/dashboard/admin/properties" />

      {/* ---------- Three-column layout ---------- */}
      <main className="grid w-full flex-1 grid-cols-1 items-start gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[280px_minmax(0,1fr)_400px] lg:px-8 xl:grid-cols-[300px_minmax(0,1fr)_440px]">
        {/* ---------- LEFT: Steps rail ---------- */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-primary-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Add property
            </p>
            <p className="mt-1 text-[13.5px] font-semibold text-ink">
              What you'll fill in
            </p>

            <ol className="mt-4 flex flex-col gap-1">
              {stepMeta.map((s) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={`group flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors ${
                        isActive ? "bg-primary-50" : "hover:bg-primary-50/60"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${
                          isDone || isActive
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-700"
                        }`}
                      >
                        {isDone ? "✓" : s.id}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-[13px] font-semibold ${
                            isActive ? "text-primary-700" : "text-ink"
                          }`}
                        >
                          {s.title}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] leading-relaxed text-gray-500">
                          {s.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-5 border-t border-primary-200/60 pt-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Progress
                </p>
                <span className="text-[11px] font-semibold tabular-nums text-primary-700">
                  {filled}/{required.length}
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary-100"
                role="progressbar"
                aria-valuenow={completion}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-primary-600 transition-[width] duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-primary-200/60 bg-white/60 px-3 py-2.5">
            <CheckCircle2
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-700"
              aria-hidden="true"
            />
            <p className="text-[11.5px] leading-relaxed text-gray-600">
              Your progress saves as you type. Nothing is published until you
              choose to publish.
            </p>
          </div>
        </aside>

        {/* ---------- MIDDLE: Form ---------- */}
        <section className="flex flex-col rounded-2xl border border-primary-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]">
          <div className="flex items-start justify-between gap-3 border-b border-primary-200/60 px-5 py-4 sm:px-7 sm:py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                <Building2 className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-ink">
                  Property details
                </p>
                <p className="mt-0.5 text-[12.5px] text-gray-500">
                  Step {step} of {stepMeta.length} ·{" "}
                  {stepMeta.find((s) => s.id === step)?.title}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <CreateNewPropertyForm
              owners={owners}
              organizationId={organizationId}
              onChange={handleFormChange}
              step={step}
              onStepChange={setStep}
            />
          </div>
        </section>

        {/* ---------- RIGHT: Preview ---------- */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-primary-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]">
            <div className="flex items-center justify-between gap-3 border-b border-primary-200/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles
                  className="h-3.5 w-3.5 text-primary-700"
                  aria-hidden="true"
                />
                <p className="text-[12.5px] font-semibold text-ink">
                  Live preview
                </p>
              </div>
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10.5px] font-semibold tabular-nums text-primary-700">
                {completion}%
              </span>
            </div>

            <div className="flex flex-col gap-4 px-4 py-4">
              <div>
                <h3 className="truncate text-[15px] font-semibold text-ink">
                  {preview.title || "Untitled property"}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-[12.5px] text-gray-500">
                  <MapPin
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {[preview.city, preview.state]
                      .filter(Boolean)
                      .join(", ") || "Location not set"}
                  </span>
                </p>
                {preview.address && (
                  <p className="mt-0.5 truncate text-[11.5px] text-gray-500">
                    {preview.address}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-primary-200/70 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700">
                  <Tag className="h-3 w-3 text-primary-700" aria-hidden="true" />
                  {propertyTypeLabels[preview.property_type] ||
                    preview.property_type ||
                    "Type"}
                </span>
                {preview.owners?.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary-200/70 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700">
                    <Users
                      className="h-3 w-3 text-primary-700"
                      aria-hidden="true"
                    />
                    {preview.owners.length}{" "}
                    {preview.owners.length === 1 ? "owner" : "owners"}
                  </span>
                )}
              </div>

              {preview.owners?.length > 0 && (
                <div className="border-t border-primary-200/60 pt-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Owners
                  </p>
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {preview.owners.slice(0, 3).map((name, i) => (
                      <li
                        key={`${name}-${i}`}
                        className="flex items-center gap-1.5 text-[12px] text-gray-600"
                      >
                        <UserIcon
                          className="h-3 w-3 shrink-0 text-primary-700"
                          aria-hidden="true"
                        />
                        <span className="truncate">{name}</span>
                        {i === 0 && (
                          <span className="rounded-full bg-primary-50 px-1.5 py-px text-[9.5px] font-semibold uppercase tracking-[0.1em] text-primary-700">
                            Primary
                          </span>
                        )}
                      </li>
                    ))}
                    {preview.owners.length > 3 && (
                      <li className="text-[11.5px] text-gray-500">
                        +{preview.owners.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {preview.description && (
                <p className="line-clamp-4 border-t border-primary-200/60 pt-3 text-[12.5px] leading-relaxed text-gray-600">
                  {preview.description}
                </p>
              )}
            </div>
          </div>

          <p className="mt-2 flex items-start gap-1.5 px-1 text-[11.5px] leading-relaxed text-gray-500">
            <ArrowRight
              className="mt-0.5 h-3 w-3 shrink-0"
              aria-hidden="true"
            />
            This is how your listing will look to tenants and buyers.
          </p>
        </aside>
      </main>
    </div>
  );
}