import { WORKLOAD_CONFIG } from "./config";

export type LoadLevel = "RELAXED" | "NORMAL" | "HIGH" | "OVERLOADED";
export type Subjective = "RELAXED" | "NORMAL" | "TIGHT";

export interface WorkloadTaskInput {
  status: "TODO" | "IN_PROGRESS" | "DONE";
  estimatedHours: number;
  dueDate: Date | null;
}

// Each component normalized to 0..1 — lets the UI explain *why* load is high.
export interface WorkloadBreakdown {
  count: number;
  effort: number;
  deadline: number;
  subjective: number;
}

export interface WorkloadResult {
  score: number; // 0..1
  level: LoadLevel;
  breakdown: WorkloadBreakdown;
  raw: { openCount: number; totalHours: number; dueSoonCount: number };
}

const DAY_MS = 86_400_000;

function deadlineWeight(due: Date | null, now: Date): number {
  if (!due) return 0.5;
  const days = (due.getTime() - now.getTime()) / DAY_MS;
  if (days <= 3) return 3;
  if (days <= 7) return 2;
  if (days <= 14) return 1;
  return 0.5;
}

const SUBJECTIVE_NUM: Record<Subjective, number> = {
  RELAXED: 0,
  NORMAL: 1,
  TIGHT: 2,
};

export function toLevel(score: number): LoadLevel {
  const { thresholds } = WORKLOAD_CONFIG;
  if (score < thresholds.relaxed) return "RELAXED";
  if (score < thresholds.normal) return "NORMAL";
  if (score < thresholds.high) return "HIGH";
  return "OVERLOADED";
}

export function computeWorkload(
  tasks: WorkloadTaskInput[],
  subjectiveLoad: Subjective,
  now: Date = new Date()
): WorkloadResult {
  const { caps, weights, windowDays } = WORKLOAD_CONFIG;
  const windowEnd = new Date(now.getTime() + windowDays * DAY_MS);

  // Open tasks within the window or undated.
  const open = tasks.filter(
    (t) => t.status !== "DONE" && (!t.dueDate || t.dueDate <= windowEnd)
  );

  const openCount = open.length;
  const totalHours = open.reduce((s, t) => s + (t.estimatedHours || 0), 0);
  const deadlineConcentration = open.reduce(
    (s, t) => s + deadlineWeight(t.dueDate, now),
    0
  );
  const dueSoonCount = open.filter(
    (t) => t.dueDate && (t.dueDate.getTime() - now.getTime()) / DAY_MS <= 3
  ).length;

  const nCount = Math.min(openCount / caps.count, 1);
  const nEffort = Math.min(totalHours / caps.effort, 1);
  const nDeadline = Math.min(deadlineConcentration / caps.deadline, 1);
  const nSubjective = SUBJECTIVE_NUM[subjectiveLoad] / 2;

  const score =
    weights.count * nCount +
    weights.effort * nEffort +
    weights.deadline * nDeadline +
    weights.subjective * nSubjective;

  return {
    score,
    level: toLevel(score),
    breakdown: {
      count: nCount,
      effort: nEffort,
      deadline: nDeadline,
      subjective: nSubjective,
    },
    raw: { openCount, totalHours, dueSoonCount },
  };
}

export const LEVEL_META: Record<
  LoadLevel,
  { label: string; badge: string; bar: string }
> = {
  RELAXED: {
    label: "余裕",
    badge: "bg-green-100 text-green-800 border-green-300",
    bar: "bg-green-500",
  },
  NORMAL: {
    label: "普通",
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    bar: "bg-slate-400",
  },
  HIGH: {
    label: "高",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    bar: "bg-amber-500",
  },
  OVERLOADED: {
    label: "逼迫",
    badge: "bg-red-100 text-red-800 border-red-300",
    bar: "bg-red-500",
  },
};

export const SUBJECTIVE_LABEL: Record<Subjective, string> = {
  RELAXED: "余裕",
  NORMAL: "普通",
  TIGHT: "逼迫",
};
