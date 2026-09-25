// Labelled text input with an icon on the left.
export default function Field({
  label,
  icon,
  right,
  ...props
}: {
  label: string;
  icon: React.ReactNode;
  right?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span>
      <span className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <span className="text-fg/40">{icon}</span>
        <input
          {...props}
          className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-fg/35"
        />
        {right}
      </span>
    </label>
  );
}
