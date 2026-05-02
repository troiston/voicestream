"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  bio: z.string().trim().max(500).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
});

export async function updateProfile(input: unknown) {
  const session = await requireSession();
  const data = updateProfileSchema.parse(input);

  await db.user.update({
    where: { id: session.userId },
    data: {
      name: data.name,
      bio: data.bio || null,
      phone: data.phone || null,
    },
  });

  revalidatePath("/settings");
  return { ok: true };
}

const prefsSchema = z.record(z.string(), z.boolean());

export async function updateNotificationPrefs(prefs: unknown) {
  const session = await requireSession();
  const data = prefsSchema.parse(prefs);

  await db.user.update({
    where: { id: session.userId },
    data: { notificationPrefs: data },
  });

  revalidatePath("/settings");
  return { ok: true };
}
