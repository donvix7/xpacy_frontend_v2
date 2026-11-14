import AdminNotificationList from "@/app/_components/AdminNotificationList";
import DashboardGridItem from "@/app/_components/DashboardGridItems";
import AdminNotificationsSummary from "@/app/_components/AdminNotificationsSummary";
import { getUserNotifications } from "@/app/_lib/data-services";
import { cookies } from "next/headers";

function toList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.notifications)) return payload.data.notifications;
  return [];
}

const isRead = (n) => !!(n?.read_at || n?.is_read || n?.read);

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const notifications = await getUserNotifications(token);
  const list = toList(notifications);

  // ---- Hero stats ----------------------------------------------------------
  const total = list.length;
  const unread = list.filter((n) => !isRead(n)).length;
  const read = total - unread;
  const types = new Set(list.map((n) => n.type).filter(Boolean)).size;

  const heroStats = [
    { label: "Notifications", value: total, hint: "All messages" },
    { label: "Unread", value: unread, hint: "Needs attention" },
    { label: "Read", value: read, hint: "Already seen" },
    { label: "Types", value: types, hint: "Distinct kinds" },
  ];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 p-2">
      {/* ---------- Hero summary ---------- */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink">
        <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                Admin console · {today}
              </p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                Notifications
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                Every alert, update and system message in one place — see what needs attention and what's been handled.
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4"
              >
                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.5px] text-white tabular-nums sm:text-[26px]">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </dd>
                <p className="mt-1.5 truncate text-[11.5px] text-side-mute">
                  {stat.hint}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Existing content ---------- */}
      <DashboardGridItem title="Summary">
        <AdminNotificationsSummary notifications={notifications} />
      </DashboardGridItem>

      <DashboardGridItem title="All Notifications">
        <AdminNotificationList notifications={notifications} />
      </DashboardGridItem>
    </div>
  );
}