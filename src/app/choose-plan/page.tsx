"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SpeedIcon from "@mui/icons-material/Speed";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import PlanCards from "@/components/PlanCards";
import { Skeleton, SkeletonRegion } from "@/components/Skeleton";
import ThemeSwitch from "@/components/ThemeSwitch";
import { api, type Billing, type Plan } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

// Shown once, between finishing the profile and reaching the dashboard.
// Existing accounts see it too, because they have not made this choice yet.
export default function ChoosePlanPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<Billing | null>(null);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
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
        <span className="flex-1 font-semibold">ADI Check Pro</span>
        <ThemeSwitch className="text-white/70 hover:bg-white/10 hover:text-white" />
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
            <h1 className="text-2xl font-semibold">
              {billing.trialOffer > 0
                ? `Start your ${billing.trialOffer}-day free trial`
                : "Choose a plan"}
            </h1>
            <p className="mt-2 text-sm text-fg/60">
              Pick the plan you want to keep. You can change it later from Billing.
            </p>

            {billing.testMode && (
              <p className="mt-4 flex items-center gap-2 rounded-xl border border-dial/30 bg-dial/10 px-4 py-3 text-xs text-fg/70">
                <ScienceOutlinedIcon sx={{ fontSize: 16 }} className="text-dial" />
                Stripe test mode. Pay with card{" "}
                <span className="font-mono">4242 4242 4242 4242</span>, any future
                expiry and any CVC. No real money moves.
              </p>
            )}

            {/* The card is taken now; the plan's price is first charged when
                the trial ends, unless it is cancelled before then. */}
            {billing.trialOffer > 0 && (
              <section className="mb-6 mt-6 flex items-start gap-3 rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-shade">
                <TimerOutlinedIcon className="mt-0.5 text-brand" />
                <div>
                  <h2 className="font-semibold">
                    {billing.trialOffer} days free, everything included
                  </h2>
                  <p className="mt-0.5 text-sm text-fg/60">
                    Add your card now. <strong>Nothing is charged until{" "}
                    {trialEndDate(billing.trialOffer)}</strong>, then your plan
                    starts. Cancel before then and you pay nothing.
                  </p>
                </div>
              </section>
            )}
            {billing.trialOffer === 0 && <div className="mt-6" />}

            <PlanCards
              plans={billing.plans}
              founding={billing.founding}
              busyPlanId={busyPlanId}
              onChoose={pay}
              ctaLabel={billing.trialOffer > 0 ? "Start trial with" : "Pay"}
            />

            {error && <p className="mt-4 text-sm text-danger">{error}</p>}
          </>
        )}
      </div>
    </main>
  );
}

// The day the first charge is taken, e.g. "26 November 2026".
function trialEndDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
