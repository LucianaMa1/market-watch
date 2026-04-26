import { z } from "zod";

export const pageTypeSchema = z.enum([
  "homepage",
  "pricing",
  "docs",
  "changelog",
  "jobs",
  "github-releases",
]);

export type PageType = z.infer<typeof pageTypeSchema>;

export const monitoredPageSchema = z.object({
  type: pageTypeSchema,
  url: z.url(),
  label: z.string(),
});

export const targetSchema = z.object({
  id: z.string(),
  company: z.string(),
  category: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  whyItMatters: z.string(),
  pages: z.array(monitoredPageSchema).min(1),
});

export type Target = z.infer<typeof targetSchema>;

export const diffSchema = z.object({
  added: z.array(z.string()),
  removed: z.array(z.string()),
  changed: z.boolean(),
  summary: z.string(),
});

export type PageDiff = z.infer<typeof diffSchema>;

export const signalCategorySchema = z.enum([
  "pricing",
  "product",
  "enterprise",
  "positioning",
  "hiring",
  "github-release",
  "risk",
  "noise",
]);

export type SignalCategory = z.infer<typeof signalCategorySchema>;

export const signalSchema = z.object({
  id: z.string(),
  company: z.string(),
  companySlug: z.string(),
  targetId: z.string(),
  pageType: pageTypeSchema,
  url: z.url(),
  category: signalCategorySchema,
  score: z.number(),
  summary: z.string(),
  added: z.array(z.string()),
  removed: z.array(z.string()),
  recommendation: z.string(),
  tags: z.array(z.string()),
  capturedAt: z.string(),
});

export type Signal = z.infer<typeof signalSchema>;

export const trendSummarySchema = z.object({
  category: signalCategorySchema.exclude(["noise"]),
  count: z.number(),
  companies: z.array(z.string()),
  averageScore: z.number(),
});

export type TrendSummary = z.infer<typeof trendSummarySchema>;

export const monitoredSnapshotSchema = z.object({
  company: z.string(),
  pageType: pageTypeSchema,
  url: z.url(),
  lines: z.array(z.string()),
  fetchedAt: z.string(),
});

export type MonitoredSnapshot = z.infer<typeof monitoredSnapshotSchema>;

export const reportSchema = z.object({
  generatedAt: z.string(),
  summary: z.object({
    totalSignals: z.number(),
    importantSignals: z.number(),
    targetsMonitored: z.number(),
    urgentSignals: z.number(),
  }),
  topChanges: z.array(signalSchema),
  noise: z.array(signalSchema),
  signals: z.array(signalSchema),
  trends: z.array(trendSummarySchema),
  snapshots: z.array(monitoredSnapshotSchema),
  targetCoverage: z.array(
    z.object({
      company: z.string(),
      category: z.string(),
      pagesTracked: z.number(),
      latestSignalScore: z.number(),
    }),
  ),
  weeklyBrief: z.object({
    headline: z.string(),
    bullets: z.array(z.string()),
  }),
});

export type Report = z.infer<typeof reportSchema>;

export const historyEntrySchema = z.object({
  generatedAt: z.string(),
  headline: z.string(),
  topCategories: z.array(z.string()),
  topCompanies: z.array(z.string()),
  urgentSignals: z.number(),
  importantSignals: z.number(),
});

export type HistoryEntry = z.infer<typeof historyEntrySchema>;
