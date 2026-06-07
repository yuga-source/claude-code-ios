import Link from "next/link";
import { LoadBadge } from "./LoadBadge";
import { WorkloadBar } from "./WorkloadBar";
import {
  SUBJECTIVE_LABEL,
  type Subjective,
  type WorkloadResult,
} from "@/lib/workload/score";

export function MemberCard({
  id,
  name,
  teamName,
  subjectiveLoad,
  workload,
}: {
  id: string;
  name: string;
  teamName?: string | null;
  subjectiveLoad: Subjective;
  workload: WorkloadResult;
}) {
  return (
    <Link
      href={`/dashboard/member/${id}`}
      className="block rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="font-semibold">{name}</div>
          {teamName && (
            <div className="text-xs text-slate-400">{teamName}</div>
          )}
        </div>
        <LoadBadge level={workload.level} />
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-center text-sm">
        <Stat label="未完了" value={`${workload.raw.openCount}件`} />
        <Stat label="工数" value={`${workload.raw.totalHours}h`} />
        <Stat label="締切間近" value={`${workload.raw.dueSoonCount}件`} />
      </div>

      <WorkloadBar breakdown={workload.breakdown} />

      <div className="mt-3 text-xs text-slate-400">
        本人申告: {SUBJECTIVE_LABEL[subjectiveLoad]} ／ スコア{" "}
        {Math.round(workload.score * 100)}
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-slate-50 py-1.5">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}
