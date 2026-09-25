"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import Avatar from "@/components/Avatar";
import LogTestModal from "@/components/LogTestModal";
import PerformanceCard from "@/components/PerformanceCard";
import ReportModal from "@/components/ReportModal";
import TestTable from "@/components/TestTable";
import { api, type Performance, type Test } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useApp } from "@/lib/appContext";

// Just enough recent history to be useful; the full log lives on /tests.
const RECENT_COUNT = 5;

export default function DashboardPage() {
  const { user, refreshKey, refresh } = useApp();
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [recent, setRecent] = useState<Test[]>([]);
  const [editing, setEditing] = useState<Test | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  // Reloads the rows without re-reading the rating, for edits that cannot
  // have changed it.
  const [listKey, setListKey] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    async function load(authToken: string) {
      const { performance: perf } = await api.getPerformance(authToken);
      if (!cancelled) setPerformance(perf);
    }

    load(token);
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    async function load(authToken: string) {
      const list = await api.listTests(authToken, { page: 1, limit: RECENT_COUNT });
      if (!cancelled) setRecent(list.tests);
    }

    load(token);
    return () => {
      cancelled = true;
    };
  }, [refreshKey, listKey]);

  async function removeTest(testId: string) {
    const token = getToken();
    if (!token) return;
    await api.deleteTest(token, testId);
    refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Who, and the report export */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-fg/60">
              {user.adiBadgeNumber} · {user.testCenters.length} test centre
              {user.testCenters.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setReportOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-fg transition hover:bg-raised"
        >
          <PictureAsPdfOutlinedIcon fontSize="small" />
          Export PDF report
        </button>
      </div>

      {/* Standing right now */}
      {performance && <PerformanceCard performance={performance} />}

      {/* A short tail of history, with the way through to the rest */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-fg">Latest tests</h2>
          <Link
            href="/tests"
            className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            View all <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </Link>
        </div>

        <TestTable
          tests={recent}
          pagination={null}
          loading={false}
          onPageChange={() => {}}
          onDelete={removeTest}
          onEdit={setEditing}
          emptyMessage={"No tests yet. Use “Log a test” to add the first one."}
        />
      </div>

      {reportOpen && <ReportModal onClose={() => setReportOpen(false)} />}

      {editing && (
        <LogTestModal
          test={editing}
          user={user}
          onClose={() => setEditing(null)}
          onSaved={({ affectsRating }) => {
            // Name, date or centre only? The rating cannot have moved, so
            // just refresh the rows.
            if (affectsRating) refresh();
            else setListKey((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}
