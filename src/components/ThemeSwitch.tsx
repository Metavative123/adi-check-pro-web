"use client";

import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useTheme } from "@/lib/theme";

// A one-tap light/dark switch for headers. The full control, with "use my
// device setting", is on the Profile page.
export default function ThemeSwitch({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-lg transition " +
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 " +
        className
      }
    >
      {/* Shows what you will switch to. */}
      {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
    </button>
  );
}
