// A normalized task record produced by any import adapter.
// Future site connectors (社内サーバー上のサイトAPI/DB) just need to emit these.
export interface RawTaskRecord {
  externalId?: string; // id in the originating site (enables idempotent re-import)
  title: string;
  assigneeEmail: string; // resolved to a User
  estimatedHours?: number;
  dueDate?: string; // parseable date string
  status?: string;
  sourceLabel?: string; // e.g. "業務サイトA"
}

export interface ImportAdapter {
  key: string; // "csv", later "siteA-api"
  parse(input: string): Promise<RawTaskRecord[]>;
}
