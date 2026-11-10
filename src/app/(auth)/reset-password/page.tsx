"use client";

import { useState } from "react";
import Link from "next/link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AuthLayout from "@/components/AuthLayout";
import Field from "@/components/Field";
import Button from "@/components/Button";
import { api } from "@/lib/api";

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
    // The token comes from the emailed link: /reset-password?token=...
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setError("This page needs the link from the reset email. Ask for a new one.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change the password");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="You can now sign in with your new password.">
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg bg-brand-light p-4 text-sm text-brand-fg">
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
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button loading={loading}>Update password</Button>
      </form>
    </AuthLayout>
  );
}
