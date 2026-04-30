import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/features/auth/session";
import { presignPutUrl, getObjectKey } from "@/lib/storage/seaweed";
import { checkRecordingQuota } from "@/lib/billing/check-quota";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const bodySchema = z.object({
  spaceId: z.string().min(1, "spaceId é obrigatório"),
  contentType: z
    .enum(["audio/webm", "audio/mp4", "audio/mpeg", "audio/wav"])
    .default("audio/webm"),
  durationSec: z
    .number()
    .int("durationSec deve ser um inteiro")
    .positive("durationSec deve ser positivo")
    .max(7200, "durationSec não pode exceder 7200 segundos (2 horas)"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  const rl = await rateLimit(req, `recordings:${session.userId}`, 60, 60);
  if (!rl.ok) return rl.response;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    json = null;
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dados inválidos",
        issues: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  // Verificar se Space existe
  const space = await db.space.findUnique({
    where: { id: parsed.data.spaceId },
    select: { id: true, ownerId: true },
  });

  if (!space) {
    return NextResponse.json(
      { error: "Espaço não encontrado" },
      { status: 404 }
    );
  }

  // Verificar permissão: é owner OU membro ativo
  const isOwner = space.ownerId === session.userId;
  let isMember = isOwner;

  if (!isMember) {
    const member = await db.spaceMember.findFirst({
      where: {
        spaceId: space.id,
        userId: session.userId,
        status: "active",
      },
      select: { id: true },
    });
    isMember = Boolean(member);
  }

  if (!isMember) {
    return NextResponse.json(
      { error: "Sem permissão" },
      { status: 403 }
    );
  }

  // Verificar quota de gravação
  const quotaCheck = await checkRecordingQuota(session.userId, parsed.data.durationSec);
  if (!quotaCheck.allowed) {
    return NextResponse.json(
      {
        error: "Limite mensal de minutos atingido para o plano atual",
        plan: quotaCheck.plan,
        usedMinutes: quotaCheck.usedMinutes,
        limitMinutes: quotaCheck.limitMinutes,
        upgradeUrl: "/billing",
      },
      { status: 402 }
    );
  }

  // Mapear contentType para extensão
  const ext =
    parsed.data.contentType === "audio/mp4"
      ? "m4a"
      : parsed.data.contentType === "audio/mpeg"
        ? "mp3"
        : parsed.data.contentType === "audio/wav"
          ? "wav"
          : "webm";

  const storageKey = getObjectKey(`recordings/${session.userId}`, ext);
  const expiresInSec = 600;

  try {
    const uploadUrl = await presignPutUrl({
      key: storageKey,
      contentType: parsed.data.contentType,
      expiresInSec,
    });

    return NextResponse.json({
      uploadUrl,
      storageKey,
      expiresInSec,
    });
  } catch (error) {
    logger.error({ err: error }, "Erro ao gerar presigned URL");
    return NextResponse.json(
      { error: "Erro ao gerar URL de upload" },
      { status: 500 }
    );
  }
}
