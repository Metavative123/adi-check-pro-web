"use client";

import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import AppShell from "@/components/AppShell";
import LogTestModal from "@/components/LogTestModal";
import RequireAuth from "@/components/RequireAuth";
import TrialBanner from "@/components/TrialBanner";
import { AppProvider } from "@/lib/appContext";
import { api, type Billing, type User } from "@/lib/api";
import { getToken } from "@/lib/auth";

// Everything under this layout is signed-in only, and the drawer lives here
// rather than in each page - so moving between pages never remounts it.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      {(user, setUser) => (
        <Shell user={user} setUser={setUser}>
          {children}
        </Shell>
      )}
    </RequireAuth>
  );
}

function Shell({
  user,
  setUser,
  children,
}: {
  user: User;
  setUser: (user: User) => void;
  children: React.ReactNode;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [billing, setBilling] = useState<Billing | null>(null);
  const refresh = () => setRefreshKey((n) => n + 1);

  // Fetched once for the whole app: the banner and the nav both read it from
  // context rather than asking again.
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    async function load(authToken: string) {
      try {
        const { billing: data } = await api.getBilling(authToken);
        if (!cancelled) setBilling(data);
      } catch {
        // Billing is not worth blocking the app for.
      }
    }

    load(token);
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <AppProvider value={{ user, billing, refreshKey, refresh, setUser }}>
      <AppShell
        user={user}
        showBilling={billing?.enabled ?? false}
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            <AddIcon fontSize="small" />
            <span className="hidden sm:inline">Log a test</span>
          </button>
        }
      >
        <TrialBanner />
        {children}
      </AppShell>

      {modalOpen && (
        <LogTestModal
          onClose={() => setModalOpen(false)}
          user={user}
          onSaved={refresh}
        />
      )}
    </AppProvider>
  );
}
