"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SpeedIcon from "@mui/icons-material/Speed";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Avatar from "@/components/Avatar";
import { clearToken } from "@/lib/auth";
import type { User } from "@/lib/api";

const NAV = [
  { href: "/dashboard", label: "Overview", Icon: DashboardOutlinedIcon },
  { href: "/tests", label: "Tests", Icon: ListAltOutlinedIcon },
  { href: "/trends", label: "Trends", Icon: ShowChartOutlinedIcon },
  { href: "/profile", label: "Profile", Icon: PersonOutlinedIcon },
  { href: "/billing", label: "Billing", Icon: CreditCardOutlinedIcon },
];

// Permanent drawer on desktop, slide-over on mobile.
export default function AppShell({
  user,
  action,
  showBilling = false,
  children,
}: {
  user: User;
  action?: React.ReactNode;
  // Billing is hidden entirely while it is switched off on the server.
  showBilling?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // The title comes from the route, so pages do not pass it down and the
  // shell does not re-render when they change.
  const nav = showBilling ? NAV : NAV.filter((item) => item.href !== "/billing");
  const title = NAV.find((item) => item.href === pathname)?.label ?? "ADI Check Pro";
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Navigating closes the mobile drawer. Done on the click rather than in an
  // effect watching the path, so there is no extra render after each route change.
  const closeDrawer = () => setDrawerOpen(false);

  function signOut() {
    clearToken();
    router.replace("/login");
  }

  const drawer = (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex items-center justify-between px-5 py-4">
        <Link href="/dashboard" onClick={closeDrawer} className="flex items-center gap-2">
          <SpeedIcon className="text-dial" />
          <span className="font-semibold">ADI Check Pro</span>
        </Link>
        <button
          onClick={closeDrawer}
          className="text-white/60 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={closeDrawer}
              aria-current={active ? "page" : undefined}
              className={
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition " +
                (active
                  ? "bg-white/10 font-medium text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white")
              }
            >
              <Icon fontSize="small" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/profile"
          onClick={closeDrawer}
          className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
        >
          <Avatar name={user.name} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm">{user.name}</span>
            <span className="block truncate text-xs text-white/40">
              {user.adiBadgeNumber}
            </span>
          </span>
        </Link>
        <button
          onClick={signOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          <LogoutIcon fontSize="small" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      {/* Permanent drawer, desktop only */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 lg:block">{drawer}</aside>

      {/* Slide-over drawer, mobile only */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={closeDrawer}
          />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl">{drawer}</div>
        </div>
      )}

      <div className="lg:pl-60">
        {/* Top bar: the menu button lives here on mobile */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur sm:px-6">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-fg/60 hover:text-fg lg:hidden"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <h1 className="flex-1 truncate font-semibold text-fg">{title}</h1>
          {action}
        </header>

        <div className="px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
