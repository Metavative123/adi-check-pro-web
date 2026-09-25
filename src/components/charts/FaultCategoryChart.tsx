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
import { axisTick, chartTheme, tooltipStyle } from "./chartTheme";
import { useTheme } from "@/lib/theme";
import ChartCard, { EmptyChart, Legend } from "./ChartCard";

export default function FaultCategoryChart({ months }: { months: TrendMonth[] }) {
  const { resolvedTheme } = useTheme();
  const CHART = chartTheme(resolvedTheme === "dark");
  const AXIS_TICK = axisTick(CHART);
  const TOOLTIP_STYLE = tooltipStyle(CHART);

  // Fault severity is an ordered scale, so this is a single-hue ordinal ramp
  // (light = least serious) rather than three unrelated categorical hues.
  // Built per render because the ramp differs between light and dark.
  const SERIES = [
    { key: "driving", label: "Driving", color: CHART.faults.driving },
    { key: "serious", label: "Serious", color: CHART.faults.serious },
    { key: "dangerous", label: "Dangerous", color: CHART.faults.dangerous },
  ] as const;

  const hasFaults = months.some((m) => m.driving + m.serious + m.dangerous > 0);

  return (
    <ChartCard title="Faults by category" subtitle="Faults recorded each month, by severity.">
      {!hasFaults ? (
        <EmptyChart message="No faults recorded in this period." />
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
                  stackId="faults"
                  fill={s.color}
                  // 2px surface gap between stacked segments, and rounded
                  // ends only on the top of the stack.
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
