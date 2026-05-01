import { db } from "@/lib/db";

/**
 * Soma minutos transcritos no mês corrente (UTC) para o user.
 */
export async function getMonthlyMinutesUsed(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );
  const result = await db.usage.aggregate({
    where: {
      userId,
      type: "minutes_transcribed",
      createdAt: { gte: startOfMonth },
    },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}
