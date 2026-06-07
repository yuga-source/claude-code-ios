import { setSubjectiveLoad } from "@/app/tasks/actions";
import { type Subjective } from "@/lib/workload/score";

const OPTIONS: { value: Subjective; label: string; active: string }[] = [
  { value: "RELAXED", label: "余裕", active: "bg-green-600 text-white" },
  { value: "NORMAL", label: "普通", active: "bg-slate-600 text-white" },
  { value: "TIGHT", label: "逼迫", active: "bg-red-600 text-white" },
];

// Progressive-enhancement form: each button submits a self-report value.
export function SubjectiveLoadControl({ current }: { current: Subjective }) {
  return (
    <form action={setSubjectiveLoad} className="flex items-center gap-2">
      <span className="text-sm text-slate-500">自分の負荷感:</span>
      <div className="flex overflow-hidden rounded border">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            name="subjectiveLoad"
            value={o.value}
            className={`px-3 py-1 text-sm ${
              current === o.value ? o.active : "bg-white hover:bg-slate-50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </form>
  );
}
