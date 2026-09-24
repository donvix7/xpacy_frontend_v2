import {
    Banknote,
    Bell,
    Building2,
    CalendarCheck,
    CheckCircle2,
    Clock3,
    DoorOpen,
    FileText,
    Home,
    House,
    Tag,
    Users,
    Wrench,
    XCircle,
} from "lucide-react";

const visuals = [
    { match: ["total properties", "properties owned", "properties managed", "property"], Icon: Building2, tone: "text-blue-700", background: "bg-blue-100" },
    { match: ["total tenants", "tenants", "owners managed", "property owners", "service providers", "admins", "users", "inactive users", "unverified users", "in-house guests"], Icon: Users, tone: "text-violet-700", background: "bg-violet-100" },
    { match: ["occupied units", "occupied"], Icon: Home, tone: "text-green-700", background: "bg-green-100" },
    { match: ["vacant units", "vacant"], Icon: DoorOpen, tone: "text-amber-700", background: "bg-amber-100" },
    { match: ["total bookings", "bookings", "expected check-ins", "check-in overview"], Icon: CalendarCheck, tone: "text-blue-700", background: "bg-blue-100" },
    { match: ["pending", "expected", "in progress"], Icon: Clock3, tone: "text-amber-700", background: "bg-amber-100" },
    { match: ["completed", "active", "paid", "available", "successful"], Icon: CheckCircle2, tone: "text-green-700", background: "bg-green-100" },
    { match: ["expired", "cancelled", "canceled", "unpaid"], Icon: XCircle, tone: "text-red-700", background: "bg-red-100" },
    { match: ["total leases", "lease", "leases"], Icon: FileText, tone: "text-indigo-700", background: "bg-indigo-100" },
    { match: ["shortlet", "rented", "home"], Icon: House, tone: "text-sky-700", background: "bg-sky-100" },
    { match: ["featured"], Icon: Tag, tone: "text-orange-700", background: "bg-orange-100" },
    { match: ["service", "maintenance", "inspection"], Icon: Wrench, tone: "text-cyan-700", background: "bg-cyan-100" },
    { match: ["notification", "notifications", "total notifications", "unread", "read"], Icon: Bell, tone: "text-purple-700", background: "bg-purple-100" },
    { match: ["revenue", "payment", "payments", "paid"], Icon: Banknote, tone: "text-emerald-700", background: "bg-emerald-100" },
];

export function getSummaryVisual(label) {
    const normalizedLabel = String(label || "").trim().toLowerCase();
    const visual = visuals.find(({ match }) => match.includes(normalizedLabel));
    if (!visual) return null;
    const Icon = visual.Icon;
    return {
        icon: <Icon aria-hidden="true" className={`h-5 w-5 ${visual.tone}`} />,
        background: visual.background,
    };
}
