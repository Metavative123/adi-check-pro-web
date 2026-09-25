"use client";

import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* The icon shows what is on now, so the switch reads at a glance. */}
          {isDark ? (
            <DarkModeOutlinedIcon fontSize="small" className="text-dial" />
          ) : (
            <LightModeOutlinedIcon fontSize="small" className="text-dial" />
          )}
          <div>
            <p className="text-sm font-medium text-fg">Dark mode</p>
            <p className="text-xs text-fg/50">
              {theme === "system"
                ? `Following your device, currently ${resolvedTheme}.`
                : `Always ${isDark ? "dark" : "day"}, on this browser.`}
            </p>
          </div>
        </div>

        {/* A real switch: role and aria-checked, so it is announced as one
            and works from the keyboard. */}
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label="Dark mode"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition " +
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 " +
            (isDark ? "bg-brand" : "bg-fg/20")
          }
        >
          <span
            className={
              "pointer-events-none absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " +
              (isDark ? "translate-x-[22px]" : "translate-x-0.5")
            }
          />
        </button>
      </div>

      {/* Keeps the "follow my device" option without turning the switch into
          a three-way control. */}
      {theme !== "system" && (
        <button
          type="button"
          onClick={() => setTheme("system")}
          className="mt-3 text-xs font-medium text-brand hover:underline"
        >
          Use my device setting instead
        </button>
      )}
    </div>
  );
}
