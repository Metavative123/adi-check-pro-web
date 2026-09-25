"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import SpeedIcon from "@mui/icons-material/Speed";
import Button from "@/components/Button";
import { api, type User } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";

// Runs once, straight after sign up: badge number + at least one test centre.
export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [badge, setBadge] = useState("");
  const [centerName, setCenterName] = useState("");
  const [centerCode, setCenterCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    api
      .me(token)
      .then(({ user: loaded }) => {
        // Already set up - no reason to be here.
        if (loaded.profileComplete) {
          router.replace("/dashboard");
          return;
        }
        setUser(loaded);
        setBadge(loaded.adiBadgeNumber || "");
      })
      .catch(() => {
        clearToken();
        router.replace("/login");
      });
  }, [router]);

  async function saveBadge() {
    const token = getToken();
    if (!token || !badge.trim()) {
      setError("Enter your ADI badge number");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const { user: updated } = await api.updateProfile(token, { adiBadgeNumber: badge });
      setUser(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the badge number");
    }
    setSaving(false);
  }

  async function addCenter() {
    const token = getToken();
    if (!token || !centerName.trim()) {
      setError("Enter a test centre name");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const { user: updated } = await api.addTestCenter(token, {
        name: centerName,
        code: centerCode || undefined,
      });
      setUser(updated);
      setCenterName("");
      setCenterCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the centre");
    }
    setSaving(false);
  }

  async function removeCenter(centerId: string) {
    const token = getToken();
    if (!token) return;

    try {
      const { user: updated } = await api.removeTestCenter(token, centerId);
      setUser(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove the centre");
    }
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-fg/60">
        Loading...
      </main>
    );
  }

  const badgeSaved = Boolean(user.adiBadgeNumber);
  const ready = badgeSaved && user.testCenters.length > 0;

  return (
    <main className="min-h-screen bg-canvas">
      <header className="flex items-center gap-2 bg-ink px-6 py-4 text-white">
        <SpeedIcon className="text-dial" />
        <span className="font-semibold">ADI Check Pro</span>
      </header>

      <div className="mx-auto max-w-lg px-6 py-10">
        <h1 className="text-2xl font-semibold">Finish setting up</h1>
        <p className="mt-2 text-sm text-fg/60">
          Two things before you can start logging tests, {user.name}.
        </p>

        {/* Step 1 - badge number */}
        <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
          <div className="mb-4 flex items-center gap-2">
            <BadgeOutlinedIcon className="text-brand" fontSize="small" />
            <h2 className="font-semibold">ADI badge number</h2>
            {badgeSaved && <span className="text-xs text-brand">Saved</span>}
          </div>

          <div className="flex gap-2">
            <input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="ADI-123456"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button
              onClick={saveBadge}
              disabled={saving}
              className="shrink-0 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </section>

        {/* Step 2 - test centres */}
        <section className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
          <div className="mb-4 flex items-center gap-2">
            <PlaceOutlinedIcon className="text-brand" fontSize="small" />
            <h2 className="font-semibold">Test centres</h2>
            <span className="text-xs text-fg/50">add as many as you need</span>
          </div>

          {user.testCenters.length > 0 && (
            <ul className="mb-4 space-y-2">
              {user.testCenters.map((c) => (
                <li
                  key={c._id}
                  className="flex items-center justify-between rounded-lg bg-raised px-3 py-2 text-sm"
                >
                  <span>
                    {c.name}
                    {c.code && <span className="ml-2 text-fg/40">{c.code}</span>}
                  </span>
                  <button
                    onClick={() => removeCenter(c._id)}
                    className="text-fg/40 hover:text-danger"
                    aria-label={"Remove " + c.name}
                  >
                    <DeleteOutlinedIcon fontSize="small" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <input
              value={centerName}
              onChange={(e) => setCenterName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCenter()}
              placeholder="Centre name"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <input
              value={centerCode}
              onChange={(e) => setCenterCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCenter()}
              placeholder="Code"
              className="w-24 shrink-0 rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button
              onClick={addCenter}
              disabled={saving}
              className="shrink-0 rounded-lg border border-brand px-3 text-brand hover:bg-brand-light disabled:opacity-60"
              aria-label="Add centre"
            >
              <AddIcon fontSize="small" />
            </button>
          </div>
        </section>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <div className="mt-8">
          <Button onClick={() => router.push("/dashboard")} disabled={!ready}>
            {ready ? "Go to dashboard" : "Add a badge number and one centre"}
          </Button>
        </div>
      </div>
    </main>
  );
}
