// app/admin/add-new-owner/page.jsx
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronLeft,
  User,
  Mail,
  MapPin,
  Building2,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Phone,
} from "lucide-react";
import { addOwner } from "@/app/_lib/action";
import AdminHeader from "@/app/_components/AdminHeader";

// ---------- Server action ----------
async function submitOwner(formData) {
  "use server";
  const payload = {
    firstName: String(formData.get("firstName") || "").trim(),
    lastName: String(formData.get("lastName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    companyName: String(formData.get("companyName") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  };

  const result = await addOwner(payload);
  if (!result?.success || result?.error) {
    const msg =
      result?.message ||
      result?.errors?.[0]?.message ||
      "Failed to save owner.";
    redirect(
      `/admin/add-new-owner?error=${encodeURIComponent(msg)}&step=3`,
    );
  }
  redirect("/dashboard/admin/users?created=1");
}

// ---------- Constants ----------
const inputClass =
  "w-full rounded-lg border border-primary-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-gray-50";

const stepMeta = [
  {
    id: 1,
    title: "Personal Info",
    description: "First and last name of the property owner.",
  },
  {
    id: 2,
    title: "Contact",
    description: "Email, phone and mailing address.",
  },
  {
    id: 3,
    title: "Company",
    description: "Company name and any additional notes.",
  },
];

const fields = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "address",
  "companyName",
  "notes",
];

function Field({ label, htmlFor, required, error, children }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

function readForm(params, initialData) {
  return Object.fromEntries(
    fields.map((k) => [
      k,
      typeof params?.[k] === "string"
        ? params[k]
        : initialData?.[k] || "",
    ]),
  );
}

export default async function Page({ searchParams }) {
  const params = (await searchParams) || {};
  const step = Math.min(Math.max(Number(params.step) || 1, 1), 3);
  const form = readForm(params);
  const errorMsg =
    typeof params?.error === "string" ? params.error : null;

  const filled = fields.filter(
    (k) => String(form[k] || "").trim() !== "",
  ).length;
  const completion = Math.round((filled / fields.length) * 100);
  const stepTitle = stepMeta.find((s) => s.id === step)?.title;

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
      <AdminHeader title="Add Property Owner" backHref="/dashboard/admin/users" />

      {/* ---------- Three-column layout ---------- */}
      <main className="grid w-full flex-1 grid-cols-1 items-start gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[280px_minmax(0,1fr)_400px] lg:px-8 xl:grid-cols-[300px_minmax(0,1fr)_440px]">
        {/* ---------- LEFT: Steps rail ---------- */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-primary-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Add owner
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
              The owner will receive an invite email and can complete their
              profile after signing in.
            </p>
          </div>
        </aside>

        {/* ---------- MIDDLE: Form ---------- */}
        <section className="flex flex-col rounded-2xl border border-primary-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]">
          <div className="flex items-start justify-between gap-3 border-b border-primary-200/60 px-5 py-4 sm:px-7 sm:py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                <User className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-ink">
                  Owner details
                </p>
                <p className="mt-0.5 text-[12.5px] text-gray-500">
                  Step {step} of {stepMeta.length} · {stepTitle}
                </p>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700 sm:mx-7">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <p>{decodeURIComponent(errorMsg)}</p>
            </div>
          )}

          <form
            action={submitOwner}
            className="flex flex-col gap-5 p-5 sm:p-7"
          >
            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-1">
                <Field label="First name" htmlFor="firstName" required>
                  <input
                    id="firstName"
                    name="firstName"
                    className={inputClass}
                    required
                    defaultValue={form.firstName}
                    placeholder="Enter first name"
                  />
                </Field>
                <Field label="Last name" htmlFor="lastName" required>
                  <input
                    id="lastName"
                    name="lastName"
                    className={inputClass}
                    required
                    defaultValue={form.lastName}
                    placeholder="Enter last name"
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-1">
                <Field label="Email" htmlFor="email" required>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={inputClass}
                    required
                    defaultValue={form.email}
                    placeholder="name@company.com"
                  />
                </Field>
                <Field label="Phone" htmlFor="phone" required>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={inputClass}
                    required
                    defaultValue={form.phone}
                    placeholder="Enter phone number"
                  />
                </Field>
                  <Field label="Address" htmlFor="address" required>
                    <input
                      id="address"
                      name="address"
                      className={inputClass}
                      required
                      defaultValue={form.address}
                      placeholder="Enter address"
                    />
                  </Field>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-5">
                <Field label="Company name" htmlFor="companyName">
                  <input
                    id="companyName"
                    name="companyName"
                    className={inputClass}
                    defaultValue={form.companyName}
                    placeholder="Enter company name (optional)"
                  />
                </Field>
                <Field label="Notes" htmlFor="notes">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={5}
                    className={`${inputClass} resize-y`}
                    defaultValue={form.notes}
                    placeholder="Enter any notes about this owner..."
                  />
                </Field>
              </div>
            )}

            {/* Hidden carry-forward so switching steps preserves values. */}
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
                  href="/dashboard/admin/users"
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
                  Add owner
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
                  <User className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold text-ink">
                    {[form.firstName, form.lastName]
                      .filter(Boolean)
                      .join(" ") || "New owner"}
                  </h3>
                  <p className="mt-0.5 truncate text-[12px] text-gray-500">
                    {form.companyName || "No company set"}
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

              {form.address && (
                <div className="flex items-start gap-2 border-t border-primary-200/60 pt-3 text-[12.5px] text-gray-600">
                  <MapPin
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-700"
                    aria-hidden="true"
                  />
                  <span className="truncate">{form.address}</span>
                </div>
              )}

              {form.companyName && (
                <div className="flex items-center gap-2 border-t border-primary-200/60 pt-3 text-[12.5px] text-gray-600">
                  <Building2
                    className="h-3.5 w-3.5 shrink-0 text-primary-700"
                    aria-hidden="true"
                  />
                  <span className="truncate">{form.companyName}</span>
                </div>
              )}

              {form.notes && (
                <div className="border-t border-primary-200/60 pt-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Notes
                  </p>
                  <p className="mt-1 line-clamp-3 text-[12.5px] leading-relaxed text-gray-600">
                    {form.notes}
                  </p>
                </div>
              )}

              {!form.email &&
                !form.phone &&
                !form.address &&
                !form.companyName &&
                !form.notes && (
                  <p className="border-t border-primary-200/60 pt-3 text-[11.5px] text-gray-500">
                    Fill in contact, company and notes to see them appear here.
                  </p>
                )}
            </div>
          </div>

          <p className="mt-2 flex items-start gap-1.5 px-1 text-[11.5px] leading-relaxed text-gray-500">
            <ArrowRight
              className="mt-0.5 h-3 w-3 shrink-0"
              aria-hidden="true"
            />
            This is how the owner will appear in the admin directory.
          </p>
        </aside>
      </main>
    </div>
  );
}