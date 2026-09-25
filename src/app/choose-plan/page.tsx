"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SpeedIcon from "@mui/icons-material/Speed";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import PlanCards from "@/components/PlanCards";
import { Skeleton, SkeletonRegion } from "@/components/Skeleton";
import { api, type Billing, type Plan } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

// Shown once, between finishing the profile and reaching the dashboard.
// Existing accounts see it too, because they have not made this choice yet.
export default function ChoosePlanPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<Billing | null>(null);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [startingTrial, setStartingTrial] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function load(authToken: string) {
      try {
        const { billing: data } = await api.getBilling(authToken);

        if (cancelled) return;

        // Billing switched off, or the choice already made - nothing to do here.
        if (!data.enabled || !data.needsPlanChoice) {
          router.replace("/dashboard");
          return;
        }
        setBilling(data);
      } catch {
        if (!cancelled) {
          clearToken();
          router.replace("/login");
        }
      }
    }

    load(token);
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function takeTrial() {
    const token = getToken();
    if (!token) return;

    setStartingTrial(true);
    setError("");
    try {
      await api.chooseTrial(token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the trial");
      setStartingTrial(false);
    }
  }

  async function pay(planId: Plan["id"]) {
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
        `${origin}/choose-plan`
      );
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setBusyPlanId(null);
    }
  }

  return (
    <main className="min-h-screen bg-canvas">
      <header className="flex items-center gap-2 bg-ink px-6 py-4 text-white">
        <SpeedIcon className="text-dial" />
        <span className="font-semibold">ADI Check Pro</span>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {!billing ? (
          <SkeletonRegion label="Loading the plans">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-3 h-4 w-96" />
            <Skeleton className="mt-8 h-28 rounded-2xl" />
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          </SkeletonRegion>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Choose how to start</h1>
            <p className="mt-2 text-sm text-fg/60">
              Try it free first, or go straight to a plan. You can change this later
              from Billing.
            </p>

            {billing.testMode && (
              <p className="mt-4 flex items-center gap-2 rounded-xl border border-dial/30 bg-dial/10 px-4 py-3 text-xs text-fg/70">
                <ScienceOutlinedIcon sx={{ fontSize: 16 }} className="text-dial" />
                Stripe test mode. Pay with card{" "}
                <span className="font-mono">4242 4242 4242 4242</span>, any future
                expiry and any CVC. No real money moves.
              </p>
            )}

            {/* The free trial, given its own row so it is not read as a
                fourth price. No card is taken. */}
            <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-shade">
              <div className="flex items-start gap-3">
                <TimerOutlinedIcon className="mt-0.5 text-brand" />
                <div>
                  <h2 className="font-semibold">
                    Free trial · {billing.trialDays} days
                  </h2>
                  <p className="mt-0.5 text-sm text-fg/60">
                    Everything included. <strong>No card required</strong> - pick a
                    plan whenever you are ready.
                  </p>
                </div>
              </div>

              <button
                onClick={takeTrial}
                disabled={startingTrial || Boolean(busyPlanId)}
                className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
              >
                {startingTrial ? "Starting..." : "Start free trial"}
              </button>
            </section>

            <h2 className="mt-8 font-semibold">Or subscribe now</h2>
            <p className="mb-4 mt-1 text-sm text-fg/60">
              Longer plans cost less per month.
            </p>

            <PlanCards
              plans={billing.plans}
              busyPlanId={busyPlanId}
              onChoose={pay}
              ctaLabel="Pay"
            />

            {error && <p className="mt-4 text-sm text-danger">{error}</p>}
          </>
        )}
      </div>
    </main>
  );
}
