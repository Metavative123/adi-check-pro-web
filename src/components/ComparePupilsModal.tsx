"use client";

import { useEffect, useState } from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Modal from "@/components/Modal";
import PupilPicker from "@/components/PupilPicker";
import { api, type PupilSummary } from "@/lib/api";
import { getToken } from "@/lib/auth";

// Which direction is better for each row, so the stronger figure can be
// marked. Pass rate is the only one where more is better.
type Row = {
  label: string;
  value: (s: PupilSummary) => number;
  format: (n: number) => string;
  better: "higher" | "lower" | "none";
};

const ROWS: Row[] = [
  { label: "Tests taken", value: (s) => s.totals.tests, format: String, better: "none" },
  { label: "Passed", value: (s) => s.totals.passed, format: String, better: "none" },
  { label: "Failed", value: (s) => s.totals.failed, format: String, better: "none" },
  {
    label: "Pass rate",
    value: (s) => s.metrics.passRate,
    format: (n) => `${n}%`,
    better: "higher",
  },
  {
    label: "Driving fault average",
    value: (s) => s.metrics.drivingFaultAverage,
    format: (n) => n.toFixed(2),
    better: "lower",
  },
  {
    label: "Serious fault average",
    value: (s) => s.metrics.seriousFaultAverage,
    format: (n) => n.toFixed(2),
    better: "lower",
  },
  {
    label: "Dangerous faults",
    value: (s) => s.totals.dangerous,
    format: String,
    better: "lower",
  },
  {
    label: "Physical intervention rate",
    value: (s) => s.metrics.physicalInterventionRate,
    format: (n) => `${n}%`,
    better: "lower",
  },
  {
    label: "Tests with verbal instruction",
    value: (s) => s.totals.verbalInstructions,
    format: String,
    better: "lower",
  },
];

export default function ComparePupilsModal({ onClose }: { onClose: () => void }) {
  const [nameA, setNameA] = useState<string | null>(null);
  const [nameB, setNameB] = useState<string | null>(null);
  const [a, setA] = useState<PupilSummary | null>(null);
  const [b, setB] = useState<PupilSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    async function load(name: string | null, set: (s: PupilSummary | null) => void) {
      if (!name) {
        set(null);
        return;
      }
      try {
        const { summary } = await api.getPupilSummary(token as string, name);
        if (!cancelled) set(summary);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load pupil");
      }
    }

    load(nameA, setA);
    load(nameB, setB);

    return () => {
      cancelled = true;
    };
  }, [nameA, nameB]);

  const bothChosen = Boolean(a && b);

  return (
    <Modal open onClose={onClose} title="Compare two pupils" size="lg">
      <div className="space-y-5">
        <p className="text-sm text-fg/60">
          Search by pupil name or test id to pick any two pupils, then see their
          records side by side. The search covers every test you have logged, not
          just the page you are on.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <PupilPicker
            label="Pupil A"
            selected={nameA}
            onSelect={setNameA}
            onClear={() => {
              setNameA(null);
              setA(null);
            }}
            excludeName={nameB}
          />
          <PupilPicker
            label="Pupil B"
            selected={nameB}
            onSelect={setNameB}
            onClear={() => {
              setNameB(null);
              setB(null);
            }}
            excludeName={nameA}
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        {!bothChosen && (
          <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-fg/40">
            Choose a pupil on each side to compare them.
          </p>
        )}

        {a && b && (
          <>
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-raised">
                    <th className="px-3 py-2 text-left font-medium text-fg/60">Measure</th>
                    <th className="px-3 py-2 text-right font-semibold">{a.name}</th>
                    <th className="px-3 py-2 text-right font-semibold">{b.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {ROWS.map((row) => {
                    const valueA = row.value(a);
                    const valueB = row.value(b);
                    return (
                      <tr key={row.label}>
                        <td className="px-3 py-2 text-fg/60">{row.label}</td>
                        <Cell
                          text={row.format(valueA)}
                          best={isBest(row, valueA, valueB)}
                          better={row.better}
                        />
                        <Cell
                          text={row.format(valueB)}
                          best={isBest(row, valueB, valueA)}
                          better={row.better}
                        />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-fg/40">
              An arrow marks the stronger figure. Fault and intervention measures are
              better when lower; pass rate when higher.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <TestList summary={a} />
              <TestList summary={b} />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function isBest(row: Row, mine: number, theirs: number) {
  if (row.better === "none" || mine === theirs) return false;
  return row.better === "higher" ? mine > theirs : mine < theirs;
}

function Cell({
  text,
  best,
  better,
}: {
  text: string;
  best: boolean;
  better: Row["better"];
}) {
  return (
    <td className="px-3 py-2 text-right tabular-nums">
      <span
        className={
          "inline-flex items-center justify-end gap-1 " +
          (best ? "font-semibold text-brand" : "text-fg")
        }
      >
        {text}
        {/* An icon as well as the colour, so the mark does not rely on hue. */}
        {best &&
          (better === "higher" ? (
            <ArrowUpwardIcon sx={{ fontSize: 14 }} />
          ) : (
            <ArrowDownwardIcon sx={{ fontSize: 14 }} />
          ))}
      </span>
    </td>
  );
}

function TestList({ summary }: { summary: PupilSummary }) {
  return (
    <div className="rounded-xl border border-line">
      <p className="border-b border-line px-3 py-2 text-xs font-semibold">
        {summary.name}
        <span className="ml-2 font-normal text-fg/40">
          {summary.testCenters.join(", ")}
        </span>
      </p>
      <ul className="max-h-56 divide-y divide-line overflow-y-auto">
        {summary.tests.map((t) => (
          <li key={t._id} className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="min-w-0">
              <span className="block truncate text-xs">
                {new Date(t.testDate).toLocaleDateString("en-GB")}
              </span>
              <span className="block truncate text-[11px] text-fg/40">
                {t.faults.driving}D · {t.faults.serious}S · {t.faults.dangerous}X
              </span>
            </span>
            <span
              className={
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                (t.result === "pass"
                  ? "bg-brand-light text-brand-fg"
                  : "bg-danger-bg text-danger-fg")
              }
            >
              {t.result === "pass" ? "Pass" : "Fail"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
