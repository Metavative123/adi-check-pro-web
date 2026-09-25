"use client";

export type Filters = {
  search: string;
  from: string;
  to: string;
  // "" means no filter, "true" / "false" narrow the results
  physicalIntervention: "" | "true" | "false";
  verbalIntervention: "" | "true" | "false";
};

export const EMPTY_FILTERS: Filters = {
  search: "",
  from: "",
  to: "",
  physicalIntervention: "",
  verbalIntervention: "",
};

const inputClass =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function TestFilters({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
}) {
  const set = <K extends keyof Filters>(key: K, next: Filters[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="mt-3 flex flex-wrap items-end gap-3">
      <Field label="From">
        <input
          type="date"
          value={value.from}
          max={value.to || undefined}
          onChange={(e) => set("from", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="To">
        <input
          type="date"
          value={value.to}
          min={value.from || undefined}
          onChange={(e) => set("to", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Physical intervention">
        <TriState
          value={value.physicalIntervention}
          onChange={(next) => set("physicalIntervention", next)}
          label="Physical intervention"
        />
      </Field>

      <Field label="Verbal instruction">
        <TriState
          value={value.verbalIntervention}
          onChange={(next) => set("verbalIntervention", next)}
          label="Verbal instruction"
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-fg/60">{label}</span>
      {children}
    </label>
  );
}

// Any / Yes / No. "Any" is the off position, so the filter is opt-in.
function TriState({
  value,
  onChange,
  label,
}: {
  value: "" | "true" | "false";
  onChange: (next: "" | "true" | "false") => void;
  label: string;
}) {
  const options = [
    { value: "" as const, text: "Any" },
    { value: "true" as const, text: "Yes" },
    { value: "false" as const, text: "No" },
  ];

  return (
    <div
      className="inline-flex rounded-lg border border-line bg-surface p-0.5"
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          key={option.value || "any"}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition " +
            (value === option.value
              ? "bg-brand text-white"
              : "text-fg/60 hover:bg-raised")
          }
        >
          {option.text}
        </button>
      ))}
    </div>
  );
}
