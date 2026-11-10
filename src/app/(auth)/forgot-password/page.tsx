"use client";

import { useState } from "react";
import Link from "next/link";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import AuthLayout from "@/components/AuthLayout";
import Field from "@/components/Field";
import Button from "@/components/Button";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the email");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`If ${email} has an account, we've sent it a reset link.`}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg bg-brand-light p-4 text-sm text-brand-fg">
            <MarkEmailReadIcon />
            <span>
              The link expires in 30 minutes. Nothing after a few minutes? Check your spam
              folder.
            </span>
          </div>
          <button
            onClick={() => setSent(false)}
            className="text-sm font-medium text-brand hover:underline"
          >
            Use a different email
          </button>
          <BackToLogin />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link."
    >
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
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button loading={loading}>Send reset link</Button>
        <BackToLogin />
      </form>
    </AuthLayout>
  );
}

function BackToLogin() {
  return (
    <Link
      href="/login"
      className="flex items-center justify-center gap-1 text-sm text-fg/60 hover:text-fg"
    >
      <ArrowBackIcon fontSize="small" /> Back to sign in
    </Link>
  );
}
