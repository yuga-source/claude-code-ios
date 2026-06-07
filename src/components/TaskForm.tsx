import { createTask } from "@/app/tasks/actions";

// Ad-hoc / 突発業務 entry. Created tasks are tagged source = MANUAL.
export function TaskForm() {
  return (
    <form
      action={createTask}
      className="grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm font-medium">タイトル</label>
        <input
          name="title"
          required
          className="w-full rounded border px-3 py-2"
          placeholder="突発業務など"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">見積もり工数(h)</label>
        <input
          name="estimatedHours"
          type="number"
          min="0"
          step="0.5"
          defaultValue="1"
          className="w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">締切</label>
        <input
          name="dueDate"
          type="date"
          className="w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">状態</label>
        <select name="status" className="w-full rounded border px-3 py-2">
          <option value="TODO">未着手</option>
          <option value="IN_PROGRESS">進行中</option>
          <option value="DONE">完了</option>
        </select>
      </div>
      <div className="flex items-end">
        <button className="w-full rounded bg-slate-800 py-2 text-white hover:bg-slate-700">
          タスクを追加
        </button>
      </div>
    </form>
  );
}
