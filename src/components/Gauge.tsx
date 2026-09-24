// A speedometer-style gauge. `value` is 0-100 and moves the needle.
const CX = 100;
const CY = 100;
const R = 78;
const START = 150; // degrees, bottom-left
const SWEEP = 240; // degrees of travel

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

// The full arc, drawn once. Progress is a dash of it, so it animates smoothly.
const TRACK = arc(START, START + SWEEP, R);

const ticks = Array.from({ length: 13 }, (_, i) => START + (SWEEP / 12) * i);

export default function Gauge({
  value = 78,
  className = "",
}: {
  value?: number;
  className?: string;
}) {
  const angle = START + (SWEEP * value) / 100;

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Gauge">
      <defs>
        <linearGradient id="gaugeFill" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-brand)" />
          <stop offset="60%" stopColor="#3ecf8e" />
          <stop offset="100%" stopColor="var(--color-dial)" />
        </linearGradient>
      </defs>

      {/* dial face */}
      <circle cx={CX} cy={CY} r={94} className="fill-ink-soft/40" />

      {/* track */}
      <path
        d={TRACK}
        className="stroke-white/15"
        strokeWidth={14}
        strokeLinecap="round"
        fill="none"
      />

      {/* progress */}
      <path
        d={TRACK}
        pathLength={100}
        strokeDasharray={`${value} ${100 - value}`}
        stroke="url(#gaugeFill)"
        strokeWidth={14}
        strokeLinecap="round"
        fill="none"
        className="transition-all duration-700"
      />

      {/* ticks */}
      {ticks.map((t) => {
        const a = point(t, 58);
        const b = point(t, 50);
        return (
          <line
            key={t}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className="stroke-white/40"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}

      {/* needle — drawn pointing up, then rotated into place */}
      <g
        style={{ transform: `rotate(${angle - 270}deg)`, transformOrigin: "100px 100px" }}
        className="transition-transform duration-700"
      >
        <line
          x1={CX}
          y1={CY}
          x2={CX}
          y2={38}
          className="stroke-white"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
      <circle cx={CX} cy={CY} r={8} className="fill-white" />
      <circle cx={CX} cy={CY} r={4} className="fill-ink" />
    </svg>
  );
}
