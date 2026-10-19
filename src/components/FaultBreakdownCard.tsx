import type { FaultBreakdown } from "@/lib/api";

// How many recurring driving faults to list before it stops being a summary.
const TOP_DRIVING = 8;

// "Junctions: Observation", or just "Clearance" where the heading is the item.
function itemName(groupLabel: string, label: string) {
  return groupLabel === label ? label : `${groupLabel}: ${label}`;
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// Which DL25 items come up across the instructor's tests, to show where to
// focus their teaching. Built from tests logged fault by fault only; tests
// entered as totals have nothing to break down, and the card says so.
export default function FaultBreakdownCard({
  breakdown,
  windowMonths,
}: {
  breakdown: FaultBreakdown;
  windowMonths: number;
}) {
  const { detailedTests, totalsOnlyTests, drivingFaults, seriousDangerous } = breakdown;
  const top = drivingFaults.slice(0, TOP_DRIVING);
  const most = top[0]?.driving ?? 0;

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-shade">
      <div className="mb-4">
        <h2 className="font-semibold text-fg">Fault breakdown</h2>
        <p className="text-xs text-fg/60">
          Last {windowMonths} months · detailed (DL25) entries only
        </p>
      </div>

      {detailedTests === 0 ? (
        <p className="text-sm text-fg/60">
          Log tests fault by fault (DL25) to see which areas come up most often.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-fg">Recurring driving faults</h3>
            {top.length === 0 ? (
              <p className="text-sm text-fg/60">No driving faults recorded.</p>
            ) : (
              <ol className="space-y-2.5">
                {top.map((row) => (
                  <li key={row.key}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-fg">{itemName(row.groupLabel, row.label)}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-fg">{row.driving}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-raised">
                      <div
                        className="h-full rounded-full bg-dial"
                        style={{ width: `${(row.driving / most) * 100}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-[11px] text-fg/50">
                      On {row.testsWithDriving} of {plural(detailedTests, "test")}
                    </p>
                  </li>
                ))}
              </ol>
            )}
            {drivingFaults.length > TOP_DRIVING && (
              <p className="mt-2 text-xs text-fg/50">
                {plural(drivingFaults.length - TOP_DRIVING, "more item")} in the PDF report.
              </p>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-fg">Serious and dangerous faults</h3>
            {seriousDangerous.length === 0 ? (
              <p className="text-sm text-fg/60">None recorded.</p>
            ) : (
              <ul className="space-y-3">
                {seriousDangerous.map((group) => (
                  <li key={group.key} className="text-sm">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium text-fg">{group.label}</span>
                      <span className="flex shrink-0 gap-1 text-xs font-semibold">
                        {group.serious > 0 && (
                          <span className="rounded bg-danger-bg px-1.5 py-0.5 text-danger-fg">
                            {group.serious} S
                          </span>
                        )}
                        {group.dangerous > 0 && (
                          <span className="rounded bg-danger px-1.5 py-0.5 text-white">
                            {group.dangerous} D
                          </span>
                        )}
                      </span>
                    </div>
                    {/* Name the items, unless the heading is the only one. */}
                    {!(group.items.length === 1 && group.items[0].label === group.label) && (
                      <p className="mt-0.5 text-xs text-fg/60">
                        {group.items.map((item) => item.label).join(", ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <p className="mt-5 border-t border-line pt-3 text-xs text-fg/50">
        Covers {plural(detailedTests, "test")} logged fault by fault.
        {totalsOnlyTests > 0 &&
          ` ${plural(totalsOnlyTests, "test")} entered as totals only ${totalsOnlyTests === 1 ? "is" : "are"} not included.`}
      </p>
    </section>
  );
}
