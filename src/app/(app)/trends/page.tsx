"use client";

import { useEffect, useState } from "react";
import FaultCategoryChart from "@/components/charts/FaultCategoryChart";
import PassRateTrendChart from "@/components/charts/PassRateTrendChart";
import RangeToggle from "@/components/charts/RangeToggle";
import TestBreakdownChart from "@/components/charts/TestBreakdownChart";
import { api, type Performance, type Trend, type TrendRange } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useApp } from "@/lib/appContext";

export default function TrendsPage() {
  const { refreshKey } = useApp();
  const [range, setRange] = useState<TrendRange>("12");
  const [trend, setTrend] = useState<Trend | null>(null);
  const [performance, setPerformance] = useState<Performance | null>(null);

  // The threshold line on the pass-rate chart comes from the same config the
  // rating uses, so the two can never disagree.
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    async function load(authToken: string) {
      const { performance: perf } = await api.getPerformance(authToken);
      if (!cancelled) setPerformance(perf);
    }

    load(token);
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    async function load(authToken: string) {
      const { trend: data } = await api.getTrend(authToken, range);
      if (!cancelled) setTrend(data);
    }

    load(token);
    return () => {
      cancelled = true;
    };
  }, [range, refreshKey]);

  const months = trend?.months ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg/60">
          {trend
            ? `${trend.totals.tests} test${trend.totals.tests === 1 ? "" : "s"} in this period · ${trend.totals.passed} passed · ${trend.totals.failed} failed`
            : "Loading..."}
        </p>
        <RangeToggle value={range} onChange={setRange} />
      </div>

      <PassRateTrendChart
        months={months}
        threshold={performance?.thresholds.passRate ?? 55}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <TestBreakdownChart months={months} />
        <FaultCategoryChart months={months} />
      </div>
    </div>
  );
}
