import { LEVEL_META, type LoadLevel } from "@/lib/workload/score";

export function LoadBadge({ level }: { level: LoadLevel }) {
  const meta = LEVEL_META[level];
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}
    >
      {meta.label}
    </span>
  );
}
