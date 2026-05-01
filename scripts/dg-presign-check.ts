import "dotenv/config";
import { presignGetUrl } from "@/lib/storage/seaweed";

async function main() {
  const url = await presignGetUrl({
    key: "recordings/r3c4NPlQYggRskjHqEZFiBFE1IauIfA8/faf7d068-5ba4-4ef3-9132-f007222b5e1d.wav",
    expiresInSec: 3600,
  });
  console.log("URL:", url);
  const r = await fetch(url);
  console.log("status:", r.status, "len:", (await r.arrayBuffer()).byteLength);
  process.exit(0);
}
main();
