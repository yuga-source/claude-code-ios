import { z } from "zod";
import { prisma } from "@/lib/db";
import type { RawTaskRecord } from "./types";

const recordSchema = z.object({
  externalId: z.string().min(1).optional(),
  title: z.string().min(1, "タイトルは必須です"),
  assigneeEmail: z.string().email("担当者メールが不正です"),
  estimatedHours: z.number().nonnegative().optional(),
  dueDate: z.string().optional(),
  status: z.string().optional(),
  sourceLabel: z.string().optional(),
});

function mapStatus(s?: string): "TODO" | "IN_PROGRESS" | "DONE" {
  switch ((s ?? "").trim().toLowerCase()) {
    case "done":
    case "完了":
      return "DONE";
    case "in_progress":
    case "進行中":
    case "doing":
      return "IN_PROGRESS";
    default:
      return "TODO";
  }
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

// Adapter-agnostic pipeline: validate -> resolve assignee -> upsert by
// (source, externalId). Re-importing the same site task UPDATES instead of
// duplicating — this is the anti-double-entry guarantee.
export async function runImport(
  records: RawTaskRecord[],
  opts: { adapterKey: string; fileName?: string; createdById: string }
): Promise<ImportResult> {
  const result: ImportResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  const batch = await prisma.importBatch.create({
    data: {
      adapterKey: opts.adapterKey,
      fileName: opts.fileName,
      createdById: opts.createdById,
      rowCount: records.length,
    },
  });

  for (let i = 0; i < records.length; i++) {
    const parsed = recordSchema.safeParse(records[i]);
    if (!parsed.success) {
      result.skipped++;
      result.errors.push({
        row: i + 1,
        message: parsed.error.issues[0]?.message ?? "不正な行",
      });
      continue;
    }

    const rec = parsed.data;
    const assignee = await prisma.user.findUnique({
      where: { email: rec.assigneeEmail },
    });
    if (!assignee) {
      result.skipped++;
      result.errors.push({
        row: i + 1,
        message: `担当者が見つかりません: ${rec.assigneeEmail}`,
      });
      continue;
    }

    const data = {
      title: rec.title,
      assigneeId: assignee.id,
      estimatedHours: rec.estimatedHours ?? 0,
      dueDate: rec.dueDate ? new Date(rec.dueDate) : null,
      status: mapStatus(rec.status),
      source: "CSV_IMPORT" as const,
      externalSource: rec.sourceLabel ?? null,
      importBatchId: batch.id,
    };

    if (rec.externalId) {
      const existing = await prisma.task.findUnique({
        where: {
          source_externalId: {
            source: "CSV_IMPORT",
            externalId: rec.externalId,
          },
        },
      });
      if (existing) {
        await prisma.task.update({ where: { id: existing.id }, data });
        result.updated++;
      } else {
        await prisma.task.create({
          data: { ...data, externalId: rec.externalId },
        });
        result.created++;
      }
    } else {
      await prisma.task.create({ data });
      result.created++;
    }
  }

  return result;
}
