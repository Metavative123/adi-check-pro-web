import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import type { RecurringFaults } from "@/lib/api";

// "Junctions: Observation", or just "Clearance" where the heading is the item.
function itemName(groupLabel: string, label: string) {
  return groupLabel === label ? label : `${groupLabel}: ${label}`;
}

// Recurring Fault Alert: a DL25 item that keeps showing up on the latest
// tests logged fault by fault. Shown only when something has been flagged,
// so a clean run of tests leaves the dashboard quiet.
export default function RecurringFaultAlerts({ recurring }: { recurring: RecurringFaults }) {
  const { alerts, testsChecked } = recurring;
  if (alerts.length === 0) return null;

  return (
    <section
      aria-label="Recurring fault alerts"
      className="rounded-2xl border border-dial/30 bg-dial/10 p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <ReportProblemOutlinedIcon fontSize="small" className="text-dial" />
        <h2 className="font-semibold text-fg">Recurring fault alert</h2>
      </div>

      <ul className="space-y-2">
        {alerts.map((alert) => (
          <li key={alert.key} className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
            <span className="text-fg">
              <strong>{itemName(alert.groupLabel, alert.label)}</strong> has appeared in{" "}
              {alert.tests} of your last {testsChecked} test{testsChecked === 1 ? "" : "s"}.
            </span>
            <span className="flex shrink-0 gap-1 text-xs font-semibold">
              {alert.driving > 0 && (
                <span className="rounded bg-surface px-1.5 py-0.5 text-fg/70">{alert.driving} driving</span>
              )}
              {alert.serious > 0 && (
                <span className="rounded bg-danger-bg px-1.5 py-0.5 text-danger-fg">{alert.serious} S</span>
              )}
              {alert.dangerous > 0 && (
                <span className="rounded bg-danger px-1.5 py-0.5 text-white">{alert.dangerous} D</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-fg/50">
        Flags any DL25 item on {recurring.minAppearances} or more of your last{" "}
        {recurring.lookbackTests} tests logged fault by fault.
      </p>
    </section>
  );
}
