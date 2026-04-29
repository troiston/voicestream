"use server";

import { createSpaceSchema } from "@/features/spaces/schemas";
import type { ActionResult } from "@/features/auth/actions";
import type { MockSpace } from "@/lib/mocks/spaces";

function delayMs(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type CreateSpaceState = ActionResult<{ space: MockSpace }> | null;

export async function createSpaceAction(
  _prev: CreateSpaceState,
  formData: FormData,
): Promise<CreateSpaceState> {
  await delayMs(350);
  const descRaw = formData.get("description");
  const description = typeof descRaw === "string" ? descRaw : "";
  const parsed = createSpaceSchema.safeParse({
    name: formData.get("name"),
    description,
  });
  if (!parsed.success) {
    return {
      ok: false,
      formErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const space: MockSpace = {
    id: `sp_${Date.now().toString(36)}`,
    name: parsed.data.name,
    description: parsed.data.description,
    lastActivity: new Date().toISOString(),
    members: 1,
    color: "oklch(58% 0.1 240)",
    icon: "new",
  };
  return { ok: true, data: { space } };
}
