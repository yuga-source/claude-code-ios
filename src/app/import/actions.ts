"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { csvAdapter } from "@/lib/import/csvAdapter";
import { runImport, type ImportResult } from "@/lib/import/pipeline";

export type ImportState = (ImportResult & { ok: boolean; error?: string }) | null;

export async function importCsv(
  _prev: ImportState,
  formData: FormData
): Promise<ImportState> {
  const session = await auth();
  if (session?.user?.role !== "MANAGER") {
    return { ok: false, created: 0, updated: 0, skipped: 0, errors: [], error: "権限がありません。" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      error: "CSVファイルを選択してください。",
    };
  }

  const text = await file.text();
  const records = await csvAdapter.parse(text);
  const result = await runImport(records, {
    adapterKey: csvAdapter.key,
    fileName: file.name,
    createdById: session.user.id,
  });

  revalidatePath("/dashboard");
  return { ok: true, ...result };
}
