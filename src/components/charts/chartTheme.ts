// Chart colours and chrome, for both themes.
//
// Dark is a SELECTED palette, not an inversion of the light one: each value was
// re-checked with the data-viz validator against the dark chart surface.
//
// Two decisions worth keeping:
//
//  - Green for "pass" and red for "fail" FAILED colourblind separation
//    (delta-E 3.0 under protanopia - the classic red/green pair). So the
//    breakdown chart uses emphasis instead: the series that matters carries the
//    brand hue and the other is neutral grey, separating by chroma not hue.
//    The validator's chroma-floor check flags that grey by design; it is an
//    emphasis series, not a categorical one. Every other check passes in both
//    modes (light: CVD dE 13.3, contrast >= 3:1; dark: CVD dE 9.9, contrast >= 3:1).
//
//  - Fault severity is an ordered scale (driving -> serious -> dangerous), so it
//    uses a single-hue ordinal ramp, light to dark. Both ramps pass monotone
//    lightness, step gaps, single hue and the contrast floor for their surface.
export type ChartTheme = {
  passRate: string;
  passed: string;
  failed: string;
  faults: { driving: string; serious: string; dangerous: string };
  grid: string;
  axis: string;
  muted: string;
  surface: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  cursor: string;
};

const LIGHT: ChartTheme = {
  passRate: "#00703c",
  passed: "#00703c",
  failed: "#7c848d",
  faults: { driving: "#f59e0b", serious: "#b45309", dangerous: "#78350f" },
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  muted: "#898781",
  surface: "#ffffff",
  tooltipBg: "#ffffff",
  tooltipBorder: "rgba(11,27,43,0.10)",
  tooltipText: "#0b1b2b",
  cursor: "rgba(11,27,43,0.04)",
};

const DARK: ChartTheme = {
  passRate: "#199e70",
  passed: "#199e70",
  failed: "#64748b",
  faults: { driving: "#fcd34d", serious: "#e39a15", dangerous: "#a86a10" },
  grid: "#243040",
  axis: "#33415a",
  muted: "#94a3b8",
  // Matches --color-surface in dark mode: the gaps between stacked segments
  // are drawn in the surface colour, so they must be the same value.
  surface: "#121a24",
  tooltipBg: "#1a232f",
  tooltipBorder: "rgba(255,255,255,0.14)",
  tooltipText: "#e6ecf3",
  cursor: "rgba(255,255,255,0.06)",
};

export function chartTheme(isDark: boolean): ChartTheme {
  return isDark ? DARK : LIGHT;
}

export function axisTick(theme: ChartTheme) {
  return { fill: theme.muted, fontSize: 11 };
}

// Shared tooltip styling so every chart's hover layer matches.
export function tooltipStyle(theme: ChartTheme) {
  return {
    contentStyle: {
      borderRadius: 10,
      border: `1px solid ${theme.tooltipBorder}`,
      background: theme.tooltipBg,
      boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      fontSize: 12,
      padding: "8px 10px",
      color: theme.tooltipText,
    },
    labelStyle: { color: theme.tooltipText, fontWeight: 600, marginBottom: 2 },
    itemStyle: { color: theme.tooltipText },
    cursor: { fill: theme.cursor },
  };
}
