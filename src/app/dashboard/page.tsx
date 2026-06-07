import { prisma } from "@/lib/db";
import { computeWorkload, type Subjective } from "@/lib/workload/score";
import { MemberCard } from "@/components/MemberCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const members = await prisma.user.findMany({
    where: { role: "MEMBER" },
    include: { tasks: true, team: true },
  });

  const rows = members
    .map((m) => ({
      member: m,
      workload: computeWorkload(
        m.tasks.map((t) => ({
          status: t.status,
          estimatedHours: t.estimatedHours,
          dueDate: t.dueDate,
        })),
        m.subjectiveLoad as Subjective
      ),
    }))
    // Overloaded members first.
    .sort((a, b) => b.workload.score - a.workload.score);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">チーム負荷ダッシュボード</h1>
      <p className="mb-6 text-sm text-slate-500">
        負荷の高い順に表示。色は 余裕 / 普通 / 高 / 逼迫。
      </p>

      {rows.length === 0 ? (
        <p className="text-slate-500">メンバーがいません。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <MemberCard
              key={r.member.id}
              id={r.member.id}
              name={r.member.name}
              teamName={r.member.team?.name}
              subjectiveLoad={r.member.subjectiveLoad as Subjective}
              workload={r.workload}
            />
          ))}
        </div>
      )}
    </main>
  );
}
