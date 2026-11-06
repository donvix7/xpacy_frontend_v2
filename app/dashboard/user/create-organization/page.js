import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createOrganization } from "@/app/_lib/action";
import { redirect } from "next/navigation";

async function submitOrganization(formData) {
    "use server";
    const values = Object.fromEntries(formData.entries());
    const result = await createOrganization(values);
    const organization = result?.data?.organization || result?.data || result?.organization || result;
    const id = organization?.id || organization?._id;
    if (result?.success === false || result?.error || result?.statusCode >= 400) {
        redirect("/dashboard/admin/organizations/create?error=1");
    }
    redirect(id ? `/dashboard/admin/organizations/${id}` : "/dashboard/admin/organizations");
}

const inputClass = "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

const CURRENCIES = [
    { code: "USD", label: "USD — US Dollar" },
    { code: "EUR", label: "EUR — Euro" },
    { code: "GBP", label: "GBP — British Pound" },
    { code: "NGN", label: "NGN — Nigerian Naira" },

    /*
    { code: "CAD", label: "CAD — Canadian Dollar" },
    { code: "AUD", label: "AUD — Australian Dollar" },
    { code: "NZD", label: "NZD — New Zealand Dollar" },
    { code: "JPY", label: "JPY — Japanese Yen" },
    { code: "CNY", label: "CNY — Chinese Yuan" },
    { code: "INR", label: "INR — Indian Rupee" },
    { code: "CHF", label: "CHF — Swiss Franc" },
    { code: "SEK", label: "SEK — Swedish Krona" },
    { code: "NOK", label: "NOK — Norwegian Krone" },
    { code: "DKK", label: "DKK — Danish Krone" },
    { code: "ZAR", label: "ZAR — South African Rand" },
    { code: "BRL", label: "BRL — Brazilian Real" },
    { code: "MXN", label: "MXN — Mexican Peso" },
    { code: "SGD", label: "SGD — Singapore Dollar" },
    { code: "HKD", label: "HKD — Hong Kong Dollar" },
    { code: "KRW", label: "KRW — South Korean Won" },
    { code: "AED", label: "AED — UAE Dirham" },
    { code: "SAR", label: "SAR — Saudi Riyal" },
    { code: "KES", label: "KES — Kenyan Shilling" },
    { code: "GHS", label: "GHS — Ghanaian Cedi" },
    { code: "EGP", label: "EGP — Egyptian Pound" },
    { code: "PLN", label: "PLN — Polish Zloty" },
    { code: "TRY", label: "TRY — Turkish Lira" },
    { code: "RUB", label: "RUB — Russian Ruble" },
    { code: "IDR", label: "IDR — Indonesian Rupiah" },
    { code: "MYR", label: "MYR — Malaysian Ringgit" },
    { code: "PHP", label: "PHP — Philippine Peso" },
    { code: "THB", label: "THB — Thai Baht" },
    { code: "VND", label: "VND — Vietnamese Dong" },
    { code: "PKR", label: "PKR — Pakistani Rupee" },
    { code: "BDT", label: "BDT — Bangladeshi Taka" },
    { code: "ARS", label: "ARS — Argentine Peso" },
    { code: "CLP", label: "CLP — Chilean Peso" },
    { code: "COP", label: "COP — Colombian Peso" },
    { code: "PEN", label: "PEN — Peruvian Sol" },
    { code: "ILS", label: "ILS — Israeli Shekel" },
     */
];

const TIMEZONES = [
    // UTC
    { value: "UTC", label: "UTC — Coordinated Universal Time" },
    // Africa
    { value: "Africa/Abidjan", label: "Africa/Abidjan (GMT)" },
    { value: "Africa/Accra", label: "Africa/Accra (GMT)" },
    { value: "Africa/Cairo", label: "Africa/Cairo (EET)" },
    { value: "Africa/Casablanca", label: "Africa/Casablanca (WET)" },
    { value: "Africa/Johannesburg", label: "Africa/Johannesburg (SAST)" },
    { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
    { value: "Africa/Nairobi", label: "Africa/Nairobi (EAT)" },
    // America
    /*
    { value: "America/Anchorage", label: "America/Anchorage (AKST)" },
    { value: "America/Bogota", label: "America/Bogota (COT)" },
    { value: "America/Buenos_Aires", label: "America/Buenos Aires (ART)" },
    { value: "America/Chicago", label: "America/Chicago (CST)" },
    { value: "America/Denver", label: "America/Denver (MST)" },
    { value: "America/Halifax", label: "America/Halifax (AST)" },
    { value: "America/Lima", label: "America/Lima (PET)" },
    { value: "America/Los_Angeles", label: "America/Los Angeles (PST)" },
    { value: "America/Mexico_City", label: "America/Mexico City (CST)" },
    { value: "America/New_York", label: "America/New York (EST)" },
    { value: "America/Phoenix", label: "America/Phoenix (MST)" },
    { value: "America/Santiago", label: "America/Santiago (CLT)" },
    { value: "America/Sao_Paulo", label: "America/Sao Paulo (BRT)" },
    { value: "America/St_Johns", label: "America/St Johns (NST)" },
    { value: "America/Toronto", label: "America/Toronto (EST)" },
    { value: "America/Vancouver", label: "America/Vancouver (PST)" },
    // Asia
    { value: "Asia/Bangkok", label: "Asia/Bangkok (ICT)" },
    { value: "Asia/Dhaka", label: "Asia/Dhaka (BST)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
    { value: "Asia/Hong_Kong", label: "Asia/Hong Kong (HKT)" },
    { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB)" },
    { value: "Asia/Jerusalem", label: "Asia/Jerusalem (IST)" },
    { value: "Asia/Karachi", label: "Asia/Karachi (PKT)" },
    { value: "Asia/Kathmandu", label: "Asia/Kathmandu (NPT)" },
    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
    { value: "Asia/Kuala_Lumpur", label: "Asia/Kuala Lumpur (MYT)" },
    { value: "Asia/Manila", label: "Asia/Manila (PST)" },
    { value: "Asia/Riyadh", label: "Asia/Riyadh (AST)" },
    { value: "Asia/Seoul", label: "Asia/Seoul (KST)" },
    { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
    { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
    // Atlantic / Australia
    { value: "Atlantic/Azores", label: "Atlantic/Azores (AZOT)" },
    { value: "Australia/Adelaide", label: "Australia/Adelaide (ACST)" },
    { value: "Australia/Brisbane", label: "Australia/Brisbane (AEST)" },
    { value: "Australia/Darwin", label: "Australia/Darwin (ACST)" },
    { value: "Australia/Melbourne", label: "Australia/Melbourne (AEDT)" },
    { value: "Australia/Perth", label: "Australia/Perth (AWST)" },
    { value: "Australia/Sydney", label: "Australia/Sydney (AEDT)" },
    // Europe
    { value: "Europe/Amsterdam", label: "Europe/Amsterdam (CET)" },
    { value: "Europe/Athens", label: "Europe/Athens (EET)" },
    { value: "Europe/Berlin", label: "Europe/Berlin (CET)" },
    { value: "Europe/Brussels", label: "Europe/Brussels (CET)" },
    { value: "Europe/Dublin", label: "Europe/Dublin (GMT)" },
    { value: "Europe/Helsinki", label: "Europe/Helsinki (EET)" },
    { value: "Europe/Istanbul", label: "Europe/Istanbul (TRT)" },
    { value: "Europe/Lisbon", label: "Europe/Lisbon (WET)" },
    { value: "Europe/London", label: "Europe/London (GMT)" },
    { value: "Europe/Madrid", label: "Europe/Madrid (CET)" },
    { value: "Europe/Moscow", label: "Europe/Moscow (MSK)" },
    { value: "Europe/Paris", label: "Europe/Paris (CET)" },
    { value: "Europe/Prague", label: "Europe/Prague (CET)" },
    { value: "Europe/Rome", label: "Europe/Rome (CET)" },
    { value: "Europe/Stockholm", label: "Europe/Stockholm (CET)" },
    { value: "Europe/Vienna", label: "Europe/Vienna (CET)" },
    { value: "Europe/Warsaw", label: "Europe/Warsaw (CET)" },
    { value: "Europe/Zurich", label: "Europe/Zurich (CET)" },
    // Pacific
    { value: "Pacific/Auckland", label: "Pacific/Auckland (NZDT)" },
    { value: "Pacific/Fiji", label: "Pacific/Fiji (FJT)" },
    { value: "Pacific/Honolulu", label: "Pacific/Honolulu (HST)" },
     */
];

const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236b7280%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`;

export default async function Page({ searchParams }) {
    const params = await searchParams;
    return (
        <div className="space-y-6 p-2 sm:p-4 flex flex-col items-center">
            <Link href="/dashboard/admin/organizations" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary self-start"><ChevronLeft className="h-4 w-4" />Back to organizations</Link>
            <div><p className="text-[28px] font-bold text-primary lg:text-4xl">Create organization</p><p className="mt-1 text-sm text-gray-500">Add an organization and its contact details.</p></div>
            {params?.error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">Could not create the organization. Please review the details and try again.</p>}
            <form action={submitOrganization} className="max-w-3xl space-y-6 rounded-xl border border-gray-100 bg-white p-5 sm:p-7 mx-auto">
                <div className="grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-medium text-gray-700">Organization name *<input className={inputClass} name="name" required /></label>
                    <label className="text-sm font-medium text-gray-700">Slug *<input className={inputClass} name="slug" required placeholder="acme-properties" /></label>
                    <label className="text-sm font-medium text-gray-700">Email<input className={inputClass} name="email" type="email" /></label>
                    <label className="text-sm font-medium text-gray-700">Phone<input className={inputClass} name="phone" type="tel" /></label>
                    <label className="text-sm font-medium text-gray-700 sm:col-span-2">Address<input className={inputClass} name="address" /></label>
                    <label className="text-sm font-medium text-gray-700">City<input className={inputClass} name="city" /></label>
                    <label className="text-sm font-medium text-gray-700">State / Province<input className={inputClass} name="state" /></label>
                    <label className="text-sm font-medium text-gray-700">Country<input className={inputClass} name="country" /></label>
                    <label className="text-sm font-medium text-gray-700">
                        Timezone
                        <select className={selectClass} name="timezone" defaultValue="">
                            <option value="" disabled>Select a timezone</option>
                            {TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                            ))}
                        </select>
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                        Currency
                        <select className={selectClass} name="currency" defaultValue="">
                            <option value="" disabled>Select a currency</option>
                            {CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>{c.label}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
                    <Link href="/dashboard/admin/organizations" className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</Link>
                    <button className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90" type="submit">Create organization</button>
                </div>
            </form>
        </div>
    );
}