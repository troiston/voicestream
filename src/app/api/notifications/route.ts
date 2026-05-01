import { NextResponse } from "next/server";
import { requireSession } from "@/features/auth/guards";

export async function GET() {
  await requireSession();
  // Notifications model ainda não existe — retornar lista vazia.
  return NextResponse.json({ notifications: [] });
}
