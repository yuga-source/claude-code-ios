import { updateTaskStatus, deleteTask } from "@/app/tasks/actions";

type TaskRow = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  estimatedHours: number;
  dueDate: Date | null;
  source: "MANUAL" | "CSV_IMPORT";
  externalSource?: string | null;
};

const STATUS_LABEL: Record<TaskRow["status"], string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
};

function SourceBadge({ task }: { task: TaskRow }) {
  if (task.source === "MANUAL") {
    return (
      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
        手入力
      </span>
    );
  }
  return (
    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">
      {task.externalSource || "サイト取込"}
    </span>
  );
}

export function TaskList({
  tasks,
  editable,
}: {
  tasks: TaskRow[];
  editable: boolean;
}) {
  if (tasks.length === 0) {
    return <p className="text-sm text-slate-400">タスクはありません。</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li
          key={t.id}
          className={`rounded border bg-white p-3 ${
            t.status === "DONE" ? "opacity-60" : ""
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{t.title}</span>
            <SourceBadge task={t} />
            <span className="ml-auto text-xs text-slate-400">
              {STATUS_LABEL[t.status]}
            </span>
          </div>
          <div className="mt-1 flex gap-4 text-xs text-slate-500">
            <span>工数 {t.estimatedHours}h</span>
            <span>
              締切{" "}
              {t.dueDate
                ? new Date(t.dueDate).toLocaleDateString("ja-JP")
                : "なし"}
            </span>
          </div>

          {editable && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <form action={updateTaskStatus} className="flex items-center gap-1">
                <input type="hidden" name="id" value={t.id} />
                <select
                  name="status"
                  defaultValue={t.status}
                  className="rounded border px-1.5 py-1 text-xs"
                >
                  <option value="TODO">未着手</option>
                  <option value="IN_PROGRESS">進行中</option>
                  <option value="DONE">完了</option>
                </select>
                <button className="rounded border px-2 py-1 text-xs hover:bg-slate-50">
                  更新
                </button>
              </form>
              <form action={deleteTask}>
                <input type="hidden" name="id" value={t.id} />
                <button className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                  削除
                </button>
              </form>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
