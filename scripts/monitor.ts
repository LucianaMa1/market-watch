import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";

import { chromium } from "playwright";

import { buildAudience, buildPostAngle, buildRecommendation, buildTags, buildTrendSummary, buildWeeklyHeadline, categorizeSignal, computePageDiff, normalizeLines, scoreSignal, slugify } from "../src/lib/monitoring";
import { reportSchema, targetSchema, type MonitoredSnapshot, type PageType, type Report, type Signal, type Target } from "../src/lib/types";

const rootDir = process.cwd();
const generatedDir = path.join(rootDir, "src", "data", "generated");
const targetsPath = path.join(rootDir, "src", "data", "targets.json");
const latestPath = path.join(generatedDir, "latest-report.json");
const historyPath = path.join(generatedDir, "history.json");

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

function parseGitHubReleaseApi(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/releases/);
  if (!match) return null;
  return `https://api.github.com/repos/${match[1]}/${match[2]}/releases?per_page=5`;
}

async function captureReleaseLines(url: string) {
  const apiUrl = parseGitHubReleaseApi(url);
  if (!apiUrl) return [];
  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": "market-watch-monitor",
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    return [];
  }

  const releases = (await response.json()) as Array<{ name?: string; tag_name?: string; body?: string }>;
  return normalizeLines(
    releases.flatMap((release) => [release.name ?? release.tag_name ?? "", release.body?.slice(0, 200) ?? ""]),
  );
}

async function capturePageLines(browser: Awaited<ReturnType<typeof chromium.launch>>, url: string, pageType: PageType) {
  if (pageType === "github-releases") {
    return captureReleaseLines(url);
  }

  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(2500);

    const lines = await page.evaluate(() => {
      const selectors = [
        "h1",
        "h2",
        "h3",
        "button",
        "a",
        "li",
        "p",
        "[data-testid]",
      ];

      const pieces: string[] = [];
      for (const selector of selectors) {
        for (const element of Array.from(document.querySelectorAll(selector))) {
          const text = element.textContent?.replace(/\s+/g, " ").trim();
          if (text && text.length >= 4) pieces.push(text);
          if (pieces.length > 160) break;
        }
      }

      return pieces;
    });

    return normalizeLines(lines);
  } catch (error) {
    console.error(`capture failed for ${url}:`, error);
    return [];
  } finally {
    await page.close();
  }
}

function previousLinesFor(previous: Report | null, company: string, pageType: PageType) {
  return (
    previous?.snapshots.find(
      (snapshot) => snapshot.company === company && snapshot.pageType === pageType,
    )?.lines ?? []
  );
}

function buildHistory(report: Report, existing: Array<Record<string, unknown>>) {
  const entry = {
    generatedAt: report.generatedAt,
    headline: report.weeklyBrief.headline,
    topCategories: report.trends.slice(0, 3).map((trend) => trend.category),
    topCompanies: report.topChanges.slice(0, 3).map((signal) => signal.company),
    urgentSignals: report.summary.urgentSignals,
    importantSignals: report.summary.importantSignals,
  };

  const merged = [entry, ...existing].filter(
    (item, index, arr) => arr.findIndex((candidate) => candidate.generatedAt === item.generatedAt) === index,
  );

  return merged.slice(0, 14);
}

async function main() {
  await mkdir(generatedDir, { recursive: true });

  const rawTargets = await readJson<unknown[]>(targetsPath, []);
  const targets = rawTargets.map((target) => targetSchema.parse(target)) as Target[];
  const previous = reportSchema.safeParse(await readJson(latestPath, null));
  const previousReport = previous.success ? previous.data : null;
  const existingHistory = await readJson<Array<Record<string, unknown>>>(historyPath, []);

  const browser = await chromium.launch({ headless: true });
  const now = new Date().toISOString();

  const snapshots: MonitoredSnapshot[] = [];
  const signals: Signal[] = [];

  try {
    for (const target of targets) {
      for (const monitoredPage of target.pages) {
        const lines = await capturePageLines(browser, monitoredPage.url, monitoredPage.type);
        const previousLines = previousLinesFor(previousReport, target.company, monitoredPage.type);
        const isBaseline = previousLines.length === 0;
        const diff = computePageDiff(previousLines, lines);

        snapshots.push({
          company: target.company,
          pageType: monitoredPage.type,
          url: monitoredPage.url,
          lines,
          fetchedAt: now,
        });

        const signalMeta = categorizeSignal({
          pageType: monitoredPage.type,
          added: diff.added,
          removed: diff.removed,
          changed: diff.changed,
          summary: diff.summary || `${target.company} ${monitoredPage.type} monitored successfully`,
        });

        const text = `${signalMeta.summary} ${signalMeta.added.join(" ")} ${signalMeta.removed.join(" ")}`.trim();
        const baselineSummary = isBaseline
          ? `Initial baseline captured for ${target.company} ${monitoredPage.type}.`
          : text || `No material changes detected for ${target.company}.`;
        const score = isBaseline
          ? Math.min(
              scoreSignal({
                pageType: monitoredPage.type,
                category: signalMeta.category as Signal["category"],
                added: diff.added,
                removed: diff.removed,
                summary: baselineSummary,
              }),
              65,
            )
          : diff.added.length || diff.removed.length
            ? scoreSignal({
                pageType: monitoredPage.type,
                category: signalMeta.category as Signal["category"],
                added: diff.added,
                removed: diff.removed,
                summary: text,
              })
            : 24;

        const category = (diff.added.length || diff.removed.length
          ? signalMeta.category
          : "noise") as Signal["category"];

        signals.push({
          id: `${target.id}-${monitoredPage.type}`,
          company: target.company,
          companySlug: slugify(target.company),
          targetId: target.id,
          pageType: monitoredPage.type,
          url: monitoredPage.url,
          category,
          score,
          summary: baselineSummary,
          added: diff.added,
          removed: diff.removed,
          isBaseline,
          recommendation: isBaseline
            ? `Baseline captured for ${target.company}. Future runs will highlight true change instead of initial page state.`
            : diff.added.length || diff.removed.length
              ? buildRecommendation(signalMeta.category as Signal["category"], target.company)
              : "No action needed yet.",
          audience: isBaseline
            ? "Internal research use first. Wait for a true change before treating this as a public signal."
            : buildAudience(signalMeta.category as Signal["category"]),
          postAngle: isBaseline
            ? `Baseline only for ${target.company} — do not post yet. Use this as future comparison fuel.`
            : buildPostAngle(signalMeta.category as Signal["category"], target.company),
          tags: buildTags(signalMeta.category as Signal["category"], monitoredPage.type, baselineSummary),
          capturedAt: now,
        });
      }
    }
  } finally {
    await browser.close();
  }

  const actionableSignals = signals
    .filter((signal) => signal.category !== "noise" && !signal.isBaseline)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
  const baselineSignals = signals.filter((signal) => signal.isBaseline);
  const noise = signals.filter((signal) => signal.category === "noise");
  const trends = buildTrendSummary(actionableSignals);

  const report: Report = {
    generatedAt: now,
    summary: {
      totalSignals: signals.length,
      importantSignals: actionableSignals.length,
      baselineSignals: baselineSignals.length,
      targetsMonitored: targets.length,
      urgentSignals: actionableSignals.filter((signal) => signal.score >= 85).length,
    },
    topChanges: actionableSignals.slice(0, 6),
    noise,
    signals,
    trends,
    snapshots,
    targetCoverage: targets.map((target) => ({
      company: target.company,
      category: target.category,
      pagesTracked: target.pages.length,
      latestSignalScore: Math.max(
        ...signals
          .filter((signal) => signal.targetId === target.id)
          .map((signal) => signal.score),
        0,
      ),
    })),
    weeklyBrief: {
      headline: actionableSignals.length
        ? buildWeeklyHeadline(trends, actionableSignals)
        : baselineSignals.length
          ? `Radar initialized across ${targets.length} companies — the baseline is ready, now the next true change will be easier to spot.`
          : "No material market movement detected this cycle.",
      bullets: [
        actionableSignals[0]
          ? `${actionableSignals[0].company}: ${actionableSignals[0].summary}`
          : baselineSignals.length
            ? `${baselineSignals.length} monitored pages were captured as first-pass baselines.`
            : "No material market movement detected.",
        trends[0]
          ? `${trends[0].category} is the strongest current theme across ${trends[0].companies.length} companies.`
          : baselineSignals.length
            ? "No repeated pattern yet because the current run is mostly baseline setup."
            : "No repeated market pattern yet.",
        `${targets.length} targets were monitored across ${targets.reduce((sum, target) => sum + target.pages.length, 0)} pages.`,
      ],
    },
  };

  const history = buildHistory(report, existingHistory);

  await writeFile(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(historyPath, `${JSON.stringify(history, null, 2)}\n`, "utf8");

  console.log(`Generated report with ${actionableSignals.length} actionable signals and ${baselineSignals.length} baselines.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
