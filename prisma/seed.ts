import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DAY = 86_400_000;
const now = Date.now();
const inDays = (d: number) => new Date(now + d * DAY);

async function main() {
  // Clean slate (order matters due to FKs).
  await prisma.task.deleteMany();
  await prisma.importBatch.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  const passwordHash = await bcrypt.hash("password", 10);

  const team = await prisma.team.create({ data: { name: "営業チーム" } });

  await prisma.user.create({
    data: {
      email: "manager@example.com",
      name: "山田 (管理者)",
      passwordHash,
      role: "MANAGER",
      teamId: team.id,
    },
  });

  // Member 1 — OVERLOADED: many tasks, high hours, due very soon, self-report TIGHT.
  const m1 = await prisma.user.create({
    data: {
      email: "member1@example.com",
      name: "田中",
      passwordHash,
      role: "MEMBER",
      teamId: team.id,
      subjectiveLoad: "TIGHT",
    },
  });

  // Member 2 — HIGH-ish.
  const m2 = await prisma.user.create({
    data: {
      email: "member2@example.com",
      name: "佐藤",
      passwordHash,
      role: "MEMBER",
      teamId: team.id,
      subjectiveLoad: "NORMAL",
    },
  });

  // Member 3 — NORMAL.
  const m3 = await prisma.user.create({
    data: {
      email: "member3@example.com",
      name: "鈴木",
      passwordHash,
      role: "MEMBER",
      teamId: team.id,
      subjectiveLoad: "NORMAL",
    },
  });

  // Member 4 — RELAXED: few tasks, self-report RELAXED.
  const m4 = await prisma.user.create({
    data: {
      email: "member4@example.com",
      name: "高橋",
      passwordHash,
      role: "MEMBER",
      teamId: team.id,
      subjectiveLoad: "RELAXED",
    },
  });

  // Member 1 tasks — heavy load (mix of site-imported and manual).
  await prisma.task.createMany({
    data: [
      { title: "A業務 提案書作成", assigneeId: m1.id, estimatedHours: 8, dueDate: inDays(1), source: "CSV_IMPORT", externalId: "A-1001", externalSource: "業務サイトA" },
      { title: "A業務 見積もり対応", assigneeId: m1.id, estimatedHours: 6, dueDate: inDays(2), source: "CSV_IMPORT", externalId: "A-1002", externalSource: "業務サイトA" },
      { title: "B業務 顧客MTG準備", assigneeId: m1.id, estimatedHours: 5, dueDate: inDays(2), source: "CSV_IMPORT", externalId: "B-2001", externalSource: "業務サイトB" },
      { title: "B業務 報告書", assigneeId: m1.id, estimatedHours: 4, dueDate: inDays(3), source: "CSV_IMPORT", externalId: "B-2002", externalSource: "業務サイトB" },
      { title: "突発: 障害対応", assigneeId: m1.id, estimatedHours: 6, dueDate: inDays(1), source: "MANUAL" },
      { title: "C業務 資料レビュー", assigneeId: m1.id, estimatedHours: 3, dueDate: inDays(5), source: "CSV_IMPORT", externalId: "C-3001", externalSource: "業務サイトC" },
      { title: "週次レポート", assigneeId: m1.id, estimatedHours: 2, dueDate: inDays(4), source: "MANUAL", status: "IN_PROGRESS" },
    ],
  });

  // Member 2 tasks — moderately high.
  await prisma.task.createMany({
    data: [
      { title: "A業務 契約書確認", assigneeId: m2.id, estimatedHours: 4, dueDate: inDays(3), source: "CSV_IMPORT", externalId: "A-1101", externalSource: "業務サイトA" },
      { title: "B業務 データ集計", assigneeId: m2.id, estimatedHours: 6, dueDate: inDays(6), source: "CSV_IMPORT", externalId: "B-2101", externalSource: "業務サイトB" },
      { title: "突発: 問い合わせ対応", assigneeId: m2.id, estimatedHours: 3, dueDate: inDays(2), source: "MANUAL" },
      { title: "C業務 月次まとめ", assigneeId: m2.id, estimatedHours: 4, dueDate: inDays(10), source: "CSV_IMPORT", externalId: "C-3101", externalSource: "業務サイトC" },
    ],
  });

  // Member 3 tasks — normal.
  await prisma.task.createMany({
    data: [
      { title: "A業務 定例タスク", assigneeId: m3.id, estimatedHours: 3, dueDate: inDays(7), source: "CSV_IMPORT", externalId: "A-1201", externalSource: "業務サイトA" },
      { title: "資料整理", assigneeId: m3.id, estimatedHours: 2, dueDate: inDays(9), source: "MANUAL" },
      { title: "B業務 入力作業", assigneeId: m3.id, estimatedHours: 2, dueDate: inDays(12), source: "CSV_IMPORT", externalId: "B-2201", externalSource: "業務サイトB" },
    ],
  });

  // Member 4 tasks — relaxed.
  await prisma.task.createMany({
    data: [
      { title: "A業務 軽作業", assigneeId: m4.id, estimatedHours: 2, dueDate: inDays(11), source: "CSV_IMPORT", externalId: "A-1301", externalSource: "業務サイトA" },
      { title: "過去案件のクローズ", assigneeId: m4.id, estimatedHours: 1, source: "MANUAL", status: "DONE" },
    ],
  });

  console.log("Seed completed.");
  console.log("Login: manager@example.com / member1..4@example.com  (password: password)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
