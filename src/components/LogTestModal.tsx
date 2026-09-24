"use client";

import { useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { api, type Test, type User } from "@/lib/api";
import { getToken } from "@/lib/auth";

const STEPS = ["Pupil", "Result", "Faults", "Review"];

// Everything the wizard collects, in one object.
type Form = {
  pupilName: string;
  testDate: string;
  centerId: string;
  result: "" | "pass" | "fail";
  driving: number;
  serious: number;
  dangerous: number;
  physicalIntervention: boolean;
  verbalIntervention: boolean;
};

const EMPTY: Form = {
  pupilName: "",
  testDate: "",
  centerId: "",
  result: "",
  driving: 0,
  serious: 0,
  dangerous: 0,
  physicalIntervention: false,
  verbalIntervention: false,
};

const inputClass =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function LogTestModal({
  onClose,
  user,
  onSaved,
  test,
}: {
  onClose: () => void;
  user: User;
  // affectsRating is false when only the name, date or centre changed.
  onSaved: (result: { test: Test; affectsRating: boolean }) => void;
  // Passing a test turns the wizard into an edit form for it.
  test?: Test;
}) {
  const editing = Boolean(test);

  const [step, setStep] = useState(1);
  // Mounted only while open, so the wizard always starts from the right
  // values - either blank, or the test being edited.
  const [form, setForm] = useState<Form>(() =>
    test
      ? {
          pupilName: test.pupilName,
          testDate: test.testDate.slice(0, 10),
          centerId: test.testCenter.centerId,
          result: test.result,
          driving: test.faults.driving,
          serious: test.faults.serious,
          dangerous: test.faults.dangerous,
          physicalIntervention: test.physicalIntervention,
          verbalIntervention: test.verbalIntervention,
        }
      : {
          ...EMPTY,
          testDate: new Date().toISOString().slice(0, 10),
          centerId: user.testCenters[0]?._id || "",
        }
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Each step says what must be filled in before moving on.
  function validate(current: number) {
    if (current === 1) {
      if (!form.pupilName.trim()) return "Pupil name is required";
      if (!form.testDate) return "Test date is required";
      if (!form.centerId) return "Choose a test centre";
    }
    if (current === 2 && !form.result) return "Choose pass or fail";
    return "";
  }

  function next() {
    const problem = validate(step);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, 4));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  async function submit() {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    setError("");

    const payload = {
      pupilName: form.pupilName,
      testDate: form.testDate,
      centerId: form.centerId,
      result: form.result as "pass" | "fail",
      faults: {
        driving: form.driving,
        serious: form.serious,
        dangerous: form.dangerous,
      },
      physicalIntervention: form.physicalIntervention,
      verbalIntervention: form.verbalIntervention,
    };

    try {
      if (test) {
        const result = await api.updateTest(token, test._id, payload);
        onSaved(result);
      } else {
        // A new test always moves the figures.
        const { test: created } = await api.createTest(token, payload);
        onSaved({ test: created, affectsRating: true });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the test");
      setSaving(false);
    }
  }

  const center = user.testCenters.find((c) => c._id === form.centerId);

  return (
    <Modal open onClose={onClose} title={editing ? `Edit test ${test?.reference}` : "Log a test"}>
      <Steps step={step} />

      {step === 1 && (
        <div className="space-y-4">
          <Labelled label="Pupil name">
            <input
              autoFocus
              value={form.pupilName}
              onChange={(e) => set("pupilName", e.target.value)}
              placeholder="Sara Khan"
              className={inputClass}
            />
          </Labelled>

          <Labelled label="Test date">
            <input
              type="date"
              value={form.testDate}
              onChange={(e) => set("testDate", e.target.value)}
              className={inputClass}
            />
          </Labelled>

          <Labelled label="Test centre">
            <select
              value={form.centerId}
              onChange={(e) => set("centerId", e.target.value)}
              className={inputClass}
            >
              {user.testCenters.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                  {c.code ? " (" + c.code + ")" : ""}
                </option>
              ))}
            </select>
          </Labelled>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-2 gap-4">
          <ResultCard
            label="Pass"
            selected={form.result === "pass"}
            onClick={() => set("result", "pass")}
            icon={<CheckCircleIcon />}
            tone="pass"
          />
          <ResultCard
            label="Fail"
            selected={form.result === "fail"}
            onClick={() => set("result", "fail")}
            icon={<CancelIcon />}
            tone="fail"
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <Counter
            label="Driving faults"
            hint="Minor faults"
            value={form.driving}
            onChange={(v) => set("driving", v)}
          />
          <Counter
            label="Serious faults"
            value={form.serious}
            onChange={(v) => set("serious", v)}
          />
          <Counter
            label="Dangerous faults"
            value={form.dangerous}
            onChange={(v) => set("dangerous", v)}
          />

          <div className="space-y-4 border-t border-ink/10 pt-5">
            <YesNo
              label="Physical intervention"
              value={form.physicalIntervention}
              onChange={(v) => set("physicalIntervention", v)}
            />
            <YesNo
              label="Verbal instruction"
              value={form.verbalIntervention}
              onChange={(v) => set("verbalIntervention", v)}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <ReviewGroup title="Pupil" onEdit={() => setStep(1)}>
            <Row label="Name" value={form.pupilName} />
            <Row label="Date" value={form.testDate} />
            <Row label="Centre" value={center ? center.name : "-"} />
          </ReviewGroup>

          <ReviewGroup title="Result" onEdit={() => setStep(2)}>
            <Row
              label="Outcome"
              value={form.result === "pass" ? "Pass" : "Fail"}
              tone={form.result === "pass" ? "pass" : "fail"}
            />
          </ReviewGroup>

          <ReviewGroup title="Faults" onEdit={() => setStep(3)}>
            <Row label="Driving" value={String(form.driving)} />
            <Row label="Serious" value={String(form.serious)} />
            <Row label="Dangerous" value={String(form.dangerous)} />
            <Row
              label="Physical intervention"
              value={form.physicalIntervention ? "Yes" : "No"}
            />
            <Row
              label="Verbal instruction"
              value={form.verbalIntervention ? "Yes" : "No"}
            />
          </ReviewGroup>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <button
            onClick={back}
            className="flex items-center gap-1 rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink hover:bg-slate-50"
          >
            <ArrowBackIcon fontSize="small" /> Back
          </button>
        )}
        {step < 4 ? (
          <Button onClick={next}>Continue</Button>
        ) : (
          <Button onClick={submit} loading={saving}>
            {editing ? "Save changes" : "Submit test"}
          </Button>
        )}
      </div>
    </Modal>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

// The numbered progress bar along the top of the wizard.
function Steps({ step }: { step: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li key={label} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition " +
                (current
                  ? "bg-brand text-white"
                  : done
                    ? "bg-brand-light text-brand"
                    : "bg-slate-100 text-ink/40")
              }
            >
              {n}
            </span>
            <span
              className={
                "text-[11px] " + (current ? "font-medium text-ink" : "text-ink/40")
              }
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function ResultCard({
  label,
  selected,
  onClick,
  icon,
  tone,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  tone: "pass" | "fail";
}) {
  const active =
    tone === "pass"
      ? "border-brand bg-brand-light text-brand-dark"
      : "border-red-500 bg-red-50 text-red-700";

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex flex-col items-center gap-2 rounded-xl border-2 py-8 text-sm font-semibold transition " +
        (selected ? active : "border-ink/10 text-ink/50 hover:border-ink/25")
      }
    >
      {icon}
      {label}
    </button>
  );
}

function Counter({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {hint && <p className="text-xs text-ink/50">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <StepButton onClick={() => onChange(Math.max(0, value - 1))} label={"Decrease " + label}>
          -
        </StepButton>
        <span className="w-8 text-center text-lg font-semibold tabular-nums">{value}</span>
        <StepButton onClick={() => onChange(value + 1)} label={"Increase " + label}>
          +
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="h-8 w-8 rounded-lg border border-ink/15 text-lg leading-none text-ink hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="flex gap-2">
        {[true, false].map((option) => (
          <button
            key={String(option)}
            type="button"
            onClick={() => onChange(option)}
            className={
              "rounded-lg border px-4 py-1.5 text-sm transition " +
              (value === option
                ? "border-brand bg-brand text-white"
                : "border-ink/15 text-ink/60 hover:bg-slate-50")
            }
          >
            {option ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewGroup({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink/10 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          <EditIcon sx={{ fontSize: 14 }} /> Edit
        </button>
      </div>
      <dl className="space-y-1">{children}</dl>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "pass" | "fail";
}) {
  return (
    <div className="flex justify-between text-sm">
      <dt className="text-ink/60">{label}</dt>
      <dd
        className={
          "font-medium " +
          (tone === "pass" ? "text-brand" : tone === "fail" ? "text-red-600" : "text-ink")
        }
      >
        {value || "-"}
      </dd>
    </div>
  );
}
