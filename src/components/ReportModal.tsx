"use client";

import { useState } from "react";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

// Today's date in the UK, as YYYY-MM-DD - the same day the API works in.
function ukToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// The first day of a period of `months` months ending on `to`, matching the
// dashboard's rolling window: 12 months to 7 Oct 2026 starts 8 Oct 2025.
function periodStart(to: string, months: number) {
  const [year, month, day] = to.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1 - months, 1));
  const daysInMonth = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)
  ).getUTCDate();
  start.setUTCDate(Math.min(day, daysInMonth) + 1);
  return start.toISOString().slice(0, 10);
}

const PRESETS = [
  { label: "Last 3 months", months: 3 },
  { label: "Last 6 months", months: 6 },
  { label: "Last 12 months (same as dashboard)", months: 12 },
];

export default function ReportModal({ onClose }: { onClose: () => void }) {
  const today = ukToday();

  const [from, setFrom] = useState(periodStart(today, 12));
  const [to, setTo] = useState(today);
  // Deliberately a required decision rather than a buried default.
  const [hideNames, setHideNames] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    const token = getToken();
    if (!token) return;

    if (!from || !to) {
      setError("Choose a start and end date");
      return;
    }
    if (from > to) {
      setError("The start date must be before the end date");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const { report } = await api.getReport(token, from, to, hideNames);
      // jsPDF is browser-only, so it is pulled in here rather than at the top.
      const { downloadStandardsReport } = await import("@/lib/standardsReportPdf");
      await downloadStandardsReport(report);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build the report");
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Export performance report">
      <div className="space-y-5">
        <p className="text-sm text-fg/60">
          A PDF of every test in the period, with the calculation behind each figure
          and the rules used to work out the overall score.
        </p>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setFrom(periodStart(today, preset.months));
                setTo(today);
              }}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-fg/70 transition hover:bg-raised"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">From</span>
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-fg">To</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        {/* Privacy choice. Presented as its own decision, not a small tickbox
            among others, because it governs what leaves the app. */}
        <div className="rounded-xl border border-line p-4">
          <div className="flex items-start gap-2">
            <VisibilityOffOutlinedIcon fontSize="small" className="mt-0.5 text-fg/40" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg">Pupil names</p>
              <p className="mt-0.5 text-xs text-fg/50">
                Choose whether names appear in the PDF. Every test still shows its
                test ID, faults and result either way.
              </p>

              <div className="mt-3 flex gap-2">
                <ChoiceButton
                  selected={!hideNames}
                  onClick={() => setHideNames(false)}
                  label="Include names"
                />
                <ChoiceButton
                  selected={hideNames}
                  onClick={() => setHideNames(true)}
                  label="Hide names"
                />
              </div>

              {hideNames && (
                <p className="mt-2 text-xs text-brand">
                  Names are removed on the server, so the PDF will not contain them.
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-fg/50">
          {from === periodStart(today, 12) && to === today
            ? "This is the same 12 months as your dashboard, so the figures will match."
            : from === periodStart(to, 12)
              ? "Exactly 12 months. Figures will match the dashboard only if it ends today."
              : "Every figure in the PDF is for this period, so it can differ from the dashboard's rolling 12 months."}
        </p>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button onClick={download} loading={busy}>
          <span className="flex items-center justify-center gap-2">
            <PictureAsPdfOutlinedIcon fontSize="small" />
            Download PDF
          </span>
        </Button>
      </div>
    </Modal>
  );
}

function ChoiceButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition " +
        (selected
          ? "border-brand bg-brand text-white"
          : "border-line text-fg/60 hover:bg-raised")
      }
    >
      {label}
    </button>
  );
}
