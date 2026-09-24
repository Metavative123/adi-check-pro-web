"use client";

import { useState } from "react";
import Link from "next/link";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import AuthLayout from "@/components/AuthLayout";
import Field from "@/components/Field";
import Button from "@/components/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // TODO: connect to backend — POST { email } to the reset-link API.
    console.log("forgot password", { email });
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle={`We sent a reset link to ${email}.`}>
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg bg-brand-light p-4 text-sm text-brand-dark">
            <MarkEmailReadIcon />
            <span>The link expires in 30 minutes.</span>
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
      className="flex items-center justify-center gap-1 text-sm text-ink/60 hover:text-ink"
    >
      <ArrowBackIcon fontSize="small" /> Back to sign in
    </Link>
  );
}
