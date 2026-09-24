"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendMonth } from "@/lib/api";
import { AXIS_TICK, CHART, TOOLTIP_STYLE } from "./chartTheme";
import ChartCard, { EmptyChart, Legend } from "./ChartCard";

// Volume per month, split pass/fail - the counts behind the pass-rate line.
//
// Passed is the series that matters, so it carries the brand hue and failed
// sits in neutral grey. Green-vs-red was measured and rejected: it fails
// colourblind separation, and grey separates by chroma instead of hue.
const SERIES = [
  { key: "passed", label: "Passed", color: CHART.passed },
  { key: "failed", label: "Failed", color: CHART.failed },
] as const;

export default function TestBreakdownChart({ months }: { months: TrendMonth[] }) {
  const hasTests = months.some((m) => m.total > 0);

  return (
    <ChartCard title="Tests taken" subtitle="How many tests each month, and how they went.">
      {!hasTests ? (
        <EmptyChart message="No tests in this period." />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={months} margin={{ top: 8, right: 12, bottom: 0, left: -22 }}>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis
                dataKey="label"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART.axis }}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip {...TOOLTIP_STYLE} />
              {SERIES.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  stackId="tests"
                  fill={s.color}
                  stroke={CHART.surface}
                  strokeWidth={2}
                  radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : undefined}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <Legend items={SERIES.map((s) => ({ label: s.label, color: s.color }))} />
        </>
      )}
    </ChartCard>
  );
}
