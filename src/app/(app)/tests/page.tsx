"use client";

import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import CloseIcon from "@mui/icons-material/Close";
import ComparePupilsModal from "@/components/ComparePupilsModal";
import LogTestModal from "@/components/LogTestModal";
import TestTable from "@/components/TestTable";
import TestFilters, { EMPTY_FILTERS, type Filters } from "@/components/TestFilters";
import { api, type Pagination, type Test } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useApp } from "@/lib/appContext";

const PAGE_SIZE = 15;

export default function TestsPage() {
  const { user, refreshKey, refresh } = useApp();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Test | null>(null);
  const [comparing, setComparing] = useState(false);
  // Reloads the rows without re-reading the rating, for edits that cannot
  // have changed it.
  const [listKey, setListKey] = useState(0);
  const [tests, setTests] = useState<Test[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loadedKey, setLoadedKey] = useState("");

  // What the visible rows correspond to. Behind the current request means a
  // fetch is in flight - derived, so there is no loading flag to keep in sync.
  const requestKey = JSON.stringify({ ...filters, page, refreshKey, listKey });
  const loading = loadedKey !== requestKey;

  // Typing should not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) =>
        current.search === searchInput ? current : { ...current, search: searchInput }
      );
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;
    const key = requestKey;

    async function fetchPage(authToken: string) {
      const data = await api.listTests(authToken, { page, limit: PAGE_SIZE, ...filters });
      if (cancelled) return;
      setTests(data.tests);
      setPagination(data.pagination);
      setLoadedKey(key);
    }

    fetchPage(token);
    return () => {
      cancelled = true;
    };
  }, [requestKey, page, filters]);

  async function removeTest(testId: string) {
    const token = getToken();
    if (!token) return;

    await api.deleteTest(token, testId);
    if (tests.length === 1 && page > 1) setPage(page - 1);
    refresh();
  }

  function updateFilters(next: Filters) {
    setFilters(next);
    setPage(1); // a new filter means a new result set
  }

  function clearAll() {
    setSearchInput("");
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  const activeCount =
    (filters.from ? 1 : 0) +
    (filters.to ? 1 : 0) +
    (filters.physicalIntervention ? 1 : 0) +
    (filters.verbalIntervention ? 1 : 0);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* Search and filters sit in one row above the results. */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-lg shadow-shade">
        <div className="flex items-center gap-2 rounded-lg border border-line px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
          <SearchIcon fontSize="small" className="text-fg/40" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search pupil name or test id (e.g. T-9F3A21)"
            className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-fg/35"
            aria-label="Search by pupil name or test id"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="text-fg/40 hover:text-fg"
              aria-label="Clear search"
            >
              <CloseIcon fontSize="small" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <TestFilters value={filters} onChange={updateFilters} />

          <button
            onClick={() => setComparing(true)}
            className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-medium text-fg transition hover:bg-raised"
          >
            <CompareArrowsIcon fontSize="small" />
            Compare pupils
          </button>
        </div>

        {(searchInput || activeCount > 0) && (
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <p className="text-xs text-fg/50">
              {loading
                ? "Searching..."
                : `${pagination?.total ?? 0} test${pagination?.total === 1 ? "" : "s"} match`}
            </p>
            <button
              onClick={clearAll}
              className="text-xs font-medium text-brand hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <TestTable
        tests={tests}
        pagination={pagination}
        loading={loading}
        onPageChange={setPage}
        onDelete={removeTest}
        onEdit={setEditing}
        emptyMessage={
          searchInput || activeCount > 0
            ? "No tests match these filters."
            : "No tests yet. Use “Log a test” to add the first one."
        }
      />

      {comparing && <ComparePupilsModal onClose={() => setComparing(false)} />}

      {editing && (
        <LogTestModal
          test={editing}
          user={user}
          onClose={() => setEditing(null)}
          onSaved={({ affectsRating }) => {
            // The rows always need re-reading; the rating only when a scoring
            // field actually changed.
            setListKey((n) => n + 1);
            if (affectsRating) refresh();
          }}
        />
      )}
    </div>
  );
}
