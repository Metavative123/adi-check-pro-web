import Gauge from "@/components/Gauge";
import type { Metrics, Performance } from "@/lib/api";

const BANDS = {
  green: { dot: "bg-emerald-500", text: "text-emerald-400", label: "Green" },
  amber: { dot: "bg-amber-500", text: "text-amber-400", label: "Amber" },
  red: { dot: "bg-red-500", text: "text-red-400", label: "Red" },
};

const ORDER: (keyof typeof BANDS)[] = ["green", "amber", "red"];

// The traffic light. All three lamps are always drawn; only the current
// one lights up, and none light up until there are enough tests.
function TrafficLight({ band, lit }: { band: Performance["band"]; lit: boolean }) {
  return (
    <div className="flex gap-2" role="img" aria-label={lit ? BANDS[band].label : "No rating yet"}>
      {ORDER.map((name) => {
        const active = lit && name === band;
        return (
          <span
            key={name}
            className={
              "h-4 w-4 rounded-full transition " +
              (active ? BANDS[name].dot + " ring-4 ring-white/20" : "bg-white/15")
            }
          />
        );
      })}
    </div>
  );
}

export default function PerformanceCard({ performance }: { performance: Performance }) {
  const { metrics, thresholds, triggers, score, band, hasEnoughData, total, minTests } =
    performance;

  const triggered = (key: keyof Metrics) => triggers.includes(key);

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {/* Overall standing */}
      <div className="rounded-2xl border border-ink/10 bg-ink p-6 text-white shadow-lg shadow-ink/5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/60">Overall score</p>
            <p className="text-4xl font-semibold">
              {score}
              <span className="text-lg text-white/40">/100</span>
            </p>
          </div>
          <TrafficLight band={band} lit={hasEnoughData} />
        </div>

        {hasEnoughData ? (
          <p className={"mt-4 text-sm font-medium " + BANDS[band].text}>
            {BANDS[band].label}
            <span className="font-normal text-white/50">
              {" · "}
              {triggers.length === 0
                ? "no triggers"
                : triggers.length + (triggers.length === 1 ? " trigger" : " triggers")}
            </span>
          </p>
        ) : (
          <p className="mt-4 text-sm text-white/60">
            Rating starts at {minTests} tests. {total} logged in the last 12 months.
          </p>
        )}
      </div>

      {/* Pass rate on the dial */}
      <div className="flex flex-col items-center rounded-2xl border border-ink/10 bg-ink p-6 text-white shadow-lg shadow-ink/5">
        <Gauge value={metrics.passRate} className="w-32" />
        <p className="mt-2 text-sm text-white/70">Pass rate</p>
        <p className="text-2xl font-semibold">{metrics.passRate}%</p>
        <p className="mt-1 text-xs text-white/40">
          triggers at {thresholds.passRate}% or below
        </p>
      </div>

      {/* The three averages */}
      <div className="grid gap-4">
        <MetricRow
          label="Driving fault average"
          value={metrics.drivingFaultAverage.toFixed(2)}
          threshold={"triggers at " + thresholds.drivingFaultAverage + "+"}
          triggered={triggered("drivingFaultAverage")}
        />
        <MetricRow
          label="Serious fault average"
          value={metrics.seriousFaultAverage.toFixed(2)}
          threshold={"triggers at " + thresholds.seriousFaultAverage + "+"}
          triggered={triggered("seriousFaultAverage")}
        />
        <MetricRow
          label="Physical intervention"
          value={metrics.physicalInterventionRate + "%"}
          threshold={"triggers at " + thresholds.physicalInterventionRate + "%+"}
          triggered={triggered("physicalInterventionRate")}
        />
      </div>
    </section>
  );
}

function MetricRow({
  label,
  value,
  threshold,
  triggered,
}: {
  label: string;
  value: string;
  threshold: string;
  triggered: boolean;
}) {
  return (
    <div
      className={
        "flex items-center justify-between rounded-2xl border bg-white p-4 shadow-lg shadow-ink/5 " +
        (triggered ? "border-red-300 bg-red-50/50" : "border-ink/10")
      }
    >
      <div>
        <p className="text-sm text-ink/60">{label}</p>
        <p className="text-xs text-ink/35">{threshold}</p>
      </div>
      <p
        className={
          "text-2xl font-semibold tabular-nums " + (triggered ? "text-red-600" : "text-ink")
        }
      >
        {value}
      </p>
    </div>
  );
}
