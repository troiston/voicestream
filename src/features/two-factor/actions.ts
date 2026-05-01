"use server";

import { headers } from "next/headers";
import { APIError } from "better-auth/api";

import { auth } from "@/lib/auth";

function twoFactorErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof APIError) {
    const code = err.body?.code as string | undefined;
    if (code === "INVALID_PASSWORD") return "Senha incorreta.";
    if (code === "TWO_FACTOR_NOT_ENABLED") return "2FA não está ativado.";
    if (code === "TOTP_NOT_ENABLED") return "TOTP não configurado.";
    if (code === "INVALID_CODE") return "Código inválido. Tente novamente.";
    if (typeof err.body?.message === "string") return err.body.message;
  }
  return fallback;
}

/** Inicia enrollment: gera secret + URI otpauth. Retorna também backupCodes (gerados pelo better-auth). */
export async function startTwoFactorEnrollment(
  password: string,
): Promise<{ totpURI: string; backupCodes: string[] } | { error: string }> {
  try {
    const result = await auth.api.enableTwoFactor({
      body: { password },
      headers: await headers(),
    });
    return { totpURI: result.totpURI, backupCodes: result.backupCodes };
  } catch (err) {
    return { error: twoFactorErrorMessage(err, "Falha ao iniciar configuração de 2FA.") };
  }
}

/** Verifica código TOTP durante enrollment (não durante login). */
export async function verifyTwoFactorCode(
  code: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    await auth.api.verifyTOTP({
      body: { code },
      headers: await headers(),
    });
    return { ok: true };
  } catch (err) {
    return { error: twoFactorErrorMessage(err, "Código inválido ou expirado.") };
  }
}

/** Desabilita 2FA exigindo senha atual. */
export async function disableTwoFactor(
  password: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    await auth.api.disableTwoFactor({
      body: { password },
      headers: await headers(),
    });
    return { ok: true };
  } catch (err) {
    return { error: twoFactorErrorMessage(err, "Falha ao desativar 2FA.") };
  }
}
