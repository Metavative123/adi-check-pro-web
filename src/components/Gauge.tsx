import { useId } from "react";

// A rev-counter gauge styled after the ADI Check Pro logo: a thick red, orange
// and green band (High risk / Monitor / Ready) that fades to dark at both ends,
// white ticks across the band, a thin silver rim and a tapered white needle.
// `value` is 0-100 and moves the needle.
const CX = 100;
const CY = 100;
const BAND_R = 70; // centre line of the coloured band
const BAND_W = 26;
const RIM_R = 90;
const START = 155; // degrees, just below horizontal on the left
const SWEEP = 230; // degrees of travel

// The logo's colours.
const RED = { dark: "#3d0303", bright: "#e8150f" };
const ORANGE = { from: "#f08a12", to: "#f7a21b" };
const GREEN = { bright: "#4f9a1a", dark: "#0f2a05" };

function point(angle: number, r: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function arc(from: number, to: number, r: number) {
  const a = point(from, r);
  const b = point(to, r);
  const big = to - from > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${big} 1 ${b.x} ${b.y}`;
}

const angleFor = (value: number) =>
  START + (SWEEP * Math.min(Math.max(value, 0), 100)) / 100;

// Ticks across the outer half of the band, as on the logo.
const TICKS = Array.from(
  { length: 14 },
  (_, i) => START + (SWEEP / 14) * (i + 0.5),
);

export default function Gauge({
  value = 78,
  zones = [33, 66],
  className = "",
  label = "Gauge",
}: {
  value?: number;
  // Where red turns orange and orange turns green, on the 0-100 scale.
  zones?: [number, number];
  className?: string;
  label?: string;
}) {
  // Gradient ids must be unique when several gauges share a page.
  const id = useId().replace(/:/g, "");
  const [redEnd, orangeEnd] = zones.map(angleFor);
  const needle = angleFor(value);

  const gradient = (
    key: string,
    from: number,
    to: number,
    start: string,
    end: string,
  ) => {
    const a = point(from, BAND_R);
    const b = point(to, BAND_R);
    return (
      <linearGradient
        id={`${id}-${key}`}
        gradientUnits="userSpaceOnUse"
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
      >
        <stop offset="0%" stopColor={start} />
        <stop offset="100%" stopColor={end} />
      </linearGradient>
    );
  };

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={label}
    >
      <defs>
        {gradient("red", START, redEnd, RED.dark, RED.bright)}
        {gradient("orange", redEnd, orangeEnd, ORANGE.from, ORANGE.to)}
        {gradient("green", orangeEnd, START + SWEEP, GREEN.bright, GREEN.dark)}
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2f2f2" />
          <stop offset="100%" stopColor="#6b6b6b" />
        </linearGradient>
        <linearGradient id={`${id}-needle`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c9c9c9" />
        </linearGradient>
      </defs>

      {/* dial face */}
      <circle cx={CX} cy={CY} r={96} fill="#000" />

      {/* silver rim */}
      <path
        d={arc(START - 4, START + SWEEP + 4, RIM_R)}
        stroke={`url(#${id}-rim)`}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />

      {/* the coloured band: High risk / Monitor / Ready */}
      <path
        d={arc(START, redEnd, BAND_R)}
        stroke={`url(#${id}-red)`}
        strokeWidth={BAND_W}
        fill="none"
      />
      <path
        d={arc(redEnd, orangeEnd, BAND_R)}
        stroke={`url(#${id}-orange)`}
        strokeWidth={BAND_W}
        fill="none"
      />
      <path
        d={arc(orangeEnd, START + SWEEP, BAND_R)}
        stroke={`url(#${id}-green)`}
        strokeWidth={BAND_W}
        fill="none"
      />

      {/* white dividers between the zones */}
      {[redEnd, orangeEnd].map((angle) => {
        const a = point(angle, BAND_R - BAND_W / 2);
        const b = point(angle, BAND_R + BAND_W / 2);
        return (
          <line
            key={angle}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#fff"
            strokeWidth={1.6}
          />
        );
      })}

      {/* ticks across the outer edge of the band, skipping any that would
          sit on a divider */}
      {TICKS.filter(
        (angle) =>
          Math.min(...[redEnd, orangeEnd].map((d) => Math.abs(d - angle))) > 4,
      ).map((angle) => {
        const a = point(angle, BAND_R + BAND_W / 2);
        const b = point(angle, BAND_R + 3);
        return (
          <line
            key={angle}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#fff"
            strokeOpacity={0.9}
            strokeWidth={1.4}
          />
        );
      })}

      {/* tapered needle, drawn pointing right, then rotated into place */}
      <g
        style={{
          transform: `rotate(${needle}deg)`,
          transformOrigin: `${CX}px ${CY}px`,
        }}
        className="transition-transform duration-700"
      >
        <polygon
          points={`${CX + 4},${CY - 4.6} ${CX + BAND_R - 5},${CY - 1.1} ${CX + BAND_R - 2},${CY} ${CX + BAND_R - 5},${CY + 1.1} ${CX + 4},${CY + 4.6}`}
          fill={`url(#${id}-needle)`}
        />
      </g>

      {/* hub: white ring around a dark centre */}
      <circle
        cx={CX}
        cy={CY}
        r={7.5}
        fill="#000"
        stroke="#e6e6e6"
        strokeWidth={3.5}
      />
    </svg>
  );
}
