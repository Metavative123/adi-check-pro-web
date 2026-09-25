"use client";

import Link from "next/link";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useApp } from "@/lib/appContext";

// Explains why the add and edit controls have gone, rather than leaving the
// instructor to discover it by clicking something that fails.
export default function ReadOnlyBanner() {
  const { billing } = useApp();

  if (!billing?.enabled || billing.access?.level !== "read_only") return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dial/30 bg-dial/10 px-4 py-3 text-sm">
      <span className="flex items-center gap-2">
        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} className="text-dial" />
        View only. {billing.access.message}
      </span>
      <Link
        href="/billing"
        className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
      >
        See plans
      </Link>
    </div>
  );
}
