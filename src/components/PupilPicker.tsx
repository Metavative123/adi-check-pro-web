"use client";

import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { api, type PupilRef } from "@/lib/api";
import { getToken } from "@/lib/auth";

// Searches the whole history, so a pupil with tests from months ago is found
// just as easily as one on the first page of the log.
export default function PupilPicker({
  label,
  selected,
  onSelect,
  onClear,
  excludeName,
}: {
  label: string;
  selected: string | null;
  onSelect: (name: string) => void;
  onClear: () => void;
  // The other side's pupil, so the same person cannot be picked twice.
  excludeName?: string | null;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PupilRef[]>([]);
  const [error, setError] = useState("");
  // Which search term the results on screen belong to. Behind the current one
  // means a request is in flight - derived, so there is no flag to keep in sync.
  const [loadedSearch, setLoadedSearch] = useState<string | null>(null);

  const query = search.trim();
  const loading = loadedSearch !== query;

  useEffect(() => {
    if (selected) return; // nothing to search for once one is chosen

    const token = getToken();
    if (!token) return;

    let cancelled = false;
    // Typing should not fire a request per keystroke.
    const timer = setTimeout(async () => {
      try {
        const { pupils } = await api.listPupils(token, query);
        if (!cancelled) {
          setResults(pupils);
          setError("");
          setLoadedSearch(query);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not search pupils");
          setLoadedSearch(query);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, selected]);

  if (selected) {
    return (
      <div>
        <p className="mb-1.5 text-xs font-medium text-fg/60">{label}</p>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-brand bg-brand-light px-3 py-2.5">
          <span className="truncate text-sm font-semibold text-brand-fg">{selected}</span>
          <button
            onClick={onClear}
            className="shrink-0 text-brand-fg/70 hover:text-brand-fg"
            aria-label={`Clear ${label}`}
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-fg/60">{label}</p>

      <div className="flex items-center gap-2 rounded-lg border border-line px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <SearchIcon fontSize="small" className="text-fg/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by pupil name or test id"
          aria-label={`Search ${label} by name or test id`}
          className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-fg/35"
        />
      </div>

      <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-line">
        {error && <p className="p-3 text-xs text-danger">{error}</p>}

        {!error && results.length === 0 && (
          <p className="p-3 text-xs text-fg/40">
            {loading
              ? "Searching..."
              : search
                ? "No pupil or test id matches that."
                : "No pupils yet."}
          </p>
        )}

        {!error && results.length > 0 && (
          <ul className="divide-y divide-line">
            {results.map((pupil) => {
              const taken = excludeName?.toLowerCase() === pupil.name.toLowerCase();
              return (
                <li key={pupil.name}>
                  <button
                    onClick={() => onSelect(pupil.name)}
                    disabled={taken}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-raised disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{pupil.name}</span>
                      {/* Shown when the search term was a test id, so it is
                          clear which test led to this pupil. */}
                      {pupil.matchedReference && (
                        <span className="mt-0.5 inline-block rounded bg-raised px-1.5 py-0.5 font-mono text-[10px] text-fg/50">
                          {pupil.matchedReference}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-xs text-fg/40">
                      {taken
                        ? "already chosen"
                        : `${pupil.tests} test${pupil.tests === 1 ? "" : "s"}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
