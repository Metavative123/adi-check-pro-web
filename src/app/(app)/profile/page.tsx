"use client";

import { useState } from "react";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Avatar from "@/components/Avatar";
import ThemeToggle from "@/components/ThemeToggle";
import { api, type TestCenter } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useApp } from "@/lib/appContext";

// No width here on purpose - each use sets its own. Appending "w-24" to a
// string containing "w-full" does not override it: Tailwind picks the winner
// by stylesheet order, not by position in the className string.
const inputClass =
  "rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

// min-w-0 lets the name field shrink instead of pushing the button out of the card.
const nameInputClass = inputClass + " min-w-[9rem] flex-1";
const codeInputClass = inputClass + " w-20 shrink-0";

export default function ProfilePage() {
  const { user, setUser } = useApp();
  const [badge, setBadge] = useState<string | null>(null); // null = not editing
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [error, setError] = useState("");

  // Every call follows the same shape: run it, keep the returned user, show errors.
  async function run(action: (token: string) => Promise<{ user: typeof user }>) {
    const token = getToken();
    if (!token) return;

    setError("");
    try {
      const { user: updated } = await action(token);
      setUser(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    }
  }

  async function saveBadge() {
    const ok = await run((t) => api.updateProfile(t, { adiBadgeNumber: badge || "" }));
    if (ok) setBadge(null);
  }

  async function addCenter() {
    if (!newName.trim()) {
      setError("Enter a test centre name");
      return;
    }
    const ok = await run((t) =>
      api.addTestCenter(t, { name: newName, code: newCode || undefined })
    );
    if (ok) {
      setNewName("");
      setNewCode("");
    }
  }

  function startEdit(center: TestCenter) {
    setEditingId(center._id);
    setEditName(center.name);
    setEditCode(center.code || "");
    setError("");
  }

  async function saveEdit(centerId: string) {
    const ok = await run((t) =>
      api.updateTestCenter(t, centerId, { name: editName, code: editCode })
    );
    if (ok) setEditingId(null);
  }

  async function removeCenter(centerId: string) {
    await run((t) => api.removeTestCenter(t, centerId));
  }

  return (
    <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div>
            <h1 className="text-xl font-semibold">{user.name}</h1>
            <p className="text-sm text-fg/60">{user.email}</p>
          </div>
        </div>

        {/* Badge number */}
        <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
          <div className="mb-4 flex items-center gap-2">
            <BadgeOutlinedIcon className="text-brand" fontSize="small" />
            <h2 className="font-semibold">ADI badge number</h2>
          </div>

          {badge === null ? (
            <div className="flex items-center justify-between">
              <p className="font-medium">{user.adiBadgeNumber || "Not set"}</p>
              <button
                onClick={() => setBadge(user.adiBadgeNumber || "")}
                className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
              >
                <EditIcon sx={{ fontSize: 16 }} /> Change
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <input
                autoFocus
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveBadge()}
                placeholder="ADI-123456"
                className={inputClass + " min-w-0 flex-1"}
              />
              <button
                onClick={saveBadge}
                className="shrink-0 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Save
              </button>
              <button
                onClick={() => setBadge(null)}
                className="shrink-0 rounded-lg border border-line px-3 text-fg/60 hover:bg-raised"
                aria-label="Cancel"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
          )}
        </section>

        {/* Test centres */}
        <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
          <div className="mb-4 flex items-center gap-2">
            <PlaceOutlinedIcon className="text-brand" fontSize="small" />
            <h2 className="font-semibold">Test centres</h2>
            <span className="text-xs text-fg/50">{user.testCenters.length} saved</span>
          </div>

          <ul className="space-y-2">
            {user.testCenters.map((c) => (
              <li key={c._id} className="rounded-lg bg-raised px-3 py-2">
                {editingId === c._id ? (
                  <div className="flex flex-wrap gap-2">
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(c._id)}
                      className={nameInputClass}
                    />
                    <input
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(c._id)}
                      placeholder="Code"
                      className={codeInputClass}
                    />
                    <button
                      onClick={() => saveEdit(c._id)}
                      className="shrink-0 rounded-lg bg-brand px-3 text-white hover:bg-brand-dark"
                      aria-label="Save centre"
                    >
                      <CheckIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="shrink-0 rounded-lg border border-line px-3 text-fg/60 hover:bg-surface"
                      aria-label="Cancel"
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {c.name}
                      {c.code && <span className="ml-2 text-fg/40">{c.code}</span>}
                    </span>
                    <span className="flex gap-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="text-fg/40 hover:text-brand"
                        aria-label={"Edit " + c.name}
                      >
                        <EditIcon fontSize="small" />
                      </button>
                      <button
                        onClick={() => removeCenter(c._id)}
                        className="text-fg/40 hover:text-danger"
                        aria-label={"Delete " + c.name}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </button>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCenter()}
              placeholder="Add a centre"
              className={nameInputClass}
            />
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCenter()}
              placeholder="Code"
              className={codeInputClass}
            />
            <button
              onClick={addCenter}
              className="shrink-0 rounded-lg border border-brand px-3 text-brand hover:bg-brand-light"
              aria-label="Add centre"
            >
              <AddIcon fontSize="small" />
            </button>
          </div>
        </section>

      {/* Appearance */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
        <div className="mb-4 flex items-center gap-2">
          <PaletteOutlinedIcon className="text-brand" fontSize="small" />
          <h2 className="font-semibold">Appearance</h2>
        </div>
        <ThemeToggle />
      </section>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
    </div>
  );
}
