"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type User } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { AppShellSkeleton } from "@/components/Skeleton";

// While redirecting we simply stay in "checking", which renders nothing but
// the placeholder - so there is no extra state to set on the way out.
type State = { status: "checking" } | { status: "allowed"; user: User };

// The gate on every signed-in route. Nothing inside renders until the token
// has been checked against the server, so a page never flashes its contents
// to someone who is about to be redirected away.
export default function RequireAuth({
  children,
}: {
  children: (user: User, setUser: (user: User) => void) => React.ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "checking" });

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function check(authToken: string) {
      try {
        const { user } = await api.me(authToken);

        if (cancelled) return;

        // Signed in, but the profile still needs a badge number and a centre.
        if (!user.profileComplete) {
          router.replace("/onboarding");
          return;
        }

        setState({ status: "allowed", user });
      } catch {
        // Expired or rejected token - clear it and start again.
        if (cancelled) return;
        clearToken();
        router.replace("/login");
      }
    }

    check(token);
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state.status !== "allowed") {
    return <AppShellSkeleton />;
  }

  const setUser = (user: User) => setState({ status: "allowed", user });

  return <>{children(state.user, setUser)}</>;
}
