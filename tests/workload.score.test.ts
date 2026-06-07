import { describe, it, expect } from "vitest";
import {
  computeWorkload,
  toLevel,
  type WorkloadTaskInput,
} from "../src/lib/workload/score";

const now = new Date("2026-06-07T00:00:00Z");
const inDays = (d: number) =>
  new Date(now.getTime() + d * 86_400_000);

function task(
  partial: Partial<WorkloadTaskInput> = {}
): WorkloadTaskInput {
  return {
    status: "TODO",
    estimatedHours: 0,
    dueDate: null,
    ...partial,
  };
}

describe("toLevel", () => {
  it("maps scores to the four buckets", () => {
    expect(toLevel(0.1)).toBe("RELAXED");
    expect(toLevel(0.4)).toBe("NORMAL");
    expect(toLevel(0.7)).toBe("HIGH");
    expect(toLevel(0.9)).toBe("OVERLOADED");
  });
});

describe("computeWorkload", () => {
  it("returns RELAXED for an empty / light load", () => {
    const r = computeWorkload(
      [task({ estimatedHours: 1, dueDate: inDays(12) })],
      "RELAXED",
      now
    );
    expect(r.level).toBe("RELAXED");
    expect(r.raw.openCount).toBe(1);
  });

  it("returns OVERLOADED for many urgent high-effort tasks + TIGHT self-report", () => {
    const tasks = Array.from({ length: 8 }, () =>
      task({ estimatedHours: 6, dueDate: inDays(1) })
    );
    const r = computeWorkload(tasks, "TIGHT", now);
    expect(r.level).toBe("OVERLOADED");
    expect(r.raw.dueSoonCount).toBe(8);
  });

  it("excludes DONE tasks and tasks beyond the window", () => {
    const r = computeWorkload(
      [
        task({ status: "DONE", estimatedHours: 100, dueDate: inDays(1) }),
        task({ estimatedHours: 5, dueDate: inDays(40) }), // beyond 14d window
        task({ estimatedHours: 3, dueDate: inDays(5) }), // counted
      ],
      "NORMAL",
      now
    );
    expect(r.raw.openCount).toBe(1);
    expect(r.raw.totalHours).toBe(3);
  });

  it("weights near-deadline tasks more heavily", () => {
    const near = computeWorkload(
      [task({ dueDate: inDays(1) })],
      "NORMAL",
      now
    );
    const far = computeWorkload(
      [task({ dueDate: inDays(13) })],
      "NORMAL",
      now
    );
    expect(near.breakdown.deadline).toBeGreaterThan(far.breakdown.deadline);
  });

  it("subjective self-report raises the score", () => {
    const base = [task({ estimatedHours: 4, dueDate: inDays(5) })];
    const relaxed = computeWorkload(base, "RELAXED", now);
    const tight = computeWorkload(base, "TIGHT", now);
    expect(tight.score).toBeGreaterThan(relaxed.score);
  });
});
