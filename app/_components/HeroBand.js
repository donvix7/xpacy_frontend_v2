export default function HeroBand({
  tagline,
  title,
  description,
  actions,
  stats = [],
  children,
  className = "",
}) {
  return (
    <section className={`relative overflow-hidden rounded-2xl border border-line bg-side text-side-ink ${className}`}>
      <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0">
            {tagline && (
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-side-mute">
                {tagline}
              </p>
            )}
            {title && (
              <h1 className="mt-2 font-sans text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-side-mute">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>

        {Array.isArray(stats) && stats.length > 0 && (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label || i}
                className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:p-4"
              >
                <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-side-mute">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.5px] text-white tabular-nums sm:text-[26px]">
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : (stat.value ?? 0)}
                </dd>
                {stat.hint && (
                  <p className="mt-1.5 truncate text-[11.5px] text-side-mute">
                    {stat.hint}
                  </p>
                )}
              </div>
            ))}
          </dl>
        )}

        {children}
      </div>
    </section>
  );
}

