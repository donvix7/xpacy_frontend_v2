export function toReportArray(value) {
    if (Array.isArray(value)) return value;
    const candidates = [
        value?.data,
        value?.properties,
        value?.services,
        value?.bookings,
        value?.invoices,
        value?.users,
        value?.results,
        value?.items,
        value?.data?.properties,
        value?.data?.services,
        value?.data?.bookings,
        value?.data?.invoices,
        value?.data?.users,
        value?.data?.results,
        value?.data?.items,
        value?.data?.data,
        value?.data?.data?.properties,
        value?.data?.data?.services,
        value?.data?.data?.bookings,
        value?.data?.data?.invoices,
        value?.data?.data?.users,
        value?.data?.data?.results,
        value?.data?.data?.items,
    ];
    return candidates.find(Array.isArray) || [];
}

export function getReportStatus(record, keys = ["status", "service_status", "payment_status", "invoice_status"]) {
    const value = keys.map((key) => record?.[key]).find((candidate) => typeof candidate === "string" && candidate.trim());
    return (value || "Unspecified").trim().toLowerCase().replace(/[_\s]+/g, "-");
}

export function getReportAmount(record) {
    const value = record?.balance_due ?? record?.remaining_amount ?? record?.amount_due ?? record?.total ?? record?.amount ?? record?.paid_amount ?? 0;
    const amount = typeof value === "string" ? Number(value.replace(/[^\d.-]/g, "")) : Number(value);
    return Number.isFinite(amount) ? amount : 0;
}

export function getReportInvoiceTotal(record) {
    return parseReportAmount(record?.total ?? record?.total_amount ?? record?.amount ?? record?.invoice_total ?? record?.invoice_amount ?? record?.amount_due ?? 0);
}

export function getReportPaidAmount(record) {
    return parseReportAmount(record?.paid_amount ?? record?.amount_paid ?? record?.amount ?? record?.total ?? record?.total_amount ?? 0);
}

function parseReportAmount(value) {
    const amount = typeof value === "string" ? Number(value.replace(/[^\d.-]/g, "")) : Number(value);
    return Number.isFinite(amount) ? amount : 0;
}

export function getReportDate(record, keys = ["created_at", "createdAt", "date", "date_added", "scheduled_date", "start_date"]) {
    const value = keys.map((key) => record?.[key]).find(Boolean);
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function getRollingMonthKeys(count = 12, now = new Date()) {
    return Array.from({ length: count }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - count + index + 1, 1);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    });
}

export function formatReportMonth(key) {
    const [year, month] = key.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleString("en", { month: "short", year: "2-digit" });
}
