"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Skeleton, SkeletonRegion } from "@/components/Skeleton";

// Where Stripe sends the customer after paying.
//
// This page is deliberately OUTSIDE the signed-in guard. Landing on a guarded
// page here would bounce the user back to the plan screen, because the new
// subscription has not been applied yet - the webhook may not even have
// arrived. Confirming the session first makes the redirect correct every time.
export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={<Waiting />}>
      <CheckoutComplete />
    </Suspense>
  );
}

function CheckoutComplete() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function confirm(authToken: string) {
      try {
        if (sessionId) await api.confirmCheckout(authToken, sessionId);
        if (!cancelled) router.replace("/dashboard");
      } catch (err) {
        if (cancelled) return;
        // The payment itself may well have gone through - the webhook will
        // catch up - so offer a way on rather than a dead end.
        setError(err instanceof Error ? err.message : "Could not confirm the payment");
      }
    }

    confirm(token);
    return () => {
      cancelled = true;
    };
  }, [router, sessionId]);

  if (error) {
    return (
      <Shell>
        <p className="text-sm text-danger">{error}</p>
        <p className="mt-2 text-sm text-fg/60">
          If you were charged, your plan will be activated shortly.
        </p>
        <button
          onClick={() => router.replace("/dashboard")}
          className="mt-5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Go to dashboard
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center gap-3">
        <CheckCircleIcon className="text-brand" />
        <div>
          <h1 className="font-semibold">Payment received</h1>
          <p className="text-sm text-fg/60">Setting up your account...</p>
        </div>
      </div>
      <Skeleton className="mt-6 h-2 w-full rounded-full" />
    </Shell>
  );
}

function Waiting() {
  return (
    <Shell>
      <SkeletonRegion label="Confirming your payment">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-4 w-56" />
      </SkeletonRegion>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-canvas">
      <header className="flex items-center gap-2 bg-ink px-6 py-4 text-white">
        <SpeedIcon className="text-dial" />
        <span className="font-semibold">ADI Check Pro</span>
      </header>
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
          {children}
        </div>
      </div>
    </main>
  );
}
