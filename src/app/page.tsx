import { Badge } from "@/components/badge";
import { SignalCard } from "@/components/signal-card";
import { StatCard } from "@/components/stat-card";
import { getHistory, getLatestReport, getTargets } from "@/lib/site-data";

export default function Home() {
  const report = getLatestReport();
  const targets = getTargets();
  const history = getHistory();
  const actionableSignals = report.topChanges.filter((signal) => !signal.isBaseline);
  const highestPriorityTargets = targets.filter((target) => target.priority === "high");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#020617_45%,_#0f172a_100%)] text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 lg:px-10">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="cyan">market.luciana.digital</Badge>
            <Badge tone="emerald">Market intelligence product</Badge>
            <Badge>{new Date(report.generatedAt).toLocaleString()}</Badge>
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Market intelligence for agent monetization and payments infrastructure.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                Track pricing, positioning, docs, hiring, and release activity across the
                companies shaping agent commerce. This radar is built to answer the useful
                operator questions: what changed, why it matters, and what is worth talking
                about next.
              </p>
              <div className="mt-6 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">Use it internally</p>
                  <p className="mt-2">Spot pricing and product shifts before they harden into market consensus.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">Turn it into content</p>
                  <p className="mt-2">Every signal includes a post angle so the research can become LinkedIn-native commentary.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">Stay commercial</p>
                  <p className="mt-2">The emphasis is not raw diff noise. It is GTM, monetization, and narrative movement.</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                <a className="rounded-full border border-white/15 px-4 py-2 hover:border-cyan-300 hover:text-cyan-200" href="/reports">
                  Review actionable signals →
                </a>
                <a className="rounded-full border border-white/15 px-4 py-2 hover:border-cyan-300 hover:text-cyan-200" href="/targets">
                  Explore tracked companies →
                </a>
                <a className="rounded-full border border-white/15 px-4 py-2 hover:border-cyan-300 hover:text-cyan-200" href="/api/report">
                  Raw JSON API →
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Weekly brief</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">{report.weeklyBrief.headline}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                {report.weeklyBrief.bullets.map((bullet) => (
                  <li key={bullet}>• {bullet}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Targets" value={report.summary.targetsMonitored} helper="Companies and products actively tracked." />
          <StatCard label="Actionable signals" value={report.summary.importantSignals} helper="Changes worth interpretation, not just collection." />
          <StatCard label="Urgent signals" value={report.summary.urgentSignals} helper="High-priority changes worthy of same-day review." />
          <StatCard label="Baselines ready" value={report.summary.baselineSignals} helper="Tracked pages with fresh comparison state for future runs." />
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Top changes</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">What deserves attention now</h2>
              </div>
            </div>
            <div className="space-y-5">
              {actionableSignals.length ? (
                actionableSignals.map((signal) => <SignalCard key={signal.id} signal={signal} />)
              ) : (
                <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-slate-300">
                  No true market change crossed the action threshold on the latest run. The good news: the radar is initialized, so the next pricing, positioning, or hiring move will be much easier to detect cleanly.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Trend clusters</p>
              <div className="mt-4 space-y-4">
                {report.trends.slice(0, 5).length ? report.trends.slice(0, 5).map((trend) => (
                  <div key={trend.category} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone="amber">{trend.category}</Badge>
                      <span className="text-sm text-slate-300">avg score {trend.averageScore}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {trend.count} signals across {trend.companies.join(", ")}.
                    </p>
                  </div>
                )) : actionableSignals.length ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                    Actionable movement exists, but no repeated market pattern has formed yet.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                    Trend clustering unlocks after the first real changes land. Right now the system is still building clean baselines.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Priority watchlist</p>
              <div className="mt-4 space-y-3">
                {highestPriorityTargets.map((target) => (
                  <div key={target.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{target.company}</p>
                        <p className="text-sm text-slate-400">{target.category}</p>
                      </div>
                      <Badge tone={target.priority === "high" ? "rose" : target.priority === "medium" ? "amber" : "slate"}>
                        {target.priority}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{target.whyItMatters}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">History</p>
              <div className="mt-4 space-y-3">
                {history.slice(0, 4).map((entry) => (
                  <div key={entry.generatedAt} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {new Date(entry.generatedAt).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">{entry.headline}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
