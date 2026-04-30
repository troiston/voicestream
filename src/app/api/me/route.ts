import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// TODO: Schedule a cron job to hard-delete users where deletedAt < now() - 30 days.
// This endpoint only soft-deletes; physical removal must happen out-of-band to comply
// with LGPD retention requirements.
export async function DELETE() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const userId = session.user.id;

  await db.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });

  await db.session.deleteMany({ where: { userId } });

  try {
    await auth.api.signOut({ headers: reqHeaders });
  } catch {
    // sessions already removed above
  }

  return NextResponse.json({ ok: true });
}
