import "dotenv/config";

async function main() {
  const key = process.env.DEEPGRAM_API_KEY ?? "";
  console.log("len:", key.length, "prefix:", key.slice(0, 8), "suffix:", key.slice(-4));
  console.log("hasSpace:", /\s/.test(key), "hasQuote:", /["']/.test(key));

  const wav = Buffer.alloc(44);
  wav.write("RIFF", 0); wav.writeUInt32LE(36, 4); wav.write("WAVE", 8); wav.write("fmt ", 12);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(16000, 24); wav.writeUInt32LE(32000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write("data", 36); wav.writeUInt32LE(0, 40);

  const r = await fetch("https://api.deepgram.com/v1/listen?model=nova-3", {
    method: "POST",
    headers: { Authorization: `Token ${key}`, "Content-Type": "audio/wav" },
    body: wav,
  });
  console.log("listen:", r.status, (await r.text()).slice(0, 300));

  const p = await fetch("https://api.deepgram.com/v1/projects", {
    headers: { Authorization: `Token ${key}` },
  });
  console.log("projects:", p.status);
  process.exit(0);
}
main();
