"use client";

import { useActionState } from "react";
import { authenticate } from "./actions";

export default function LoginPage() {
  const [errorMessage, formAction, pending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold">ログイン</h1>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            メールアドレス
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded border px-3 py-2"
            placeholder="manager@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">パスワード</label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded border px-3 py-2"
            placeholder="password"
          />
        </div>
        {errorMessage && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-slate-800 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "ログイン中..." : "ログイン"}
        </button>
      </form>
      <p className="mt-6 text-xs text-slate-500">
        デモ: manager@example.com / member1@example.com など（パスワードは
        password）
      </p>
    </main>
  );
}
