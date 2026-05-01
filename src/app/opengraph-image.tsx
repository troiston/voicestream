import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

// OG 1200×630: composição com fundo sólido para legibilidade em partilhas; o logo-01 (PNG com alpha) é
// a marca definitiva — ver `public/brand/brief-logos.md`. (Redes não exigem, mas sólido evita “fundo fantasma”.)

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const LOGO = join(process.cwd(), "public/brand/logos/logo-01.png");

export default async function OpenGraphImage() {
  const buffer = await readFile(LOGO);
  const logoSrc = `data:image/png;base64,${buffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B1220",
          color: "#EAF0FF",
          padding: "64px",
          position: "relative",
          backgroundImage:
            "radial-gradient(900px 500px at 20% 30%, rgba(98, 116, 255, 0.28), transparent 60%), radial-gradient(800px 500px at 85% 70%, rgba(0, 212, 255, 0.18), transparent 55%)",
          backgroundColor: "#0B1220",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* next/og: img com data URL a partir de logo-01 (marca definitiva) */}
            <img
              src={logoSrc}
              width={100}
              height={100}
              style={{
                objectFit: "contain",
                flexShrink: 0,
              }}
              alt=""
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                VoiceStream
              </div>
              <div
                style={{ fontSize: "16px", color: "rgba(234,240,255,0.72)" }}
              >
                Copiloto de vida por Espaços
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: "56px",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
              }}
            >
              <div>Voz, texto e tarefa</div>
              <div>no mesmo painel</div>
            </div>
            <div
              style={{
                fontSize: "22px",
                color: "rgba(234,240,255,0.78)",
                maxWidth: "820px",
              }}
            >
              Foco em clareza, acessos por Espaço, evolução guiada pelo PRD — a Especificação técnica
              encaixa a seguir, com rigor.
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                fontSize: "14px",
                color: "rgba(234,240,255,0.84)",
              }}
            >
              Next.js
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                fontSize: "14px",
                color: "rgba(234,240,255,0.84)",
              }}
            >
              E2EE
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                fontSize: "14px",
                color: "rgba(234,240,255,0.84)",
              }}
            >
              pt-BR
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
