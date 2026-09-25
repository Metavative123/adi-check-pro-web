"use client";

import CheckIcon from "@mui/icons-material/Check";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import type { Plan } from "@/lib/api";
import { formatMoney } from "@/lib/money";

const FEATURES = [
  "Unlimited test logging",
  "12-month performance rating",
  "Pass-rate and fault trends",
  "PDF standards reports",
];

// The paid plans, side by side. The saving on each is worked out by the server
// from the amounts, so changing a price changes the advertised discount too.
export default function PlanCards({
  plans,
  currentPlanId,
  busyPlanId,
  onChoose,
  ctaLabel = "Choose",
}: {
  plans: Plan[];
  currentPlanId?: string | null;
  busyPlanId?: string | null;
  onChoose: (planId: Plan["id"]) => void;
  ctaLabel?: string;
}) {
  // The biggest saving is highlighted rather than a hardcoded "most popular".
  const bestValue = plans.reduce<Plan | null>(
    (best, plan) => (!best || plan.savingPercent > best.savingPercent ? plan : best),
    null
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent = currentPlanId === plan.id;
        const isBest = bestValue?.id === plan.id && plan.hasDiscount;

        return (
          <div
            key={plan.id}
            className={
              "relative flex flex-col rounded-2xl border bg-surface p-5 shadow-lg shadow-shade " +
              (isBest ? "border-brand ring-1 ring-brand/30" : "border-line")
            }
          >
            {isBest && (
              <span className="absolute -top-2.5 left-5 rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-semibold text-white">
                Best value
              </span>
            )}

            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold">{plan.name}</h3>
              {isCurrent && (
                <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-semibold text-brand-fg">
                  Current
                </span>
              )}
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {formatMoney(plan.amount, plan.currency)}
            </p>
            <p className="text-xs text-fg/50">
              {plan.months === 1
                ? "per month"
                : `for ${plan.months} months · ${formatMoney(plan.perMonth, plan.currency)} a month`}
            </p>

            {/* The discount, with the price it is measured against - so the
                claim can be checked rather than taken on trust. */}
            {plan.hasDiscount ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand">
                <LocalOfferOutlinedIcon sx={{ fontSize: 14 }} />
                Save {plan.savingPercent}% versus{" "}
                <span className="line-through opacity-70">
                  {formatMoney(plan.fullPrice, plan.currency)}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-xs text-fg/40">{plan.blurb}</p>
            )}

            <ul className="mt-4 flex-1 space-y-1.5">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-1.5 text-xs text-fg/70">
                  <CheckIcon sx={{ fontSize: 14 }} className="mt-0.5 shrink-0 text-brand" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onChoose(plan.id)}
              disabled={isCurrent || Boolean(busyPlanId) || !plan.configured}
              className={
                "mt-5 rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60 " +
                (isBest
                  ? "bg-brand text-white hover:bg-brand-dark"
                  : "border border-brand text-brand hover:bg-brand-light")
              }
            >
              {isCurrent
                ? "Your plan"
                : busyPlanId === plan.id
                  ? "Opening Stripe..."
                  : `${ctaLabel} ${plan.name.toLowerCase()}`}
            </button>

            {!plan.configured && (
              <p className="mt-2 text-[11px] text-fg/50">
                No Stripe price set for this plan yet.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
