import { describe, expect, it } from "vitest";

import {
  buildTrendSummary,
  categorizeSignal,
  computePageDiff,
  scoreSignal,
} from "@/lib/monitoring";

describe("computePageDiff", () => {
  it("detects added and removed bullets", () => {
    const diff = computePageDiff(
      ["AI browser automation", "Teams"],
      ["AI browser automation", "Teams", "Enterprise SSO"],
    );

    expect(diff.added).toEqual(["Enterprise SSO"]);
    expect(diff.removed).toEqual([]);
    expect(diff.changed).toBe(false);
  });

  it("marks content as changed when headings mutate materially", () => {
    const diff = computePageDiff(
      ["Usage-based pricing", "API access"],
      ["Annual pricing available", "API access"],
    );

    expect(diff.changed).toBe(true);
    expect(diff.summary).toContain("Annual pricing available");
  });
});

describe("categorizeSignal + scoreSignal", () => {
  it("treats pricing changes as high-impact signals", () => {
    const signal = categorizeSignal({
      pageType: "pricing",
      added: ["Annual plan now available"],
      removed: [],
      changed: true,
      summary: "Annual plan now available on pricing page",
    });

    expect(signal.category).toBe("pricing");
    expect(scoreSignal(signal)).toBeGreaterThanOrEqual(85);
  });

  it("treats jobs updates as medium relevance", () => {
    const signal = categorizeSignal({
      pageType: "jobs",
      added: ["Staff security engineer"],
      removed: [],
      changed: false,
      summary: "New role added",
    });

    expect(signal.category).toBe("hiring");
    expect(scoreSignal(signal)).toBeGreaterThanOrEqual(55);
    expect(scoreSignal(signal)).toBeLessThan(85);
  });
});

describe("buildTrendSummary", () => {
  it("aggregates repeated themes across monitored targets", () => {
    const summary = buildTrendSummary([
      { category: "pricing", score: 92, company: "A" },
      { category: "pricing", score: 88, company: "B" },
      { category: "enterprise", score: 76, company: "C" },
    ]);

    expect(summary[0]).toMatchObject({
      category: "pricing",
      companies: ["A", "B"],
      count: 2,
    });
  });
});
