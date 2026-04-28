import { Badge } from "@/components/badge";
import { getLatestReport, getTargets } from "@/lib/site-data";

export default function TargetsPage() {
  const report = getLatestReport();
  const targets = getTargets();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <Badge tone="cyan">Target map</Badge>
          <h1 className="mt-4 text-4xl font-semibold text-white">Tracked companies and surfaces</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            These are not generic competitors. They are the reference set for agent monetization,
            payments infrastructure, and upmarket product packaging. Each card explains why the
            company is on the board and how much signal surface it contributes.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {targets.map((target) => {
            const coverage = report.targetCoverage.find((item) => item.company === target.company);
            return (
              <article key={target.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-white">{target.company}</p>
                    <p className="text-sm text-slate-400">{target.category}</p>
                  </div>
                  <Badge tone={target.priority === "high" ? "rose" : target.priority === "medium" ? "amber" : "slate"}>
                    {target.priority}
                  </Badge>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-300">{target.whyItMatters}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {target.pages.map((page) => (
                    <Badge key={`${target.id}-${page.type}`}>{page.label}</Badge>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4 text-sm text-cyan-100">
                  Latest max score: <span className="font-semibold">{coverage?.latestSignalScore ?? 0}</span>
                  <br />
                  Pages tracked: <span className="font-semibold">{coverage?.pagesTracked ?? target.pages.length}</span>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
