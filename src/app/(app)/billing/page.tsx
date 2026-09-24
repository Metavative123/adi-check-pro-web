"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CheckIcon from "@mui/icons-material/Check";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import { api, type Billing } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useApp } from "@/lib/appContext";

const FEATURES = [
  "Unlimited test logging",
  "12-month performance rating",
  "Pass-rate and fault trends",
  "Search and filter every test",
];

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
    <Suspense fallback={<p className="text-sm text-ink/60">Loading...</p>}>
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    async function load(authToken: string) {
      try {
        const { billing: data } = await api.getBilling(authToken, true);
        if (!cancelled) setBilling(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load billing");
      }
    }

    load(token);
    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  async function upgrade() {
    const token = getToken();
    if (!token) return;

    setBusy(true);
    setError("");
    try {
      const origin = window.location.origin;
      const { url } = await api.startCheckout(
        token,
        `${origin}/billing?checkout=success`,
        `${origin}/billing?checkout=cancelled`
      );
      window.location.href = url; // Stripe-hosted checkout
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setBusy(false);
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
    return <p className="text-sm text-ink/60">{error || "Loading..."}</p>;
  }

  if (!billing.enabled) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-ink/10 bg-white p-6 shadow-lg shadow-ink/5">
        <h2 className="font-semibold">Billing is switched off</h2>
        <p className="mt-2 text-sm text-ink/60">
          Every feature is available with no subscription. Set{" "}
          <span className="font-mono text-xs">BILLING_ENABLED=true</span> on the API
          to turn payments back on.
        </p>
      </div>
    );
  }

  const onTrial = billing.status === "trialing";
  const subscribed = billing.status === "active";
  const expired = !billing.hasAccess;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {returningFromCheckout && subscribed && (
        <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
          Payment received. Your subscription is active.
        </p>
      )}

      {billing.testMode && (
        <p className="flex items-center gap-2 rounded-xl border border-dial/30 bg-dial/10 px-4 py-3 text-xs text-ink/70">
          <ScienceOutlinedIcon sx={{ fontSize: 16 }} className="text-dial" />
          Stripe test mode. Use card <span className="font-mono">4242 4242 4242 4242</span>,
          any future expiry and any CVC. No real money moves.
        </p>
      )}

      {/* Current plan */}
      <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-lg shadow-ink/5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-ink/60">Current plan</p>
            <p className="text-2xl font-semibold">{LABELS[billing.status]}</p>
          </div>
          <span
            className={
              "rounded-full px-3 py-1 text-xs font-semibold " +
              (billing.hasAccess
                ? "bg-brand-light text-brand-dark"
                : "bg-red-50 text-red-700")
            }
          >
            {billing.hasAccess ? "Active" : "No access"}
          </span>
        </div>

        <p className="mt-3 text-sm text-ink/60">
          {onTrial && billing.hasAccess && (
            <>
              {billing.trialDaysLeft} day{billing.trialDaysLeft === 1 ? "" : "s"} left in
              your free trial. No card needed until it ends.
            </>
          )}
          {onTrial && !billing.hasAccess && (
            <>Your free trial has ended. Subscribe to keep logging tests.</>
          )}
          {subscribed && billing.currentPeriodEnd && (
            <>
              {billing.cancelAtPeriodEnd ? "Access ends " : "Renews "}
              {new Date(billing.currentPeriodEnd).toLocaleDateString("en-GB")}.
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

      {/* Plan on offer */}
      {!subscribed && (
        <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-lg shadow-ink/5">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold">Pro</h2>
            <p className="text-2xl font-semibold">£19</p>
            <p className="text-sm text-ink/50">per month</p>
          </div>

          <ul className="mt-4 space-y-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-ink/70">
                <CheckIcon sx={{ fontSize: 16 }} className="text-brand" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={upgrade}
            disabled={busy || !billing.configured}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            <CreditCardOutlinedIcon fontSize="small" />
            {busy ? "Opening Stripe..." : expired ? "Subscribe now" : "Upgrade to Pro"}
          </button>

          {!billing.configured && (
            <p className="mt-2 text-xs text-ink/50">
              Billing is not configured on the server yet.
            </p>
          )}
        </section>
      )}

      {/* Manage an existing subscription */}
      {billing.hasBillingAccount && (
        <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-lg shadow-ink/5">
          <h2 className="font-semibold">Manage billing</h2>
          <p className="mt-1 text-sm text-ink/60">
            Change your card, download invoices or cancel, on Stripe.
          </p>
          <button
            onClick={manage}
            disabled={busy}
            className="mt-4 rounded-lg border border-ink/15 px-4 py-2 text-sm font-medium text-ink transition hover:bg-slate-50 disabled:opacity-60"
          >
            Open billing portal
          </button>
        </section>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

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
