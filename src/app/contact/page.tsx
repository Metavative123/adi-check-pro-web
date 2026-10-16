import type { Metadata } from "next";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PublicPage from "@/components/PublicPage";
import { CONTACT_EMAIL } from "@/components/SiteLinks";

export const metadata: Metadata = {
  title: "Contact · ADI Check Pro",
  description: "Get in touch with ADI Check Pro.",
};

export default function ContactPage() {
  return (
    <PublicPage title="Contact us">
      <p className="text-sm text-fg/70">
        Questions about your account, billing or the app? Email us and we&apos;ll get back to
        you.
      </p>

      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="mt-6 flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-shade transition hover:border-brand"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-fg">
          <EmailOutlinedIcon />
        </span>
        <span className="min-w-0">
          <span className="block text-xs text-fg/50">Email</span>
          <span className="block break-all text-lg font-semibold text-fg">{CONTACT_EMAIL}</span>
        </span>
      </a>
    </PublicPage>
  );
}
