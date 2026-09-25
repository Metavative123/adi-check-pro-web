"use client";

import { useState } from "react";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

const inputClass =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

// Handy starting points, so the common cases are one click.
function monthsAgo(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
}

const PRESETS = [
  { label: "Last 3 months", months: 3 },
  { label: "Last 6 months", months: 6 },
  { label: "Last 12 months", months: 12 },
];

export default function ReportModal({ onClose }: { onClose: () => void }) {
  const today = new Date().toISOString().slice(0, 10);

  const [from, setFrom] = useState(monthsAgo(12));
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
    <Modal open onClose={onClose} title="Export standards report">
      <div className="space-y-5">
        <p className="text-sm text-ink/60">
          A PDF of every test in the period, with the calculation behind each figure
          and the rules used to work out the overall score.
        </p>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setFrom(monthsAgo(preset.months));
                setTo(today);
              }}
              className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/70 transition hover:bg-slate-50"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">From</span>
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">To</span>
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
        <div className="rounded-xl border border-ink/15 p-4">
          <div className="flex items-start gap-2">
            <VisibilityOffOutlinedIcon fontSize="small" className="mt-0.5 text-ink/40" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">Pupil names</p>
              <p className="mt-0.5 text-xs text-ink/50">
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

        {error && <p className="text-sm text-red-600">{error}</p>}

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
          : "border-ink/15 text-ink/60 hover:bg-slate-50")
      }
    >
      {label}
    </button>
  );
}
