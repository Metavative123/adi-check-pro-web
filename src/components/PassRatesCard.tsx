import type { PassRate, PassRates } from "@/lib/api";

// The two pass rates, in separate boxes so they are never read as one:
// ADI-linked (the ADI number was supplied) and overall recorded (every test).
export default function PassRatesCard({
  passRates,
  windowMonths,
}: {
  passRates: PassRates;
  windowMonths: number;
}) {
  return (
    <section
      aria-label="Pass rates"
      className="rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-shade"
    >
      <div className="mb-4">
        <h2 className="font-semibold text-fg">Pass rates</h2>
        <p className="text-xs text-fg/60">Last {windowMonths} months, worked out two ways.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <RateBox rate={passRates.adiLinked} />
        <RateBox rate={passRates.overall} />
      </div>
    </section>
  );
}

function RateBox({ rate }: { rate: PassRate }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <h3 className="text-sm font-semibold text-fg">{rate.label}</h3>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-fg">
        {rate.percent === null ? "-" : `${rate.percent}%`}
      </p>
      <p className="text-sm text-fg/70">
        {rate.passed} pass{rate.passed === 1 ? "" : "es"} from {rate.tests} test
        {rate.tests === 1 ? "" : "s"}
      </p>
      <p className="mt-3 text-xs text-fg/50">{rate.includes}</p>
    </div>
  );
}
