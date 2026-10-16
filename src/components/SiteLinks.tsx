import Link from "next/link";

export const CONTACT_EMAIL = "info@adicheckpro.com";

// Contact, terms and privacy, shown in the footer of every kind of page.
export default function SiteLinks({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Site" className={"flex flex-wrap items-center gap-x-4 gap-y-1 text-xs " + className}>
      <Link href="/contact" className="hover:underline">
        Contact
      </Link>
      <Link href="/terms" className="hover:underline">
        Terms &amp; Conditions
      </Link>
      <Link href="/privacy" className="hover:underline">
        Privacy Policy
      </Link>
    </nav>
  );
}
