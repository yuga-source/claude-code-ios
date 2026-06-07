import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { computeWorkload, type Subjective } from "@/lib/workload/score";
import { LoadBadge } from "@/components/LoadBadge";
import { WorkloadBar } from "@/components/WorkloadBar";
import { TaskList } from "@/components/TaskList";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const member = await prisma.user.findUnique({
    where: { id },
    include: {
      team: true,
      tasks: { orderBy: [{ status: "asc" }, { dueDate: "asc" }] },
    },
  });

  if (!member) notFound();

  const workload = computeWorkload(
    member.tasks.map((t) => ({
      status: t.status,
      estimatedHours: t.estimatedHours,
      dueDate: t.dueDate,
    })),
    member.subjectiveLoad as Subjective
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/dashboard"
        className="text-sm text-slate-500 hover:underline"
      >
        ← ダッシュボードへ戻る
      </Link>

      <div className="mt-3 mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold">{member.name}</h1>
        <LoadBadge level={workload.level} />
        {member.team && (
          <span className="text-sm text-slate-400">{member.team.name}</span>
        )}
      </div>

      <div className="mb-6 rounded-lg border bg-white p-4">
        <div className="mb-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-slate-400">未完了</div>
            <div className="text-lg font-semibold">
              {workload.raw.openCount}件
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">工数合計</div>
            <div className="text-lg font-semibold">
              {workload.raw.totalHours}h
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">締切間近</div>
            <div className="text-lg font-semibold">
              {workload.raw.dueSoonCount}件
            </div>
          </div>
        </div>
        <WorkloadBar breakdown={workload.breakdown} />
      </div>

      <h2 className="mb-2 font-semibold">タスク一覧</h2>
      <TaskList tasks={member.tasks} editable={false} />
    </main>
  );
}
