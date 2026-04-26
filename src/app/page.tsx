import { Badge } from "@/components/badge";
import { SignalCard } from "@/components/signal-card";
import { StatCard } from "@/components/stat-card";
import { getHistory, getLatestReport, getTargets } from "@/lib/site-data";

export default function Home() {
  const report = getLatestReport();
  const targets = getTargets();
  const history = getHistory();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#020617_45%,_#0f172a_100%)] text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 lg:px-10">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="cyan">market.luciana.digital</Badge>
            <Badge tone="emerald">Competitor Change Watch</Badge>
            <Badge>{new Date(report.generatedAt).toLocaleString()}</Badge>
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                A market radar for agent, payments, and community infrastructure.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                This dashboard watches the pages that matter: homepage, pricing, docs, jobs,
                and GitHub releases. It turns raw page diffs into commercial signals, trend
                clusters, and next-step recommendations.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                <a className="rounded-full border border-white/15 px-4 py-2 hover:border-cyan-300 hover:text-cyan-200" href="/reports">
                  View reports →
                </a>
                <a className="rounded-full border border-white/15 px-4 py-2 hover:border-cyan-300 hover:text-cyan-200" href="/targets">
                  Explore targets →
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
          <StatCard label="Important signals" value={report.summary.importantSignals} helper="Changes that beat the relevance threshold." />
          <StatCard label="Urgent signals" value={report.summary.urgentSignals} helper="High-priority changes worthy of same-day review." />
          <StatCard label="History points" value={history.length} helper="Recent report snapshots available for trend context." />
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
              {report.topChanges.length ? (
                report.topChanges.map((signal) => <SignalCard key={signal.id} signal={signal} />)
              ) : (
                <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-slate-300">
                  No material changes crossed the threshold on the latest run. The monitor is healthy, but nothing deserves urgent action right now.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Trend clusters</p>
              <div className="mt-4 space-y-4">
                {report.trends.slice(0, 5).map((trend) => (
                  <div key={trend.category} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone="amber">{trend.category}</Badge>
                      <span className="text-sm text-slate-300">avg score {trend.averageScore}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {trend.count} signals across {trend.companies.join(", ")}.
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Coverage</p>
              <div className="mt-4 space-y-3">
                {targets.map((target) => (
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
          </div>
        </section>
      </div>
    </main>
  );
}
