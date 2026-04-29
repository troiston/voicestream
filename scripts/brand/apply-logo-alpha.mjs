/**
 * Recorte do fundo claro em logo-01 (RGB) e gera icon/apple-icon.
 * Reexecutar: node scripts/brand/apply-logo-alpha.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");
const logoPath = path.join(root, "public/brand/logos/logo-01.png");

// Fundo: média dos 4 cantos (amostra prévia) — ajustar T_* se o export mudar
const Bg = { r: 244, g: 244, b: 243 };
const T_FULL = 45;
const T_EDGE = 95;

async function main() {
  const { data, info } = await sharp(logoPath)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  if (info.channels !== 3) {
    throw new Error(`expected RGB, got ${info.channels} channels`);
  }

  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      const o = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      const d = Math.hypot(r - Bg.r, g - Bg.g, b - Bg.b);
      if (d < T_FULL) {
        out[o + 3] = 0;
      } else if (d < T_EDGE) {
        out[o + 3] = Math.round(
          (255 * (d - T_FULL)) / (T_EDGE - T_FULL),
        );
      } else {
        out[o + 3] = 255;
      }
    }
  }

  const base = sharp(out, { raw: { width: w, height: h, channels: 4 } }).png({
    compressionLevel: 9,
  });

  await base.toFile(logoPath);
  // Ícones a partir do PNG com alpha (quadrado, contain)
  const work = await sharp(logoPath)
    .trim()
    .resize(512, 512, { fit: "inside", withoutEnlargement: true })
    .toBuffer();
  const iconPng = await sharp(work)
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const applePng = await sharp(work)
    .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const appDir = path.join(root, "src/app");
  await mkdir(appDir, { recursive: true });
  await writeFile(path.join(appDir, "icon.png"), iconPng);
  await writeFile(path.join(appDir, "apple-icon.png"), applePng);
  console.log("OK:", logoPath, "icon 32x32, apple 180x180");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
