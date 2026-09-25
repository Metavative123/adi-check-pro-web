// Renders the standards report as a PDF.
//
// Every figure and every rule comes from the API, so the document always
// agrees with the dashboard. jsPDF is browser-only, so this module is imported
// dynamically from the click handler rather than at the top of a page.
import type { Report } from "@/lib/api";

// Brand colours, as RGB for jsPDF.
const INK: [number, number, number] = [11, 27, 43];
const BRAND: [number, number, number] = [0, 112, 60];
const DIAL: [number, number, number] = [245, 166, 35];
const RED: [number, number, number] = [208, 59, 59];
const MUTED: [number, number, number] = [110, 115, 120];
const LINE: [number, number, number] = [225, 224, 217];

const BAND_COLOUR: Record<Report["band"], [number, number, number]> = {
  green: BRAND,
  amber: DIAL,
  red: RED,
};

const MARGIN = 14;

function formatValue(value: number, decimals: number, unit: string) {
  return `${value.toFixed(decimals)}${unit}`;
}

export async function downloadStandardsReport(report: Report) {
  // Loaded here so jsPDF never runs during server rendering.
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN * 2;

  // ---------- Masthead ----------
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Standards Report", MARGIN, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 205, 210);
  doc.text("ADI Check Pro - Driver and Vehicle Standards", MARGIN, 21);
  doc.text(report.period.label, pageWidth - MARGIN, 14, { align: "right" });
  doc.text(
    `Generated ${new Date(report.generatedAt).toLocaleString("en-GB")}`,
    pageWidth - MARGIN,
    21,
    { align: "right" }
  );

  let y = 40;

  // ---------- Who this is about ----------
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Instructor", MARGIN, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);

  const details = [
    `Name: ${report.instructor.name}`,
    `ADI badge number: ${report.instructor.adiBadgeNumber}`,
    `Test centres: ${report.instructor.testCenters.join(", ") || "None recorded"}`,
    `Reporting period: ${report.period.label}`,
  ];
  for (const line of details) {
    const wrapped = doc.splitTextToSize(line, contentWidth) as string[];
    doc.text(wrapped, MARGIN, y);
    y += wrapped.length * 4.2;
  }

  if (report.namesHidden) {
    y += 2;
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "italic");
    doc.text("Pupil names have been withheld from this report.", MARGIN, y);
    y += 5;
  }

  y += 4;

  // ---------- Headline ----------
  const boxHeight = 24;
  doc.setDrawColor(...LINE);
  doc.setFillColor(250, 250, 248);
  doc.roundedRect(MARGIN, y, contentWidth, boxHeight, 2, 2, "FD");

  const cellWidth = contentWidth / 4;
  const headline: [string, string][] = [
    ["Overall score", `${report.score.total} / 100`],
    ["Rating", report.hasEnoughData ? report.band.toUpperCase() : "Not rated"],
    ["Tests in period", String(report.totals.tests)],
    ["Triggers", `${report.triggers.length} of 4`],
  ];

  headline.forEach(([label, value], index) => {
    const x = MARGIN + cellWidth * index + 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(label, x, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...(label === "Rating" && report.hasEnoughData ? BAND_COLOUR[report.band] : INK));
    doc.text(value, x, y + 17);
  });

  y += boxHeight + 4;

  if (!report.hasEnoughData) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const note = doc.splitTextToSize(
      `A colour rating needs at least ${report.rules.minTests} tests. This period has ${report.totals.tests}, so the score is shown but no rating is given.`,
      contentWidth
    ) as string[];
    doc.text(note, MARGIN, y);
    y += note.length * 4 + 2;
  }

  // ---------- Section 1: how each figure was worked out ----------
  y = sectionHeading(doc, "1. Measurements and how they were calculated", y);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Measurement", "Calculation", "Result", "Trigger rule", "Status"]],
    body: report.workings.map((w) => [
      w.label,
      w.formula,
      report.totals.tests ? formatValue(w.value, w.decimals, w.unit) : "-",
      w.triggerRule,
      w.triggered ? "TRIGGERED" : "Within limit",
    ]),
    styles: { fontSize: 8, cellPadding: 2, lineColor: LINE, lineWidth: 0.1 },
    headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 36, fontStyle: "bold" },
      2: { cellWidth: 18, halign: "right" },
      4: { cellWidth: 24, halign: "center" },
    },
    didParseCell: (data) => {
      // Mark the triggering rows in red, with the word as well as the colour.
      if (data.section === "body" && data.column.index === 4) {
        const triggered = String(data.cell.raw) === "TRIGGERED";
        data.cell.styles.textColor = triggered ? RED : BRAND;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ---------- Section 2: how the score was derived ----------
  y = sectionHeading(doc, "2. How the overall score was derived", y);

  y = paragraph(
    doc,
    `Each of the four measurements is worth ${report.score.pointsPerMetric} points, giving a score out of 100. ` +
      `A measurement sitting exactly on its trigger scores half marks, which puts the trigger line at 50: ` +
      `above 50 the measurements have headroom, below it they are past their thresholds. ` +
      `Pass rate scores full marks at ${report.rules.passRateTarget}% and falls to half marks at its ${report.rules.thresholds.passRate}% trigger.`,
    y,
    contentWidth
  );

  if (report.score.rows.length) {
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Measurement", "Result", "Trigger", "Working", "Points"]],
      body: report.score.rows.map((row) => [
        row.label,
        `${row.value}${row.unit}`,
        `${row.threshold}${row.unit}`,
        row.working,
        `${row.points.toFixed(1)} / ${row.maxPoints}`,
      ]),
      foot: [["Overall score", "", "", "Sum of the four rows, rounded", `${report.score.total} / 100`]],
      styles: { fontSize: 7.5, cellPadding: 2, lineColor: LINE, lineWidth: 0.1 },
      headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: [240, 244, 241], textColor: INK, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 32, fontStyle: "bold" },
        1: { cellWidth: 16, halign: "right" },
        2: { cellWidth: 16, halign: "right" },
        4: { cellWidth: 22, halign: "right" },
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ---------- Section 3: the rules ----------
  y = sectionHeading(doc, "3. Rules applied", y);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Rule", "Detail"]],
    body: [
      ...report.rules.metrics.map((m) => [`${m.label} threshold`, m.rule]),
      [
        "Rating colour",
        `Green: no triggers. Amber: ${report.rules.amberTriggers} or ${report.rules.redTriggers - 1} triggers. ` +
          `Red: ${report.rules.redTriggers} or more triggers.`,
      ],
      [
        "Minimum tests",
        `A colour rating is only shown once there are at least ${report.rules.minTests} tests. Below that the score is still calculated.`,
      ],
      [
        "Standard window",
        `The app rates a rolling ${report.rules.windowMonths} months. ${report.windowNote}`,
      ],
      [
        "Pass rate scoring target",
        `${report.rules.passRateTarget}% or above scores full marks for that measurement.`,
      ],
    ],
    styles: { fontSize: 8, cellPadding: 2, lineColor: LINE, lineWidth: 0.1 },
    headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 44, fontStyle: "bold" } },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ---------- Section 4: totals ----------
  y = sectionHeading(doc, "4. Totals for the period", y);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    body: [
      ["Tests taken", String(report.totals.tests), "Driving faults", String(report.totals.driving)],
      ["Passed", String(report.totals.passed), "Serious faults", String(report.totals.serious)],
      ["Failed", String(report.totals.failed), "Dangerous faults", String(report.totals.dangerous)],
      [
        "Physical interventions",
        String(report.totals.interventions),
        "Verbal instructions",
        String(report.totals.verbalInstructions),
      ],
    ],
    styles: { fontSize: 8, cellPadding: 2, lineColor: LINE, lineWidth: 0.1 },
    // 44+16+44+16 = 120mm, comfortably inside the 182mm available.
    tableWidth: 120,
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 44 },
      1: { halign: "right", cellWidth: 16 },
      2: { fontStyle: "bold", cellWidth: 44 },
      3: { halign: "right", cellWidth: 16 },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ---------- Section 5: the tests themselves ----------
  doc.addPage();
  y = MARGIN + 4;
  y = sectionHeading(doc, "5. Tests in this period", y);

  if (report.tests.length === 0) {
    paragraph(doc, "No tests were recorded in this period.", y, contentWidth);
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      // Faults are one column ("driving / serious / dangerous") so the table
      // fits the page width. Ten separate columns overflowed A4.
      head: [["Test ID", "Date", "Pupil", "Centre", "Result", "Faults D/S/X", "PI", "VI"]],
      body: report.tests.map((t) => [
        t.reference,
        t.date,
        t.pupilName ?? "Withheld",
        t.testCenter,
        t.result === "pass" ? "Pass" : "Fail",
        `${t.driving} / ${t.serious} / ${t.dangerous}`,
        t.physicalIntervention ? "Yes" : "-",
        t.verbalIntervention ? "Yes" : "-",
      ]),
      styles: { fontSize: 7.5, cellPadding: 1.8, lineColor: LINE, lineWidth: 0.1 },
      headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
      // 20+20+40+26+14+24+11+11 = 166mm, with slack inside the 182mm available.
      tableWidth: 166,
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 40 },
        3: { cellWidth: 26 },
        4: { cellWidth: 14, halign: "center", fontStyle: "bold" },
        5: { cellWidth: 24, halign: "center" },
        6: { cellWidth: 11, halign: "center" },
        7: { cellWidth: 11, halign: "center" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 4) {
          data.cell.styles.textColor = String(data.cell.raw) === "Pass" ? BRAND : RED;
        }
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const endY = (doc as any).lastAutoTable.finalY + 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(
      "Faults are shown as driving / serious / dangerous. PI = physical intervention, VI = verbal instruction.",
      MARGIN,
      endY
    );
  }

  // ---------- Footer on every page ----------
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...LINE);
    doc.line(MARGIN, pageHeight - 12, pageWidth - MARGIN, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(
      "Produced by ADI Check Pro from the instructor's own records. Not an official DVSA document.",
      MARGIN,
      pageHeight - 8
    );
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - MARGIN, pageHeight - 8, {
      align: "right",
    });
  }

  const names = report.namesHidden ? "anonymised" : "full";
  doc.save(`adi-standards-report-${report.period.from}-to-${report.period.to}-${names}.pdf`);
}

// A section heading, starting a new page if it would otherwise be orphaned.
function sectionHeading(
  doc: import("jspdf").jsPDF,
  title: string,
  y: number
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  let top = y;

  if (top > pageHeight - 45) {
    doc.addPage();
    top = MARGIN + 4;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(title, MARGIN, top);

  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, top + 1.5, MARGIN + 28, top + 1.5);
  doc.setLineWidth(0.2);

  return top + 7;
}

function paragraph(
  doc: import("jspdf").jsPDF,
  text: string,
  y: number,
  width: number
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const lines = doc.splitTextToSize(text, width) as string[];
  doc.text(lines, MARGIN, y);
  return y + lines.length * 3.8 + 4;
}
