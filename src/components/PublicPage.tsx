import Link from "next/link";
import SpeedIcon from "@mui/icons-material/Speed";
import ThemeSwitch from "@/components/ThemeSwitch";
import SiteLinks from "@/components/SiteLinks";

// Shell for pages anyone can open without signing in: contact, terms.
export default function PublicPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-fg">
            <SpeedIcon className="text-dial" />
            ADI Check Pro
          </Link>
          <ThemeSwitch className="text-fg/60 hover:bg-raised hover:text-fg" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-fg md:text-3xl">{title}</h1>
        <div className="mt-6">{children}</div>
      </main>

      <footer className="border-t border-line py-6">
        <SiteLinks className="justify-center text-fg/50" />
      </footer>
    </div>
  );
}
