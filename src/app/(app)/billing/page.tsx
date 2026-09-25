"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import PlanCards from "@/components/PlanCards";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { api, type Billing, type Payment, type Plan } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { getToken } from "@/lib/auth";
import { useApp } from "@/lib/appContext";
import { Skeleton, SkeletonRegion } from "@/components/Skeleton";

const LABELS: Record<Billing["status"], string> = {
  trialing: "Free trial",
  active: "Pro",
  past_due: "Payment failed",
  canceled: "Cancelled",
  incomplete: "Incomplete",
  none: "No plan",
};

export default function BillingPage() {
  // useSearchParams needs a Suspense boundary to stay prerenderable.
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-64 max-w-2xl rounded-2xl" />}>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const { refresh } = useApp();
  const params = useSearchParams();
  // Coming back from Stripe, read the live state rather than our stored copy.
  const returningFromCheckout = params.get("checkout") === "success";

  const [billing, setBilling] = useState<Billing | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [busy, setBusy] = useState(false);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    async function load(authToken: string) {
      try {
        const [{ billing: data }, history] = await Promise.all([
          api.getBilling(authToken, true),
          api.listPayments(authToken).catch(() => ({ payments: [] })),
        ]);
        if (cancelled) return;
        setBilling(data);
        setPayments(history.payments);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load billing");
      }
    }

    load(token);
    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  async function choosePlan(planId: Plan["id"]) {
    const token = getToken();
    if (!token) return;

    setBusyPlanId(planId);
    setError("");
    try {
      const origin = window.location.origin;
      const { url } = await api.startCheckout(
        token,
        planId,
        `${origin}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
        `${origin}/billing?checkout=cancelled`
      );
      window.location.href = url; // Stripe-hosted checkout
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setBusyPlanId(null);
    }
  }

  async function manage() {
    const token = getToken();
    if (!token) return;

    setBusy(true);
    setError("");
    try {
      const { url } = await api.openBillingPortal(token, `${window.location.origin}/billing`);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the billing portal");
      setBusy(false);
    }
  }

  if (!billing) {
    if (error) return <p className="text-sm text-danger">{error}</p>;

    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <SkeletonRegion label="Loading your plan">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-3 h-8 w-40" />
            <Skeleton className="mt-4 h-3.5 w-72" />
          </div>
          <div className="mt-4 rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
            <Skeleton className="h-5 w-32" />
            <div className="mt-4 space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-3.5 w-56" />
              ))}
            </div>
            <Skeleton className="mt-6 h-10 w-full rounded-lg" />
          </div>
        </SkeletonRegion>
      </div>
    );
  }

  if (!billing.enabled) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
        <h2 className="font-semibold">Billing is switched off</h2>
        <p className="mt-2 text-sm text-fg/60">
          Every feature is available with no subscription. Set{" "}
          <span className="font-mono text-xs">BILLING_ENABLED=true</span> on the API
          to turn payments back on.
        </p>
      </div>
    );
  }

  const onTrial = billing.status === "trialing";
  const subscribed = billing.status === "active";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {returningFromCheckout && subscribed && (
        <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-fg">
          Payment received. Your subscription is active.
        </p>
      )}

      {billing.testMode && (
        <p className="flex items-center gap-2 rounded-xl border border-dial/30 bg-dial/10 px-4 py-3 text-xs text-fg/70">
          <ScienceOutlinedIcon sx={{ fontSize: 16 }} className="text-dial" />
          Stripe test mode. Use card <span className="font-mono">4242 4242 4242 4242</span>,
          any future expiry and any CVC. No real money moves.
        </p>
      )}

      {/* Current plan */}
      <section className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-fg/60">Current plan</p>
            <p className="text-2xl font-semibold">{LABELS[billing.status]}</p>
          </div>
          <span
            className={
              "rounded-full px-3 py-1 text-xs font-semibold " +
              (billing.hasAccess
                ? "bg-brand-light text-brand-fg"
                : "bg-danger-bg text-danger-fg")
            }
          >
            {billing.hasAccess ? "Active" : "No access"}
          </span>
        </div>

        <p className="mt-3 text-sm text-fg/60">
          {onTrial && billing.hasAccess && (
            <>
              {billing.trialDaysLeft} day{billing.trialDaysLeft === 1 ? "" : "s"} left in
              your free trial. No card needed until it ends.
            </>
          )}
          {onTrial && !billing.hasAccess && (
            <>Your free trial has ended. Subscribe to keep logging tests.</>
          )}
          {subscribed && (billing.accessEndsAt || billing.currentPeriodEnd) && (
            <>
              {billing.cancelAtPeriodEnd ? "Access ends " : "Renews "}
              {new Date(
                billing.accessEndsAt || (billing.currentPeriodEnd as string)
              ).toLocaleDateString("en-GB")}
              .
              {billing.cancelAtPeriodEnd &&
                " Your plan will not renew, and nothing is charged again."}
            </>
          )}
          {billing.status === "past_due" && (
            <>Your last payment failed. Update your card to restore access.</>
          )}
          {billing.status === "canceled" && (
            <>Your subscription has been cancelled. Subscribe again any time.</>
          )}
        </p>
      </section>

      {/* The plans. Shown whatever the current state, so a subscriber can
          move between them and a trial user can start paying. */}
      <section>
        <h2 className="mb-1 font-semibold">
          {subscribed ? "Change plan" : "Plans"}
        </h2>
        <p className="mb-4 text-sm text-fg/60">
          Longer plans cost less per month. Prices include everything.
        </p>

        <PlanCards
          plans={billing.plans}
          currentPlanId={billing.planId}
          busyPlanId={busyPlanId}
          onChoose={choosePlan}
          ctaLabel={subscribed ? "Switch to" : "Pay"}
        />

        {subscribed && (
          <p className="mt-3 text-xs text-fg/50">
            Switching plans is handled by Stripe, which adjusts what you owe for
            the time already paid for.
          </p>
        )}
      </section>

      {/* Manage an existing subscription */}
      {billing.hasBillingAccount && (
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
          <h2 className="font-semibold">Manage billing</h2>
          <p className="mt-1 text-sm text-fg/60">
            Change your card, download invoices or cancel, on Stripe.
          </p>
          <button
            onClick={manage}
            disabled={busy || Boolean(busyPlanId)}
            className="mt-4 rounded-lg border border-line px-4 py-2 text-sm font-medium text-fg transition hover:bg-raised disabled:opacity-60"
          >
            Open billing portal
          </button>
        </section>
      )}

      {/* What has actually been charged, from the payments collection. */}
      {payments.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
          <div className="mb-4 flex items-center gap-2">
            <ReceiptLongOutlinedIcon className="text-brand" fontSize="small" />
            <h2 className="font-semibold">Payment history</h2>
          </div>

          <ul className="divide-y divide-line">
            {payments.map((payment) => (
              <li
                key={payment._id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {payment.description || "Subscription"}
                  </p>
                  <p className="text-xs text-fg/50">
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleDateString("en-GB")
                      : "Pending"}
                    {payment.periodEnd &&
                      ` · covers to ${new Date(payment.periodEnd).toLocaleDateString("en-GB")}`}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatMoney(payment.amount, payment.currency)}
                  </span>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                      (payment.status === "paid"
                        ? "bg-brand-light text-brand-fg"
                        : "bg-danger-bg text-danger-fg")
                    }
                  >
                    {payment.status}
                  </span>
                  {payment.receiptUrl && (
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-brand hover:underline"
                    >
                      Receipt
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        onClick={() => {
          setLoadKey((n) => n + 1);
          refresh();
        }}
        className="text-xs font-medium text-brand hover:underline"
      >
        Refresh status
      </button>
    </div>
  );
}
