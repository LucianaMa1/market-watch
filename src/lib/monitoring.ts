import type { PageDiff, PageType, Signal, SignalCategory, TrendSummary } from "./types";

const KEYWORDS: Record<Exclude<SignalCategory, "noise">, string[]> = {
  pricing: ["pricing", "annual", "plan", "seat", "discount", "free tier", "credit"],
  product: ["feature", "integration", "api", "workflow", "agent", "browser"],
  enterprise: ["enterprise", "security", "sso", "compliance", "admin", "audit"],
  positioning: ["platform", "teams", "for ", "use case", "workflow"],
  hiring: ["engineer", "manager", "designer", "hiring", "role", "career"],
  "github-release": ["release", "version", "changelog", "tag"],
  risk: ["deprecated", "shutdown", "removed", "sunset", "incident", "outage", "not found", "404"],
};

const PAGE_CATEGORY_DEFAULTS: Record<PageType, Exclude<SignalCategory, "noise">> = {
  homepage: "positioning",
  pricing: "pricing",
  docs: "product",
  changelog: "product",
  jobs: "hiring",
  "github-releases": "github-release",
};

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function normalizeLines(lines: string[]) {
  return lines
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 4)
    .filter((line, index, arr) => arr.indexOf(line) === index)
    .slice(0, 24);
}

export function computePageDiff(previousLines: string[] = [], nextLines: string[] = []): PageDiff {
  const previous = normalizeLines(previousLines);
  const next = normalizeLines(nextLines);
  const previousSet = new Set(previous);
  const nextSet = new Set(next);

  const added = next.filter((line) => !previousSet.has(line)).slice(0, 6);
  const removed = previous.filter((line) => !nextSet.has(line)).slice(0, 6);
  const changed = added.length > 0 && removed.length > 0;
  const summaryParts = [...added.slice(0, 2), ...removed.slice(0, 1)];

  return {
    added,
    removed,
    changed,
    summary: summaryParts.join(" • "),
  };
}

export function categorizeSignal(input: {
  pageType: PageType;
  added: string[];
  removed: string[];
  changed: boolean;
  summary: string;
}) {
  const haystack = `${input.summary} ${input.added.join(" ")} ${input.removed.join(" ")}`.toLowerCase();
  const defaultCategory = PAGE_CATEGORY_DEFAULTS[input.pageType];

  if (input.pageType === "jobs") {
    return { ...input, category: "hiring" as const };
  }

  if (input.pageType === "pricing") {
    return { ...input, category: /enterprise|security|compliance|admin/i.test(haystack) ? "enterprise" : "pricing" as const };
  }

  for (const [category, words] of Object.entries(KEYWORDS) as [Exclude<SignalCategory, "noise">, string[]][]) {
    if (words.some((word) => haystack.includes(word))) {
      return { ...input, category };
    }
  }

  return { ...input, category: defaultCategory };
}

export function scoreSignal(signal: Pick<Signal, "pageType" | "category" | "added" | "removed" | "summary">) {
  let score = 35;

  const pageWeights: Record<PageType, number> = {
    homepage: 10,
    pricing: 38,
    docs: 22,
    changelog: 18,
    jobs: 16,
    "github-releases": 20,
  };

  const categoryWeights: Record<SignalCategory, number> = {
    pricing: 25,
    product: 18,
    enterprise: 22,
    positioning: 16,
    hiring: 12,
    "github-release": 14,
    risk: 30,
    noise: 0,
  };

  score += pageWeights[signal.pageType];
  score += categoryWeights[signal.category];
  score += Math.min(signal.added.length * 6, 18);
  score += Math.min(signal.removed.length * 4, 12);

  if (/enterprise|security|annual|discount|admin|compliance/i.test(signal.summary)) {
    score += 8;
  }

  return Math.min(score, 100);
}

export function buildRecommendation(category: SignalCategory, company: string) {
  switch (category) {
    case "pricing":
      return `Check whether ${company} is moving upmarket or tightening monetization, then compare against your own pricing narratives.`;
    case "enterprise":
      return `Track if ${company} is stacking enterprise proof points; this usually precedes more assertive sales motion.`;
    case "hiring":
      return `Watch the role mix at ${company}; hiring patterns often reveal the next strategic bet before the homepage does.`;
    case "github-release":
      return `Review the release notes for ${company} and note if the shipped capabilities map to demand you already hear from operators.`;
    case "risk":
      return `Treat this as a caution signal from ${company}; validate whether it affects trust, reliability, or migration risk.`;
    case "product":
      return `Look for downstream GTM implications at ${company}: what new workflow or use case are they trying to unlock?`;
    case "positioning":
      return `Compare ${company}'s new messaging against peers to see if a broader category shift is underway.`;
    default:
      return `No action needed yet.`;
  }
}

export function buildTags(category: SignalCategory, pageType: PageType, text: string) {
  const tags = new Set<string>([pageType, category]);

  if (/enterprise|security|admin|compliance/i.test(text)) tags.add("enterprise");
  if (/annual|pricing|plan|seat|credit/i.test(text)) tags.add("pricing");
  if (/api|agent|browser|workflow|integration/i.test(text)) tags.add("product");
  if (/hiring|engineer|manager|career/i.test(text)) tags.add("talent");

  return [...tags];
}

export function buildTrendSummary(signals: Array<Pick<Signal, "category" | "score" | "company">>): TrendSummary[] {
  const bucket = new Map<string, { companies: Set<string>; count: number; totalScore: number }>();

  for (const signal of signals) {
    if (signal.category === "noise") continue;

    if (!bucket.has(signal.category)) {
      bucket.set(signal.category, { companies: new Set<string>(), count: 0, totalScore: 0 });
    }

    const current = bucket.get(signal.category)!;
    current.count += 1;
    current.totalScore += signal.score;
    current.companies.add(signal.company);
  }

  return [...bucket.entries()]
    .map(([category, value]) => ({
      category: category as TrendSummary["category"],
      count: value.count,
      companies: [...value.companies].sort(),
      averageScore: Math.round(value.totalScore / value.count),
    }))
    .sort((a, b) => b.averageScore - a.averageScore || b.count - a.count);
}

export function buildWeeklyHeadline(trends: TrendSummary[], topSignals: Signal[]) {
  if (!topSignals.length) {
    return "No material changes detected this cycle — keep monitoring, but no immediate action is required.";
  }

  const firstTrend = trends[0];
  const firstSignal = topSignals[0];

  if (!firstTrend) {
    return `${firstSignal.company} generated the clearest market signal this cycle.`;
  }

  return `${firstTrend.category} signals are leading this cycle, with ${firstSignal.company} setting the pace.`;
}
