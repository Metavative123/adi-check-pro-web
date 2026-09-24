"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AuthLayout from "@/components/AuthLayout";
import Field from "@/components/Field";
import Button from "@/components/Button";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, token } = await api.login(email, password);
      saveToken(token);
      // First time in? Finish the profile before the dashboard.
      router.push(user.profileComplete ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Use your ADI Check Pro account to continue.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<EmailOutlinedIcon fontSize="small" />}
        />

        <Field
          label="Password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<LockOutlinedIcon fontSize="small" />}
          right={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-ink/40 hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <VisibilityOffIcon fontSize="small" />
              ) : (
                <VisibilityIcon fontSize="small" />
              )}
            </button>
          }
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink/70">
            <input type="checkbox" className="accent-brand" />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-medium text-brand hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button loading={loading}>Sign in</Button>

        <p className="text-center text-sm text-ink/60">
          New to ADI Check Pro?{" "}
          <Link href="/signup" className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
