"use server";

import { z } from "zod";

import type { MockTask, TaskPriority } from "@/lib/mocks/tasks";

export type CreateTaskActionState =
  | { status: "idle" }
  | { status: "success"; task: MockTask }
  | { status: "error"; formErrors: Record<string, string[]>; message?: string };

function fdStr(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}

const createTaskSchema = z.object({
  title: z.string().min(2, "Mínimo de 2 caracteres.").max(120, "Máximo de 120 caracteres."),
  description: z.string().max(2000, "Máximo de 2000 caracteres."),
  priority: z.enum(["baixa", "media", "alta"] satisfies readonly TaskPriority[]),
  status: z.enum(["pendente", "em_curso"]),
  dueAt: z
    .string()
    .transform((s) => (s.trim().length > 0 ? s.trim() : ""))
    .refine((s) => s === "" || /^\d{4}-\d{2}-\d{2}$/.test(s), {
      message: "Use o formato AAAA-MM-DD.",
    }),
});

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

function newId(): string {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function createTaskAction(
  _prev: CreateTaskActionState,
  formData: FormData,
): Promise<CreateTaskActionState> {
  const honeypot = formData.get("company");
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { status: "error", formErrors: {}, message: "Pedido rejeitado (mock anti-spam)." };
  }

  const statusRaw = fdStr(formData.get("status"));
  const statusNorm = statusRaw === "em_curso" ? "em_curso" : "pendente";

  const parsed = createTaskSchema.safeParse({
    title: fdStr(formData.get("title")),
    description: fdStr(formData.get("description")),
    priority: fdStr(formData.get("priority")),
    status: statusNorm,
    dueAt: fdStr(formData.get("dueAt")),
  });

  if (!parsed.success) {
    return {
      status: "error",
      formErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await sleep(380);

  const due = parsed.data.dueAt === "" ? null : parsed.data.dueAt;
  const task: MockTask = {
    id: newId(),
    title: parsed.data.title,
    description: parsed.data.description,
    priority: parsed.data.priority,
    status: parsed.data.status,
    dueAt: due,
  };

  return { status: "success", task };
}
