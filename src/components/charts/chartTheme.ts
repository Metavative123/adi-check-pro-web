// Chart colours and chrome, in one place.
//
// Every palette here was checked with the data-viz validator against the white
// card surface these charts sit on. Two results worth keeping in mind:
//
//  - Green for "pass" and red for "fail" FAILED colourblind separation
//    (delta-E 3.0 under protanopia - a red/green pair is the classic case).
//    So the breakdown chart uses emphasis instead: the series that matters is
//    in brand green, the other in a neutral grey, which separates by chroma
//    rather than hue.
//  - Fault severity is an ordered scale (driving -> serious -> dangerous), so
//    it uses a single-hue ordinal ramp, light to dark. These three steps pass
//    monotone lightness, step gaps, and the 2:1 light-end contrast floor.
export const CHART = {
  // Single series: the pass-rate line.
  passRate: "#00703c",

  // Emphasis pair for the test breakdown.
  passed: "#00703c",
  failed: "#c3c2b7",

  // Ordinal severity ramp - validated, do not reorder.
  faults: {
    driving: "#f59e0b",
    serious: "#b45309",
    dangerous: "#78350f",
  },

  // Recessive chrome: hairlines one shade off the surface.
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  muted: "#898781",
  surface: "#ffffff",
} as const;

export const AXIS_TICK = { fill: CHART.muted, fontSize: 11 };

// Shared tooltip styling so every chart's hover layer matches.
export const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: 10,
    border: "1px solid rgba(11,27,43,0.10)",
    boxShadow: "0 8px 24px rgba(11,27,43,0.10)",
    fontSize: 12,
    padding: "8px 10px",
  },
  labelStyle: { color: "#0b1b2b", fontWeight: 600, marginBottom: 2 },
  cursor: { fill: "rgba(11,27,43,0.04)" },
} as const;
