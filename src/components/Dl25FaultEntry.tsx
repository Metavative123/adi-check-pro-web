"use client";

import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  DL25_GROUPS,
  MAX_DRIVING_PER_ITEM,
  NO_MARKS,
  type Dl25Item,
  type FaultItems,
  type FaultMarks,
} from "@/lib/dl25";

// Faults logged item by item, laid out like the DL25: one heading per section
// of the form, folded shut until tapped, each item taking a tally of driving
// faults and a serious (S) and dangerous (D) mark.
export default function Dl25FaultEntry({
  items,
  onChange,
}: {
  items: FaultItems;
  onChange: (items: FaultItems) => void;
}) {
  // Headings with something marked start open, so an edit shows its faults.
  const [open, setOpen] = useState<Set<string>>(
    () =>
      new Set(
        DL25_GROUPS.filter((g) => g.items.some((i) => hasMarks(items[i.key]))).map((g) => g.key)
      )
  );

  function toggle(groupKey: string) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }

  function setMarks(key: string, marks: FaultMarks) {
    onChange({ ...items, [key]: marks });
  }

  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
      {DL25_GROUPS.map((group) => {
        const expanded = open.has(group.key);
        const sum = group.items.reduce(
          (total, item) => {
            const m = items[item.key] ?? NO_MARKS;
            return {
              driving: total.driving + m.driving,
              serious: total.serious + m.serious,
              dangerous: total.dangerous + m.dangerous,
            };
          },
          { ...NO_MARKS }
        );

        return (
          <section key={group.key}>
            <button
              type="button"
              onClick={() => toggle(group.key)}
              aria-expanded={expanded}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-raised"
            >
              <span className="flex-1 text-sm font-medium text-fg">{group.label}</span>
              <GroupSummary sum={sum} />
              <ExpandMoreIcon
                fontSize="small"
                className={"text-fg/40 transition " + (expanded ? "rotate-180" : "")}
              />
            </button>

            {expanded && (
              <ul className="space-y-1 bg-raised/40 px-3 pb-3 pt-1">
                {group.items.map((item) => (
                  <ItemRow
                    key={item.key}
                    item={item}
                    // A single-item heading repeats its own name, so say so once.
                    label={group.items.length === 1 ? "Faults" : item.label}
                    marks={items[item.key] ?? NO_MARKS}
                    onChange={(marks) => setMarks(item.key, marks)}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function hasMarks(m?: FaultMarks) {
  return Boolean(m && m.driving + m.serious + m.dangerous > 0);
}

// "3 · S · D" beside a heading, so marked sections stand out when folded.
function GroupSummary({ sum }: { sum: FaultMarks }) {
  if (!hasMarks(sum)) return null;
  return (
    <span className="flex items-center gap-1 text-xs font-semibold">
      {sum.driving > 0 && (
        <span className="rounded bg-dial/15 px-1.5 py-0.5 text-fg">{sum.driving}</span>
      )}
      {sum.serious > 0 && (
        <span className="rounded bg-danger-bg px-1.5 py-0.5 text-danger-fg">
          {sum.serious > 1 ? `${sum.serious}S` : "S"}
        </span>
      )}
      {sum.dangerous > 0 && (
        <span className="rounded bg-danger px-1.5 py-0.5 text-white">
          {sum.dangerous > 1 ? `${sum.dangerous}D` : "D"}
        </span>
      )}
    </span>
  );
}

function ItemRow({
  item,
  label,
  marks,
  onChange,
}: {
  item: Dl25Item;
  label: string;
  marks: FaultMarks;
  onChange: (marks: FaultMarks) => void;
}) {
  const set = (change: Partial<FaultMarks>) => onChange({ ...marks, ...change });

  return (
    <li className="flex items-center gap-2 py-1">
      <span className="min-w-0 flex-1 text-sm text-fg/80">{label}</span>

      {item.drivingFaults && (
        <div className="flex items-center gap-1" aria-label={`${item.label} driving faults`}>
          <TallyButton
            label={`Remove a driving fault: ${item.label}`}
            disabled={marks.driving === 0}
            onClick={() => set({ driving: marks.driving - 1 })}
          >
            -
          </TallyButton>
          <span className="w-6 text-center text-sm font-semibold tabular-nums">{marks.driving}</span>
          <TallyButton
            label={`Add a driving fault: ${item.label}`}
            disabled={marks.driving >= MAX_DRIVING_PER_ITEM}
            onClick={() => set({ driving: marks.driving + 1 })}
          >
            +
          </TallyButton>
        </div>
      )}

      <div className="flex gap-1">
        <MarkButton
          letter="S"
          label={`Serious fault: ${item.label}`}
          on={marks.serious > 0}
          onClick={() => set({ serious: marks.serious ? 0 : 1 })}
        />
        {item.dangerous ? (
          <MarkButton
            letter="D"
            label={`Dangerous fault: ${item.label}`}
            on={marks.dangerous > 0}
            onClick={() => set({ dangerous: marks.dangerous ? 0 : 1 })}
          />
        ) : (
          // Keeps the S buttons lined up when an item has no D, as on the form.
          <span className="h-8 w-8" aria-hidden />
        )}
      </div>
    </li>
  );
}

function TallyButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="h-8 w-8 rounded-lg border border-line bg-surface text-base leading-none text-fg hover:bg-raised disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// The circled S and D on the form.
function MarkButton({
  letter,
  label,
  on,
  onClick,
}: {
  letter: "S" | "D";
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  const active = letter === "S" ? "border-danger bg-danger-bg text-danger-fg" : "border-danger bg-danger text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      className={
        "h-8 w-8 rounded-full border text-xs font-bold transition " +
        (on ? active : "border-line bg-surface text-fg/50 hover:bg-raised")
      }
    >
      {letter}
    </button>
  );
}
