import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NotFoundGauge from "@/components/NotFoundGauge";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 py-12 text-center text-white">
      {/* gauge with a pulsing ring behind it */}
      <div className="relative animate-fade-up">
        <span className="absolute inset-6 animate-ping-slow rounded-full bg-dial/10" />
        <NotFoundGauge />
        <span className="absolute inset-x-0 bottom-[15%] text-3xl font-bold tracking-[0.2em] text-white">
          404
        </span>
      </div>

      <h1 className="mt-8 animate-fade-up text-2xl font-semibold [animation-delay:150ms] md:text-3xl">
        Off the route
      </h1>
      <p className="mt-3 max-w-sm animate-fade-up text-sm text-white/70 [animation-delay:300ms]">
        This page isn&apos;t on our records. Let&apos;s get you back on the road.
      </p>

      <Link
        href="/login"
        className="mt-8 flex animate-fade-up items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark [animation-delay:450ms]"
      >
        <ArrowBackIcon fontSize="small" /> Back to sign in
      </Link>
    </main>
  );
}
