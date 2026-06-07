import type { WorkloadBreakdown } from "@/lib/workload/score";

const PARTS: { key: keyof WorkloadBreakdown; label: string; color: string }[] = [
  { key: "count", label: "件数", color: "bg-sky-500" },
  { key: "effort", label: "工数", color: "bg-indigo-500" },
  { key: "deadline", label: "締切", color: "bg-rose-500" },
  { key: "subjective", label: "主観", color: "bg-amber-500" },
];

// Shows the four normalized components so a manager can see *why* load is high.
export function WorkloadBar({ breakdown }: { breakdown: WorkloadBreakdown }) {
  return (
    <div className="space-y-1.5">
      {PARTS.map((p) => {
        const pct = Math.round(breakdown[p.key] * 100);
        return (
          <div key={p.key} className="flex items-center gap-2 text-xs">
            <span className="w-8 shrink-0 text-slate-500">{p.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded bg-slate-100">
              <div
                className={`h-full ${p.color}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right tabular-nums text-slate-400">
              {pct}
            </span>
          </div>
        );
      })}
    </div>
  );
}
