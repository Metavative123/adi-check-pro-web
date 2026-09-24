"use client";

import { createContext, useContext } from "react";
import type { Billing, User } from "@/lib/api";

type AppContextValue = {
  user: User;
  // null until loaded. `enabled: false` means billing is switched off.
  billing: Billing | null;
  // Pages put this in their effect dependencies; bumping it reloads their data.
  refreshKey: number;
  refresh: () => void;
  setUser: (user: User) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = AppContext.Provider;

// The signed-in user, loaded once by the app layout. Pages read it from here
// instead of fetching it again on every navigation.
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside the app layout");
  return value;
}
