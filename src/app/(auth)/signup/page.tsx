"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AuthLayout from "@/components/AuthLayout";
import Field from "@/components/Field";
import Button from "@/components/Button";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const { token } = await api.register(name, email, password);
      saveToken(token);
      // A new account never has a badge number or centres yet.
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account");
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Set up your ADI Check Pro account in a minute."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Full name"
          required
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<PersonOutlinedIcon fontSize="small" />}
        />

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
          minLength={8}
          placeholder="At least 8 characters"
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

        <Field
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="Repeat the password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          icon={<LockOutlinedIcon fontSize="small" />}
        />

        <label className="flex items-start gap-2 text-sm text-ink/70">
          <input type="checkbox" required className="mt-1 accent-brand" />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-brand hover:underline">
              terms of service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-brand hover:underline">
              privacy policy
            </Link>
            .
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button loading={loading}>Create account</Button>

        <p className="text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
