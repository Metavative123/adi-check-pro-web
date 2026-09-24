"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

// The other half of route protection: someone who is already signed in has no
// business on the sign-in or sign-up pages, so send them to the dashboard.
// The app layout does the real check against the server; this only keeps a
// signed-in user from landing back on the login form.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) router.replace("/dashboard");
  }, [router]);

  return <>{children}</>;
}
