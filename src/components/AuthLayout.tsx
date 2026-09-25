import Gauge from "@/components/Gauge";
import SpeedIcon from "@mui/icons-material/Speed";

// Shared shell for login / forgot-password / reset-password pages.
export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen">
      {/* Left: brand panel with the gauge — hidden below 768px */}
      <section className="relative hidden flex-col justify-center gap-8 bg-ink px-8 py-12 text-white md:flex md:w-1/2 md:px-14">
        <div className="flex items-center gap-2">
          <SpeedIcon className="text-dial" />
          <span className="text-lg font-semibold tracking-wide">ADI Check Pro</span>
        </div>

        <Gauge value={78} className="mx-auto w-48 md:w-72" />

        <div className="max-w-md">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Driver and Vehicle Standards, at a glance.
          </h2>
          <p className="mt-3 text-sm text-white/70">
            Track instructor checks, vehicle records and standards scores in one
            dashboard.
          </p>
        </div>
      </section>

      {/* Right: the form */}
      <section className="flex flex-1 items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-lg shadow-shade">
          <h1 className="text-2xl font-semibold text-fg">{title}</h1>
          <p className="mt-2 text-sm text-fg/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
