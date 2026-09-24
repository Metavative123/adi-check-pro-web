"use client";

import { useState } from "react";
import Link from "next/link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AuthLayout from "@/components/AuthLayout";
import Field from "@/components/Field";
import Button from "@/components/Button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    // TODO: connect to backend — POST { token, password } to the reset API.
    // The token comes from the email link, e.g. /reset-password?token=abc
    console.log("reset password", { password });
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 600);
  }

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="You can now sign in with your new password.">
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg bg-brand-light p-4 text-sm text-brand-dark">
            <CheckCircleIcon />
            <span>All set.</span>
          </div>
          <Link
            href="/login"
            className="block rounded-lg bg-brand py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Go to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a password you haven't used before.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="New password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<LockOutlinedIcon fontSize="small" />}
        />
        <Field
          label="Confirm password"
          type="password"
          required
          placeholder="Repeat the password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          icon={<LockOutlinedIcon fontSize="small" />}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button loading={loading}>Update password</Button>
      </form>
    </AuthLayout>
  );
}
