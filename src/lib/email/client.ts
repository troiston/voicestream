import { Resend } from "resend";
import type { ReactElement } from "react";

import { env } from "@/lib/env";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!env.RESEND_API_KEY) {
    throw new Error(
      "[email] RESEND_API_KEY não está configurado. Defina a variável de ambiente para enviar emails."
    );
  }
  if (!_resend) {
    _resend = new Resend(env.RESEND_API_KEY);
  }
  return _resend;
}

export type SendEmailResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}): Promise<SendEmailResult> {
  // Dev fallback: log instead of sending when no API key is set
  if (env.NODE_ENV !== "production" && !env.RESEND_API_KEY) {
    console.log(
      `[email:dev] Para: ${to} | Assunto: ${subject} | (sem RESEND_API_KEY, email não enviado)`
    );
    return { ok: true, id: "dev-no-send" };
  }

  const from = env.RESEND_FROM ?? "VoiceStream <noreply@voicestream.com.br>";

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({ from, to, subject, react });

    if (error) {
      console.error("[email] Erro ao enviar email:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Exceção ao enviar email:", message);
    return { ok: false, error: message };
  }
}
