"use client";

import Link from "next/link";
import { useApp } from "@/lib/appContext";

// Shows only when the trial is nearly over or access has lapsed - and never
// at all while billing is switched off.
const WARN_WITHIN_DAYS = 5;

export default function TrialBanner() {
  const { billing } = useApp();

  if (!billing || !billing.enabled) return null;

  const expired = !billing.hasAccess;
  const endingSoon =
    billing.status === "trialing" &&
    billing.hasAccess &&
    billing.trialDaysLeft <= WARN_WITHIN_DAYS;

  if (!expired && !endingSoon) return null;

  return (
    <div
      className={
        "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm " +
        (expired
          ? "border border-danger-line bg-danger-bg text-danger-fg"
          : "border border-dial/30 bg-dial/10 text-fg/80")
      }
    >
      <span>
        {expired
          ? "Your access has ended. Subscribe to keep logging tests."
          : `${billing.trialDaysLeft} day${billing.trialDaysLeft === 1 ? "" : "s"} left in your free trial.`}
      </span>
      <Link
        href="/billing"
        className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
      >
        {expired ? "Subscribe" : "See plans"}
      </Link>
    </div>
  );
}
