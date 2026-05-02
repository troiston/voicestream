import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/features/auth/session";
import { headObject, getObjectBytes, putObjectBytes } from "@/lib/storage/seaweed";
import { Prisma } from "@/generated/prisma/client";
import { enqueueTranscribe } from "@/lib/queue";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { encryptAudio } from "@/lib/crypto/envelope";

const bodySchema = z.object({
  spaceId: z.string().min(1, "spaceId é obrigatório"),
  storageKey: z
    .string()
    .regex(
      /^recordings\/.+\/.+\.(webm|mp4|m4a|mp3|wav)$/,
      "storageKey inválido"
    ),
  durationSec: z
    .number()
    .int("durationSec deve ser um inteiro")
    .positive("durationSec deve ser positivo"),
  mimeType: z.string().default("audio/webm"),
  language: z.string().default("pt-BR"),
  title: z.string().max(200).nullable().optional(),
  capturedAt: z.string().datetime("capturedAt deve ser ISO datetime"),
});

export async function POST(req: NextRequest) {
  // 1. Validar sessão
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const rl = await rateLimit(req, `recordings:${session.userId}`, 60, 60);
  if (!rl.ok) return rl.response;

  // 2. Validar body
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    json = null;
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { spaceId, storageKey, durationSec, mimeType, language, title, capturedAt } =
    parsed.data;

  // 2.5. Verificar que o storageKey pertence ao caller
  const storageKeyOwner = storageKey.split("/")[1];
  if (storageKeyOwner !== session.userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // 3. Verificar Space + permissão
  const space = await db.space.findUnique({
    where: { id: spaceId },
    select: { id: true, ownerId: true },
  });

  if (!space) {
    return NextResponse.json({ error: "Espaço não encontrado" }, { status: 404 });
  }

  const isOwner = space.ownerId === session.userId;
  let hasAccess = isOwner;

  if (!hasAccess) {
    const member = await db.spaceMember.findFirst({
      where: { spaceId: space.id, userId: session.userId, status: "active" },
      select: { id: true },
    });
    hasAccess = Boolean(member);
  }

  if (!hasAccess) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // 4. Verificar storage (best-effort: se SeaweedFS via CDN der erro genérico,
  // não bloqueia — o getObjectBytes a seguir vai falhar de qualquer forma se
  // o objeto não existir, e lá já temos tratamento.)
  try {
    const head = await headObject({ key: storageKey });
    if (!head.exists) {
      return NextResponse.json(
        { error: "Upload não detectado no storage" },
        { status: 400 }
      );
    }
  } catch (err) {
    const e = err as { name?: string; code?: string; message?: string; $metadata?: { httpStatusCode?: number } };
    logger.warn(
      { name: e.name, code: e.code, message: e.message, status: e.$metadata?.httpStatusCode },
      "[recordings] headObject error (non-fatal, prosseguindo)",
    );
  }

  // 4.5. Encrypt audio at rest (envelope encryption, AES-256-GCM)
  let encryptionMeta: Prisma.InputJsonValue;
  try {
    const plaintext = await getObjectBytes({ key: storageKey });
    const { ciphertext, meta } = encryptAudio(plaintext);
    await putObjectBytes({ key: storageKey, body: ciphertext, contentType: "application/octet-stream" });
    encryptionMeta = meta as unknown as Prisma.InputJsonValue;
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    logger.error({ err, detail }, "[recordings] encryption failed");
    return NextResponse.json({ error: "Falha ao cifrar áudio", detail, stage: "encrypt" }, { status: 500 });
  }

  // 5. Criar Recording
  let recording: { id: string; spaceId: string; status: string; storageKey: string; capturedAt: Date };
  try {
    recording = await db.recording.create({
      data: {
        spaceId,
        userId: session.userId,
        title: title ?? null,
        storageKey,
        durationSec,
        mimeType,
        language,
        status: "uploaded",
        capturedAt: new Date(capturedAt),
        encryptionMeta,
      },
      select: {
        id: true,
        spaceId: true,
        status: true,
        storageKey: true,
        capturedAt: true,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Já existe uma gravação com este storageKey" },
        { status: 409 }
      );
    }
    const detail = err instanceof Error ? err.message : "unknown";
    logger.error({ err, detail }, "[recordings] Erro ao criar Recording");
    return NextResponse.json({ error: "Erro interno", detail, stage: "db" }, { status: 500 });
  }

  // 6. Enfileirar job de transcrição
  try {
    await enqueueTranscribe(recording.id);
  } catch (e) {
    // Não falhe a request por causa da queue (resiliência)
    logger.error({ err: e }, "[recordings] enqueue failed");
  }

  // AuditLog (resiliente)
  try {
    const ipAddress =
      req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;
    await db.auditLog.create({
      data: {
        userId: session.userId,
        action: "recording.create",
        entityType: "Recording",
        entityId: recording.id,
        ipAddress,
        userAgent,
      },
    });
  } catch (auditErr) {
    logger.error({ err: auditErr }, "[recordings] Falha ao gravar AuditLog");
  }

  // 7. Retornar 201
  return NextResponse.json(
    {
      id: recording.id,
      spaceId: recording.spaceId,
      status: recording.status,
      storageKey: recording.storageKey,
      capturedAt: recording.capturedAt.toISOString(),
    },
    { status: 201 }
  );
}
