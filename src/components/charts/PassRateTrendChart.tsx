"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendMonth } from "@/lib/api";
import { AXIS_TICK, CHART, TOOLTIP_STYLE } from "./chartTheme";
import ChartCard, { EmptyChart } from "./ChartCard";

// One series, so no legend - the title names it. The dashed reference line is
// the pass-rate trigger, which is a threshold, not a gridline.
export default function PassRateTrendChart({
  months,
  threshold,
}: {
  months: TrendMonth[];
  threshold: number;
}) {
  const withData = months.filter((m) => m.passRate !== null);

  return (
    <ChartCard
      title="Pass rate"
      subtitle={`Percentage of tests passed each month. Triggers at ${threshold}% or below.`}
    >
      {withData.length === 0 ? (
        <EmptyChart message="No tests in this period." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={months} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
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
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <ReferenceLine
              y={threshold}
              stroke={CHART.faults.serious}
              strokeDasharray="4 4"
              label={{
                value: `trigger ${threshold}%`,
                position: "insideBottomRight",
                fill: CHART.muted,
                fontSize: 10,
              }}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value) => [`${value}%`, "Pass rate"]}
            />
            <Line
              type="monotone"
              dataKey="passRate"
              stroke={CHART.passRate}
              strokeWidth={2}
              // A month with no tests is a gap, never a drop to zero.
              connectNulls={false}
              dot={{ r: 3, fill: CHART.passRate, stroke: CHART.surface, strokeWidth: 2 }}
              activeDot={{ r: 5, stroke: CHART.surface, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
