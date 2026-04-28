import { Badge } from "@/components/badge";
import { SignalCard } from "@/components/signal-card";
import { getHistory, getLatestReport } from "@/lib/site-data";

export default function ReportsPage() {
  const report = getLatestReport();
  const history = getHistory();
  const actionableSignals = report.signals.filter((signal) => signal.category !== "noise" && !signal.isBaseline);
  const baselineSignals = report.signals.filter((signal) => signal.isBaseline);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="emerald">Daily report</Badge>
            <Badge>{new Date(report.generatedAt).toLocaleString()}</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-white">Report center</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            Review the current signal stack, separate true market movement from baseline setup, and mine each change for commercial interpretation.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5">
            {actionableSignals.length ? (
              actionableSignals.map((signal) => <SignalCard key={signal.id} signal={signal} />)
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-slate-300">
                This run did not surface a true market shift yet. Baselines are in place, so future runs should produce cleaner pricing, positioning, docs, and hiring signals.
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Fresh baselines</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                {baselineSignals.slice(0, 10).map((signal) => (
                  <li key={signal.id}>
                    <span className="font-medium text-white">{signal.company}</span> — {signal.pageType}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Ignored as noise</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                {report.noise.slice(0, 10).map((signal) => (
                  <li key={signal.id}>
                    <span className="font-medium text-white">{signal.company}</span> — {signal.pageType}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">History</p>
              <div className="mt-4 space-y-4">
                {history.map((entry) => (
                  <div key={entry.generatedAt} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {new Date(entry.generatedAt).toLocaleString()}
                    </p>
                    <p className="mt-2 font-medium text-white">{entry.headline}</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Urgent: {entry.urgentSignals} · Important: {entry.importantSignals}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Themes: {entry.topCategories.join(", ") || "None yet"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
