"use client";

import { useActionState } from "react";
import { importCsv, type ImportState } from "./actions";

const initial: ImportState = null;

export default function ImportPage() {
  const [state, formAction, pending] = useActionState(importCsv, initial);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">CSV取込</h1>
      <p className="mb-6 text-sm text-slate-500">
        各サイトのエクスポートCSVを取り込みます。同じ external_id
        の行は重複作成されず更新されます（2度手間防止）。
      </p>

      <form action={formAction} className="space-y-4 rounded-lg border bg-white p-4">
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm"
        />
        <button
          disabled={pending}
          className="rounded bg-slate-800 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "取込中..." : "取り込む"}
        </button>
      </form>

      {state?.error && (
        <p className="mt-4 text-sm text-red-600">{state.error}</p>
      )}

      {state?.ok && (
        <div className="mt-6 rounded-lg border bg-white p-4">
          <h2 className="mb-2 font-semibold">取込結果</h2>
          <ul className="flex gap-6 text-sm">
            <li>
              新規 <span className="font-bold">{state.created}</span>
            </li>
            <li>
              更新 <span className="font-bold">{state.updated}</span>
            </li>
            <li>
              スキップ <span className="font-bold">{state.skipped}</span>
            </li>
          </ul>
          {state.errors.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-xs font-semibold text-red-600">
                エラー行:
              </div>
              <ul className="space-y-0.5 text-xs text-slate-500">
                {state.errors.map((e, i) => (
                  <li key={i}>
                    {e.row}行目: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-xs text-slate-400">
        <p className="font-semibold">CSV列フォーマット:</p>
        <code className="block">
          external_id, title, assignee_email, estimated_hours, due_date, status,
          source_label
        </code>
      </div>
    </main>
  );
}
