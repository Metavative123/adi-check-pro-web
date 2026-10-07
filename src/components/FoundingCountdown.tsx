import type { FoundingCount } from "@/lib/api";

// "37 of 50 founding places left", with a bar that empties as places go.
export default function FoundingCountdown({
  founding,
  className = "",
}: {
  founding: FoundingCount;
  className?: string;
}) {
  const { left, limit } = founding;
  const share = limit > 0 ? (left / limit) * 100 : 0;
  const lastFew = left > 0 && left <= 10;

  return (
    <div className={className} aria-live="polite">
      <p className="text-sm font-semibold">
        {left === 0 ? (
          "All founding places have gone"
        ) : (
          <>
            <span className={"tabular-nums " + (lastFew ? "text-dial" : "text-brand")}>{left}</span>{" "}
            of {limit} founding places left
            {lastFew && <span className="font-normal text-fg/60"> · nearly gone</span>}
          </>
        )}
      </p>
      <div
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fg/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={left}
        aria-label="Founding places left"
      >
        <div
          className={"h-full rounded-full transition-all " + (lastFew ? "bg-dial" : "bg-brand")}
          style={{ width: `${share}%` }}
        />
      </div>
    </div>
  );
}
