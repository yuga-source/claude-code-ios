import Papa from "papaparse";
import type { ImportAdapter, RawTaskRecord } from "./types";

// First concrete adapter. Maps flexible column names to RawTaskRecord.
// Expected columns: external_id, title, assignee_email, estimated_hours,
//                   due_date, status, source_label
export const csvAdapter: ImportAdapter = {
  key: "csv",
  async parse(input: string): Promise<RawTaskRecord[]> {
    const result = Papa.parse<Record<string, string>>(input, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    });

    return result.data
      .map((row) => ({
        externalId: row.external_id || row.id || undefined,
        title: (row.title ?? "").trim(),
        assigneeEmail: (row.assignee_email ?? row.email ?? "").trim(),
        estimatedHours: row.estimated_hours
          ? Number(row.estimated_hours)
          : undefined,
        dueDate: row.due_date || undefined,
        status: row.status || undefined,
        sourceLabel: row.source_label || undefined,
      }))
      .filter((r) => r.title.length > 0);
  },
};
