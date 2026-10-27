import type { Report, ReportTest } from "@/lib/api";
import { DL25_GROUPS } from "@/lib/dl25";

// The test history as a spreadsheet, built in the browser from the same report
// the PDF uses: the same period, and names left out on the server when the
// instructor hides them.

// "Junctions: Observation", or just "Clearance" where the heading is the item.
const ITEM_NAMES = new Map(
  DL25_GROUPS.flatMap((group) =>
    group.items.map((item) => [
      item.key,
      group.items.length === 1 ? group.label : `${group.label}: ${item.label}`,
    ])
  )
);

// "Junctions: Observation (2, S); Mirrors: Change direction (1)" - in DL25 order.
function dl25Faults(test: ReportTest) {
  if (!test.faultItems) return "";
  return [...ITEM_NAMES.keys()]
    .filter((key) => test.faultItems?.[key])
    .map((key) => {
      const m = test.faultItems![key];
      const marks = [m.driving ? String(m.driving) : "", m.serious ? "S" : "", m.dangerous ? "D" : ""]
        .filter(Boolean)
        .join(", ");
      return `${ITEM_NAMES.get(key)} (${marks})`;
    })
    .join("; ");
}

// Quotes a cell when it needs it. A leading = + - @ is neutralised so a name
// typed as a formula cannot run when the file is opened in Excel.
function cell(value: string | number) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function testsCsv(report: Report) {
  const withNames = !report.namesHidden;

  const header = [
    "Test ID",
    "Date",
    ...(withNames ? ["Pupil"] : []),
    "Test centre",
    "Result",
    "Driving faults",
    "Serious faults",
    "Dangerous faults",
    "Physical intervention",
    "Verbal intervention",
    "Entry",
    "DL25 faults",
  ];

  const rows = report.tests.map((t) => [
    t.reference,
    t.isoDate || t.date,
    ...(withNames ? [t.pupilName || ""] : []),
    t.testCenter,
    t.result === "pass" ? "Pass" : "Fail",
    t.driving,
    t.serious,
    t.dangerous,
    t.physicalIntervention ? "Yes" : "No",
    t.verbalIntervention ? "Yes" : "No",
    t.faultEntry === "detailed" ? "DL25" : "Totals only",
    dl25Faults(t),
  ]);

  return [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
}

export function downloadTestsCsv(report: Report, from: string, to: string) {
  // The byte-order mark makes Excel read the file as UTF-8, so names keep
  // their accents.
  const blob = new Blob(["﻿" + testsCsv(report)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `adi-check-pro-tests_${from}_to_${to}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
