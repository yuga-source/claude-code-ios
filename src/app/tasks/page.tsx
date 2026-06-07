import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeWorkload, type Subjective } from "@/lib/workload/score";
import { LoadBadge } from "@/components/LoadBadge";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { SubjectiveLoadControl } from "@/components/SubjectiveLoadControl";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { tasks: { orderBy: [{ status: "asc" }, { dueDate: "asc" }] } },
  });
  if (!me) redirect("/login");

  const workload = computeWorkload(
    me.tasks.map((t) => ({
      status: t.status,
      estimatedHours: t.estimatedHours,
      dueDate: t.dueDate,
    })),
    me.subjectiveLoad as Subjective
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">マイタスク</h1>
        <LoadBadge level={workload.level} />
        <span className="text-sm text-slate-400">
          未完了 {workload.raw.openCount}件 / 工数 {workload.raw.totalHours}h
        </span>
      </div>

      <div className="mb-6">
        <SubjectiveLoadControl current={me.subjectiveLoad as Subjective} />
      </div>

      <h2 className="mb-2 font-semibold">突発業務を追加</h2>
      <div className="mb-6">
        <TaskForm />
      </div>

      <h2 className="mb-2 font-semibold">タスク一覧</h2>
      <TaskList tasks={me.tasks} editable />
    </main>
  );
}
