import historyJson from "@/data/generated/history.json";
import reportJson from "@/data/generated/latest-report.json";
import targetsJson from "@/data/targets.json";
import { reportSchema, targetSchema, type HistoryEntry, type Report, type Target } from "@/lib/types";

export function getTargets(): Target[] {
  return targetsJson.map((target) => targetSchema.parse(target));
}

export function getLatestReport(): Report {
  return reportSchema.parse(reportJson);
}

export function getHistory(): HistoryEntry[] {
  return historyJson as HistoryEntry[];
}
