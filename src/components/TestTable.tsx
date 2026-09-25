"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PanToolOutlinedIcon from "@mui/icons-material/PanToolOutlined";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import type { Pagination, Test } from "@/lib/api";

// Paginated on the server - this renders the page it is given.
export default function TestTable({
  tests,
  pagination,
  loading,
  onPageChange,
  onDelete,
  onEdit,
  emptyMessage,
}: {
  tests: Test[];
  pagination: Pagination | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onDelete: (testId: string) => void;
  onEdit: (test: Test) => void;
  emptyMessage: string;
}) {
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? from + tests.length - 1 : 0;

  return (
    <section className="rounded-2xl border border-line bg-surface shadow-lg shadow-shade">
      {tests.length === 0 ? (
        <p className="p-10 text-center text-sm text-fg/40">
          {loading ? "Loading..." : emptyMessage}
        </p>
      ) : (
        <ul className={"divide-y divide-line transition-opacity " + (loading ? "opacity-50" : "")}>
          {tests.map((t) => (
            <li key={t._id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2">
                  <span className="truncate font-medium">{t.pupilName}</span>
                  <span className="shrink-0 rounded bg-raised px-1.5 py-0.5 font-mono text-[11px] text-fg/50">
                    {t.reference}
                  </span>
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-fg/50">
                  <span>{new Date(t.testDate).toLocaleDateString("en-GB")}</span>
                  <span>·</span>
                  <span className="truncate">{t.testCenter.name}</span>
                  <span>·</span>
                  <span>
                    {t.faults.driving}D · {t.faults.serious}S · {t.faults.dangerous}X
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {/* Icon plus a label for screen readers - never colour alone. */}
                {t.physicalIntervention && (
                  <span title="Physical intervention" className="text-fg/40">
                    <PanToolOutlinedIcon sx={{ fontSize: 16 }} />
                    <span className="sr-only">Physical intervention</span>
                  </span>
                )}
                {t.verbalIntervention && (
                  <span title="Verbal instruction" className="text-fg/40">
                    <RecordVoiceOverOutlinedIcon sx={{ fontSize: 16 }} />
                    <span className="sr-only">Verbal instruction</span>
                  </span>
                )}
                <span
                  className={
                    "rounded-full px-3 py-1 text-xs font-semibold " +
                    (t.result === "pass"
                      ? "bg-brand-light text-brand-fg"
                      : "bg-danger-bg text-danger-fg")
                  }
                >
                  {t.result === "pass" ? "Pass" : "Fail"}
                </span>
                <button
                  onClick={() => onEdit(t)}
                  className="text-fg/30 hover:text-brand"
                  aria-label={"Edit test " + t.reference}
                >
                  <EditOutlinedIcon fontSize="small" />
                </button>
                <button
                  onClick={() => onDelete(t._id)}
                  className="text-fg/30 hover:text-danger"
                  aria-label={"Delete test " + t.reference}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pagination && pagination.total > 0 && (
        <nav
          className="flex items-center justify-between border-t border-line px-4 py-3"
          aria-label="Pages"
        >
          <p className="text-xs text-fg/50">
            {from}-{to} of {pagination.total}
          </p>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-3">
              <PageButton
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                <ChevronLeftIcon fontSize="small" />
                <span className="hidden sm:inline">Previous</span>
              </PageButton>
              <span className="text-xs text-fg/50">
                {pagination.page} / {pagination.totalPages}
              </span>
              <PageButton
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasMore || loading}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRightIcon fontSize="small" />
              </PageButton>
            </div>
          )}
        </nav>
      )}
    </section>
  );
}

function PageButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-fg transition hover:bg-raised disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
