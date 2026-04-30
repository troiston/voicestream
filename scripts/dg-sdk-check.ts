import "dotenv/config";
import { DeepgramClient } from "@deepgram/sdk";

async function main() {
  const client = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY ?? "" });
  try {
    const r = await client.listen.v1.media.transcribeUrl({
      url: "https://dpgr.am/spacewalk.wav",
      model: "nova-3",
      language: "en",
    });
    console.log("OK:", JSON.stringify(r).slice(0, 200));
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number; body?: unknown };
    console.log("ERR:", err.statusCode, err.message?.slice(0, 300));
  }
  process.exit(0);
}
main();
