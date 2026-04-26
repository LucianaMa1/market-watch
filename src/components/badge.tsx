import clsx from "clsx";

const toneClasses = {
  slate: "border-white/10 bg-white/5 text-slate-200",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-100",
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
} as const;

export function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.2em]",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
