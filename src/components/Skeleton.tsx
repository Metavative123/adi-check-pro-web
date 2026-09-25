// Placeholders shown while data loads.
//
// They stand in for the real content rather than replacing the screen, so the
// layout does not jump when the data lands - and nothing ever says "no tests
// yet" before the answer is actually known.

// One shimmering block. Size it with className.
export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      style={style}
      className={"relative block overflow-hidden rounded bg-raised " + className}
    >
      <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[var(--color-shimmer)] to-transparent" />
    </span>
  );
}

// A whole region that is loading. The live region tells a screen reader what
// is happening, since the shimmer itself is purely visual.
export function SkeletonRegion({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

// The identity row at the top of the Overview.
export function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-56" />
      </div>
    </div>
  );
}

// Mirrors PerformanceCard: score panel, gauge panel, three metric rows.
export function PerformanceSkeleton() {
  return (
    <SkeletonRegion label="Loading your performance rating">
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="mt-3 h-9 w-32" />
          <Skeleton className="mt-5 h-3.5 w-28" />
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="mt-3 h-3.5 w-20" />
          <Skeleton className="mt-2 h-6 w-16" />
        </div>

        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-lg shadow-shade"
            >
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-7 w-12" />
            </div>
          ))}
        </div>
      </section>
    </SkeletonRegion>
  );
}

// Rows inside an existing TestTable frame.
export function TestRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <SkeletonRegion label="Loading tests">
      <ul className="divide-y divide-line">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          </li>
        ))}
      </ul>
    </SkeletonRegion>
  );
}

// A chart card before its series arrives.
export function ChartSkeleton({ height = 240 }: { height?: number }) {
  // Fixed bar heights: random ones would change on every render.
  const bars = [45, 70, 35, 85, 55, 75, 40, 65, 50, 80, 60, 30];

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-shade">
      <SkeletonRegion label="Loading chart">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="mt-2 h-3 w-64" />

        <div
          className="mt-5 flex items-end justify-between gap-1.5"
          style={{ height }}
        >
          {bars.map((percent, i) => (
            <Skeleton key={i} className="flex-1" style={{ height: `${percent}%` }} />
          ))}
        </div>
      </SkeletonRegion>
    </section>
  );
}

// The whole app frame, for the moment before the session is confirmed.
export function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* The drawer is navy in both themes, so its silhouette is drawn here
          rather than shimmered - it is chrome, not content. */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-ink lg:block" />

      <div className="lg:pl-60">
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6">
          <Skeleton className="h-5 w-28" />
        </header>

        <div className="px-4 py-6 sm:px-6">
          <SkeletonRegion label="Loading">
            <div className="mx-auto max-w-5xl space-y-6">
              <ProfileHeaderSkeleton />
              <div className="grid gap-4 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-36 rounded-2xl" />
                ))}
              </div>
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </SkeletonRegion>
        </div>
      </div>
    </div>
  );
}
