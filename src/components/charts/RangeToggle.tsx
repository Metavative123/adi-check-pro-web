"use client";

import type { TrendRange } from "@/lib/api";

const OPTIONS: { value: TrendRange; label: string }[] = [
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
  { value: "all", label: "All time" },
];

// One filter row, above the charts, controlling all of them.
export default function RangeToggle({
  value,
  onChange,
}: {
  value: TrendRange;
  onChange: (range: TrendRange) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-line bg-surface p-0.5"
      role="group"
      aria-label="Time range"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={
            "rounded-md px-3 py-1.5 text-xs font-medium transition " +
            (value === option.value
              ? "bg-brand text-white"
              : "text-fg/60 hover:bg-raised")
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
