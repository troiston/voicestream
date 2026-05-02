import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await ctx.params;

    const invite = await db.spaceInvite.findUnique({ where: { id } });

    if (!invite) {
      return NextResponse.json(
        { error: "Convite não encontrado" },
        { status: 404 }
      );
    }

    // Permission check: caller must be the inviter
    if (invite.invitedByUserId !== session.userId) {
      return NextResponse.json(
        { error: "Sem permissão" },
        { status: 403 }
      );
    }

    // TODO: Implement email resend via Resend API
    // For now, just update the resentAt timestamp
    await db.spaceInvite.update({
      where: { id },
      data: { createdAt: new Date() }, // Placeholder: update createdAt to track resend
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[team/invitations/resend] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
