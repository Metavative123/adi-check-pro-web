"use client";

import CheckIcon from "@mui/icons-material/Check";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import FoundingCountdown from "@/components/FoundingCountdown";
import type { FoundingCount, Plan } from "@/lib/api";
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
  plans: allPlans,
  founding,
  currentPlanId,
  busyPlanId,
  onChoose,
  ctaLabel = "Choose",
}: {
  plans: Plan[];
  founding?: FoundingCount;
  currentPlanId?: string | null;
  busyPlanId?: string | null;
  onChoose: (planId: Plan["id"]) => void;
  ctaLabel?: string;
}) {
  // The founding offer gets its own card above the others. The server only
  // sends it while this instructor can still take it (or is on it).
  const foundingPlan = allPlans.find((plan) => plan.founding);
  const plans = allPlans.filter((plan) => !plan.founding);

  // The biggest saving is highlighted rather than a hardcoded "most popular".
  const bestValue = plans.reduce<Plan | null>(
    (best, plan) => (!best || plan.savingPercent > best.savingPercent ? plan : best),
    null
  );

  return (
    <div className="space-y-4">
      {foundingPlan && (
        <FoundingCard
          plan={foundingPlan}
          founding={founding}
          isCurrent={currentPlanId === foundingPlan.id}
          busy={busyPlanId === foundingPlan.id}
          disabled={Boolean(busyPlanId)}
          onChoose={onChoose}
          ctaLabel={ctaLabel}
        />
      )}

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
                {plan.freeMonths
                  ? `${plan.freeMonths === 1 ? "One month" : `${plan.freeMonths} months`} free versus`
                  : `Save ${plan.savingPercent}% versus`}{" "}
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
    </div>
  );
}

// The founding member offer, with the countdown.
function FoundingCard({
  plan,
  founding,
  isCurrent,
  busy,
  disabled,
  onChoose,
  ctaLabel,
}: {
  plan: Plan;
  founding?: FoundingCount;
  isCurrent: boolean;
  busy: boolean;
  disabled: boolean;
  onChoose: (planId: Plan["id"]) => void;
  ctaLabel: string;
}) {
  return (
    <div className="relative rounded-2xl border border-dial bg-surface p-5 shadow-lg shadow-shade ring-1 ring-dial/30">
      <span className="absolute -top-2.5 left-5 flex items-center gap-1 rounded-full bg-dial px-2.5 py-0.5 text-[11px] font-semibold text-ink">
        <WorkspacePremiumOutlinedIcon sx={{ fontSize: 13 }} />
        Founding member offer
      </span>

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-semibold">{plan.name}</h3>
            {isCurrent && (
              <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-semibold text-brand-fg">
                Current
              </span>
            )}
          </div>
          <p className="mt-2 text-3xl font-semibold">
            {formatMoney(plan.amount, plan.currency)}
            <span className="ml-1 text-sm font-normal text-fg/50">per month</span>
            <span className="ml-2 text-sm font-normal text-fg/40 line-through">
              {formatMoney(plan.fullPrice, plan.currency)}
            </span>
          </p>
          <p className="mt-1 text-xs text-fg/60">
            For the first {founding?.limit ?? 50} members, locked in for as long as you stay
            subscribed. If you cancel, the place is gone and the price returns to{" "}
            {formatMoney(plan.fullPrice, plan.currency)} a month.
          </p>
          {founding && !isCurrent && <FoundingCountdown founding={founding} className="mt-3 max-w-sm" />}
        </div>

        <button
          onClick={() => onChoose(plan.id)}
          disabled={isCurrent || disabled || !plan.configured}
          className="rounded-lg bg-dial px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-95 disabled:opacity-60"
        >
          {isCurrent ? "Your plan" : busy ? "Opening Stripe..." : `${ctaLabel} ${formatMoney(plan.amount, plan.currency)} founding`}
        </button>
      </div>

      {!plan.configured && (
        <p className="mt-2 text-[11px] text-fg/50">No Stripe price set for this plan yet.</p>
      )}
    </div>
  );
}
