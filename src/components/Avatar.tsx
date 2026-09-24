// Initials avatar. The colour is picked from the name, so a person
// always gets the same one.
const COLORS = [
  "bg-brand",
  "bg-ink-soft",
  "bg-dial",
  "bg-emerald-600",
  "bg-sky-700",
  "bg-rose-600",
];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-20 w-20 text-xl",
  };

  const color = COLORS[name.length % COLORS.length];

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white/20 ${color} ${sizes[size]}`}
      aria-hidden="true"
    >
      {initials(name) || "?"}
    </span>
  );
}
