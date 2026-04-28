import type { Signal } from "@/lib/types";
import { Badge } from "@/components/badge";

export function SignalCard({ signal }: { signal: Signal }) {
  const tone = signal.score >= 85 ? "rose" : signal.score >= 70 ? "amber" : "cyan";
  const hasChangeLines = signal.added.length > 0 || signal.removed.length > 0;

  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={tone}>{signal.category}</Badge>
        <Badge>{signal.pageType}</Badge>
        <Badge tone="emerald">score {signal.score}</Badge>
        {signal.isBaseline ? <Badge tone="amber">baseline</Badge> : <Badge tone="cyan">actionable</Badge>}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{signal.company}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{signal.summary}</p>
        </div>
        <a
          className="shrink-0 rounded-full border border-white/15 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
          href={signal.url}
          target="_blank"
          rel="noreferrer"
        >
          Open source ↗
        </a>
      </div>

      {hasChangeLines && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">What changed</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              {signal.added.length ? signal.added.map((item) => <li key={item}>+ {item}</li>) : <li>No additions captured.</li>}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-rose-300">What dropped</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              {signal.removed.length ? signal.removed.map((item) => <li key={item}>- {item}</li>) : <li>No removals captured.</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4 text-sm leading-6 text-cyan-50 lg:col-span-2">
          <span className="font-semibold text-cyan-200">Why it matters:</span> {signal.recommendation}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Who should care</p>
          <p className="mt-2">{signal.audience}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4 text-sm leading-6 text-emerald-50">
        <span className="font-semibold text-emerald-200">LinkedIn angle:</span> {signal.postAngle}
      </div>
    </article>
  );
}
