"use server";
import { db } from "@/lib/db";

export async function purgeDeletedUsers(): Promise<{ deleted: number }> {
  const cutoff = new Date(Date.now() - 30 * 86400000); // 30 days ago

  // User.deletedAt exists in schema (DateTime? field), safe to query
  const res = await db.user.deleteMany({
    where: {
      deletedAt: {
        lt: cutoff,
        not: null,
      },
    },
  });

  return { deleted: res.count };
}
