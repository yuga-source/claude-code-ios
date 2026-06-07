"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("unauthenticated");
  return session.user;
}

function revalidate() {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

const taskSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  estimatedHours: z.coerce.number().nonnegative().default(0),
  dueDate: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
});

export async function createTask(formData: FormData) {
  const user = await requireUser();
  const data = taskSchema.parse({
    title: formData.get("title"),
    estimatedHours: formData.get("estimatedHours") || 0,
    dueDate: formData.get("dueDate") || undefined,
    status: formData.get("status") || "TODO",
  });

  await prisma.task.create({
    data: {
      title: data.title,
      estimatedHours: data.estimatedHours,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: data.status,
      source: "MANUAL",
      assigneeId: user.id,
    },
  });
  revalidate();
}

async function ownedTask(id: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.assigneeId !== userId) throw new Error("forbidden");
  return task;
}

export async function updateTaskStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const status = z
    .enum(["TODO", "IN_PROGRESS", "DONE"])
    .parse(formData.get("status"));
  await ownedTask(id, user.id);
  await prisma.task.update({ where: { id }, data: { status } });
  revalidate();
}

export async function deleteTask(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await ownedTask(id, user.id);
  await prisma.task.delete({ where: { id } });
  revalidate();
}

export async function setSubjectiveLoad(formData: FormData) {
  const user = await requireUser();
  const value = z
    .enum(["RELAXED", "NORMAL", "TIGHT"])
    .parse(formData.get("subjectiveLoad"));
  await prisma.user.update({
    where: { id: user.id },
    data: { subjectiveLoad: value, subjectiveLoadUpdatedAt: new Date() },
  });
  revalidate();
}
