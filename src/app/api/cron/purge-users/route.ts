import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { purgeDeletedUsers } from "@/features/admin/cleanup";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await purgeDeletedUsers();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[cron/purge-users] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
