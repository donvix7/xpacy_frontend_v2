// app/admin/add-new-organization/page.jsx
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe2,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { createOrganization } from "@/app/_lib/action";
import AdminHeader from "@/app/_components/AdminHeader";

// ---------- Server action ----------
async function submitOrganization(formData) {
  "use server";
  const values = Object.fromEntries(formData.entries());
  const result = await createOrganization(values);
  const organization =
    result?.data?.organization ||
    result?.data ||
    result?.organization ||
    result;
  const id = organization?.id || organization?._id;
  if (
    result?.success === false ||
    result?.error ||
    result?.statusCode >= 400
  ) {
    redirect("/admin/add-new-organization?error=1&step=3");
  }
  redirect(
    id
      ? `/dashboard/admin/organizations/${id}`
      : "/dashboard/admin/organizations",
  );
}

// ---------- Constants ----------
const inputClass =
  "w-full rounded-lg border border-primary-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-gray-50";

const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236b7280%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`;

const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "NGN", label: "NGN — Nigerian Naira" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC — Coordinated Universal Time" },
  { value: "Africa/Abidjan", label: "Africa/Abidjan (GMT)" },
  { value: "Africa/Accra", label: "Africa/Accra (GMT)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (EET)" },
  { value: "Africa/Casablanca", label: "Africa/Casablanca (WET)" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (SAST)" },
  { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi (EAT)" },
];

const stepMeta = [
  {
    id: 1,
    title: "Identity",
    description: "Name and slug — how the organization is identified.",
  },
  {
    id: 2,
    title: "Contact",
    description: "Email, phone and mailing address.",
  },
  {
    id: 3,
    title: "Preferences",
    description: "Timezone and billing currency.",
  },
];

const fields = [
  "name",
  "slug",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "country",
  "timezone",
  "currency",
];

function Field({ label, htmlFor, required, children }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

// Read only the values we care about from searchParams, applying defaults.
function readForm(params) {
  return Object.fromEntries(
    fields.map((k) => [k, typeof params?.[k] === "string" ? params[k] : ""]),
  );
}

export default async function Page({ searchParams }) {
  const params = (await searchParams) || {};
  const step = Math.min(Math.max(Number(params.step) || 1, 1), 3);
  const form = readForm(params);
  const hasError = !!params?.error;

  const filled = fields.filter((k) => String(form[k] || "").trim() !== "").length;
  const completion = Math.round((filled / fields.length) * 100);
  const stepTitle = stepMeta.find((s) => s.id === step)?.title;

  // Build a query string that preserves the current form values when the
  // user changes steps, so nothing is lost.
  const buildQuery = (overrides = {}) => {
    const next = { ...form, step: String(step), ...overrides };
    const qs = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        qs.set(k, String(v));
      }
    });
    return qs.toString();
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-canvas text-ink">
      {/* ---------- Navigation ---------- */}
      <AdminHeader title="New Organization" backHref="/dashboard/admin/organizations" />

      {/* ---------- Three-column layout ---------- */}
      <main className="grid w-full flex-1 grid-cols-1 items-start gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[280px_minmax(0,1fr)_400px] lg:px-8 xl:grid-cols-[300px_minmax(0,1fr)_440px]">
        {/* ---------- LEFT: Steps rail ---------- */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-primary-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Create organization
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
                    <Link
                      href={`?${buildQuery({ step: String(s.id) })}`}
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
                    </Link>
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
                  {filled}/{fields.length}
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
              You can change any of these later from the organization settings.
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
                  Organization details
                </p>
                <p className="mt-0.5 text-[12.5px] text-gray-500">
                  Step {step} of {stepMeta.length} · {stepTitle}
                </p>
              </div>
            </div>
          </div>

          {hasError && (
            <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700 sm:mx-7">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                Could not create the organization. Please review the details and
                try again.
              </p>
            </div>
          )}

          <form
            action={submitOrganization}
            className="flex flex-col gap-5 p-5 sm:p-7"
          >
            {/* Step 1 */}
            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-1">
                <Field label="Organization name" htmlFor="name" required>
                  <input
                    id="name"
                    className={inputClass}
                    name="name"
                    required
                    defaultValue={form.name}
                  />
                </Field>
                <Field label="Slug" htmlFor="slug" required>
                  <input
                    id="slug"
                    className={inputClass}
                    name="slug"
                    required
                    placeholder="acme-properties"
                    defaultValue={form.slug}
                  />
                </Field>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-1">
                <Field label="Email" htmlFor="email">
                  <input
                    id="email"
                    className={inputClass}
                    name="email"
                    type="email"
                    defaultValue={form.email}
                  />
                </Field>
                <Field label="Phone" htmlFor="phone">
                  <input
                    id="phone"
                    className={inputClass}
                    name="phone"
                    type="tel"
                    defaultValue={form.phone}
                  />
                </Field>
                  <Field label="Address" htmlFor="address">
                    <input
                      id="address"
                      className={inputClass}
                      name="address"
                      defaultValue={form.address}
                    />
                  </Field>
                <Field label="City" htmlFor="city">
                  <input
                    id="city"
                    className={inputClass}
                    name="city"
                    defaultValue={form.city}
                  />
                </Field>
                <Field label="State / Province" htmlFor="state">
                  <input
                    id="state"
                    className={inputClass}
                    name="state"
                    defaultValue={form.state}
                  />
                </Field>
                <Field label="Country" htmlFor="country">
                  <input
                    id="country"
                    className={inputClass}
                    name="country"
                    defaultValue={form.country}
                  />
                </Field>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="grid gap-5 sm:grid-cols-1">
                <Field label="Timezone" htmlFor="timezone">
                  <select
                    id="timezone"
                    className={selectClass}
                    name="timezone"
                    defaultValue={form.timezone}
                  >
                    <option value="" disabled>
                      Select a timezone
                    </option>
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Currency" htmlFor="currency">
                  <select
                    id="currency"
                    className={selectClass}
                    name="currency"
                    defaultValue={form.currency}
                  >
                    <option value="" disabled>
                      Select a currency
                    </option>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            {/* Hidden carry-forward inputs so switching steps preserves values
                even though the visible inputs are per-step. */}
            {fields.map((k) => (
              <input
                key={k}
                type="hidden"
                name={k}
                value={form[k] || ""}
                readOnly
              />
            ))}

            <div className="flex flex-wrap justify-between gap-3 border-t border-primary-200/60 pt-5">
              {step > 1 ? (
                <Link
                  href={`?${buildQuery({ step: String(step - 1) })}`}
                  className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  Previous
                </Link>
              ) : (
                <Link
                  href="/dashboard/admin/organizations"
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Link>
              )}
              {step < 3 ? (
                <Link
                  href={`?${buildQuery({ step: String(step + 1) })}`}
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Next
                </Link>
              ) : (
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Create organization
                </button>
              )}
            </div>
          </form>
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
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold text-ink">
                    {form.name || "Untitled organization"}
                  </h3>
                  <p className="mt-0.5 truncate text-[12px] text-gray-500">
                    {form.slug ? `/${form.slug}` : "Slug not set"}
                  </p>
                </div>
              </div>

              {form.email && (
                <div className="flex items-center gap-2 border-t border-primary-200/60 pt-3 text-[12.5px] text-gray-600">
                  <Mail
                    className="h-3.5 w-3.5 shrink-0 text-primary-700"
                    aria-hidden="true"
                  />
                  <span className="truncate">{form.email}</span>
                </div>
              )}

              {form.phone && (
                <div className="flex items-center gap-2 text-[12.5px] text-gray-600">
                  <Phone
                    className="h-3.5 w-3.5 shrink-0 text-primary-700"
                    aria-hidden="true"
                  />
                  <span className="truncate">{form.phone}</span>
                </div>
              )}

              {(form.address || form.city || form.state || form.country) && (
                <div className="flex items-start gap-2 border-t border-primary-200/60 pt-3 text-[12.5px] text-gray-600">
                  <MapPin
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-700"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    {form.address && (
                      <span className="block truncate">{form.address}</span>
                    )}
                    {(form.city || form.state || form.country) && (
                      <span className="block text-gray-500">
                        {[form.city, form.state, form.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-1.5 border-t border-primary-200/60 pt-3">
                {form.timezone && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary-200/70 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700">
                    <Globe2
                      className="h-3 w-3 text-primary-700"
                      aria-hidden="true"
                    />
                    {form.timezone}
                  </span>
                )}
                {form.currency && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary-200/70 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700">
                    <DollarSign
                      className="h-3 w-3 text-primary-700"
                      aria-hidden="true"
                    />
                    {form.currency}
                  </span>
                )}
                {!form.timezone && !form.currency && (
                  <span className="text-[11.5px] text-gray-500">
                    Timezone and currency not set
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="mt-2 flex items-start gap-1.5 px-1 text-[11.5px] leading-relaxed text-gray-500">
            <ArrowRight
              className="mt-0.5 h-3 w-3 shrink-0"
              aria-hidden="true"
            />
            This is how the organization will appear across the admin console.
          </p>
        </aside>
      </main>
    </div>
  );
}