import type { Metadata } from "next";
import Link from "next/link";
import PublicPage from "@/components/PublicPage";

export const metadata: Metadata = {
  title: "Privacy Policy · ADI Check Pro",
  description: "How ADI Check Pro collects and uses your information.",
};

// PLACEHOLDER: Benn is writing the privacy policy. When the text arrives, replace the
// <section> below with it, update LAST_UPDATED, and remove the notice.
const LAST_UPDATED: string | null = null;

export default function PrivacyPage() {
  return (
    <PublicPage title="Privacy Policy">
      {LAST_UPDATED && <p className="text-xs text-fg/50">Last updated {LAST_UPDATED}</p>}

      <section className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-shade">
        <p className="text-sm font-medium text-fg">Our privacy policy is being finalised.</p>
        <p className="mt-2 text-sm text-fg/70">
          It will be published on this page shortly. If you have a question in the meantime,
          please{" "}
          <Link href="/contact" className="font-medium text-brand hover:underline">
            contact us
          </Link>
          .
        </p>
      </section>
    </PublicPage>
  );
}
