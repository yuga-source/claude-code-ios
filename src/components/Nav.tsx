import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function Nav() {
  const session = await auth();
  if (!session?.user) return null;

  const role = session.user.role;

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <span className="font-bold">チーム負荷管理</span>
        <div className="flex flex-1 gap-4 text-sm">
          {role === "MANAGER" && (
            <Link href="/dashboard" className="hover:underline">
              ダッシュボード
            </Link>
          )}
          {role === "MANAGER" && (
            <Link href="/import" className="hover:underline">
              CSV取込
            </Link>
          )}
          <Link href="/tasks" className="hover:underline">
            マイタスク
          </Link>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="text-sm text-slate-500 hover:text-slate-800">
            {session.user.name} / ログアウト
          </button>
        </form>
      </div>
    </nav>
  );
}
