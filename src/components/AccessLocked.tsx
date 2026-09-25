"use client";

import { useRouter } from "next/navigation";
import BlockIcon from "@mui/icons-material/Block";
import SpeedIcon from "@mui/icons-material/Speed";
import { clearToken } from "@/lib/auth";
import type { Access } from "@/lib/api";

// Shown instead of the app when access has been revoked - a refund or a
// dispute. Nothing of the instructor's data is rendered here, because a
// revoked account may not view it.
export default function AccessLocked({ access }: { access: Access }) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-canvas">
      <header className="flex items-center gap-2 bg-ink px-6 py-4 text-white">
        <SpeedIcon className="text-dial" />
        <span className="font-semibold">ADI Check Pro</span>
      </header>

      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-2xl border border-danger-line bg-surface p-6 shadow-lg shadow-shade">
          <div className="flex items-start gap-3">
            <BlockIcon className="mt-0.5 text-danger" />
            <div>
              <h1 className="font-semibold">Account locked</h1>
              <p className="mt-1 text-sm text-fg/70">{access.message}</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-fg/60">
            Your records have not been deleted. If you think this is a mistake,
            contact support and we can look into it.
          </p>

          <button
            onClick={() => {
              clearToken();
              router.replace("/login");
            }}
            className="mt-6 w-full rounded-lg border border-line py-2.5 text-sm font-medium text-fg transition hover:bg-raised"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
