import { db } from "@/lib/db";

async function main() {
  const u = await db.user.findFirst({ where: { email: "demo@voicestream.app" } });
  if (!u) { console.log("no user"); process.exit(1); }
  const s = await db.space.findFirst({ where: { ownerId: u.id } });
  console.log(JSON.stringify({ userId: u.id, spaceId: s?.id }));
  process.exit(0);
}
main();
