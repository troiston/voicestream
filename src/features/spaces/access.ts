import { db } from "@/lib/db";

/**
 * Retorna IDs de Espaços que o usuário acessa (owner ou active member).
 */
export async function getAccessibleSpaceIds(userId: string): Promise<string[]> {
  const [ownedSpaces, memberSpaces] = await Promise.all([
    db.space.findMany({
      where: { ownerId: userId },
      select: { id: true },
    }),
    db.spaceMember.findMany({
      where: { userId, status: "active" },
      select: { spaceId: true },
    }),
  ]);

  const ownedIds = ownedSpaces.map((s) => s.id);
  const memberIds = memberSpaces.map((m) => m.spaceId);
  return [...new Set([...ownedIds, ...memberIds])];
}
