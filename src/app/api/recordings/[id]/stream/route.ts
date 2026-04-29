import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/features/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const recording = await db.recording.findUnique({ where: { id }, select: { id: true, userId: true, spaceId: true } });
  if (!recording) return new Response("Not found", { status: 404 });

  // Permissão: dono do recording OU membro ativo do space
  const isOwner = recording.userId === session.userId;
  if (!isOwner) {
    const isMember = await db.spaceMember.findFirst({
      where: { spaceId: recording.spaceId, userId: session.userId, status: "active" },
      select: { id: true },
    });
    if (!isMember) return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let lastStatus = "";

      const send = (status: string, errorMessage?: string | null) => {
        const evt = `data: ${JSON.stringify({ status, errorMessage: errorMessage ?? null, ts: Date.now() })}\n\n`;
        controller.enqueue(encoder.encode(evt));
      };

      // Envio imediato do estado atual
      const initial = await db.recording.findUnique({ where: { id }, select: { status: true, errorMessage: true } });
      if (initial) {
        send(initial.status, initial.errorMessage);
        lastStatus = initial.status;
      }

      // Polling a cada 2s
      const interval = setInterval(async () => {
        try {
          const r = await db.recording.findUnique({ where: { id }, select: { status: true, errorMessage: true } });
          if (!r) {
            clearInterval(interval);
            controller.close();
            return;
          }
          if (r.status !== lastStatus) {
            send(r.status, r.errorMessage);
            lastStatus = r.status;
          }
          if (r.status === "summarized" || r.status === "failed") {
            clearInterval(interval);
            controller.enqueue(encoder.encode("event: end\ndata: {}\n\n"));
            controller.close();
          }
        } catch (e) {
          console.error("[recordings/stream] error", e);
          clearInterval(interval);
          controller.close();
        }
      }, 2000);

      // Cleanup quando o cliente desconectar
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
