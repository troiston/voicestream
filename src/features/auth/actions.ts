"use server";

import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  loginSchema,
  mfaCodeSchema,
  mfaRecoverySchema,
  registerSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas";
import { clearSession, getSession, setSession, type MockSession } from "@/features/auth/session";
import { mockUserFromEmail } from "@/lib/mocks/users";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; formErrors?: Record<string, string[]>; message?: string };

/** Evita inlining estático de `process.env.*` no bundle do servidor (Turbopack/Webpack). */
function env(name: "E2E_DETERMINISTIC_AUTH" | "NODE_ENV"): string | undefined {
  const proc = globalThis.process as { env?: Record<string, string | undefined> } | undefined;
  return proc?.env?.[name];
}

function pickOutcome():
  | "success"
  | "conflict"
  | "error" {
  if (env("E2E_DETERMINISTIC_AUTH") === "1") {
    return "success";
  }
  const r = Math.random();
  if (r < 0.6) {
    return "success";
  }
  if (r < 0.9) {
    return "conflict";
  }
  return "error";
}

/**
 * Em `next dev`, emails usados pelos testes Playwright ignoram a aleatoriedade do mock
 * (útil quando `reuseExistingServer` não repõe `E2E_DETERMINISTIC_AUTH` no processo).
 * Nunca activo em produção.
 */
function isPlaywrightDeterministicEmail(email: string): boolean {
  if (env("NODE_ENV") === "production") {
    return false;
  }
  const e = email.trim().toLowerCase();
  if (e === "playwright@example.com") {
    return true;
  }
  return /^pw-\d+@example\.com$/i.test(e);
}

/** Só redireciona na mesma origem (caminho relativo) — evita open redirect. */
function safeRedirectPath(
  raw: string | null | FormDataEntryValue,
  fallback: string,
): string {
  if (typeof raw !== "string" || raw.trim() === "") {
    return fallback;
  }
  const s = raw.trim();
  if (!s.startsWith("/") || s.startsWith("//") || s.includes("://") || s.includes("..")) {
    return fallback;
  }
  return s;
}

function delayMs(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function logoutAction(_formData?: FormData): Promise<void> {
  void _formData;
  await clearSession();
  redirect("/login");
}

export async function loginAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<{ user: MockSession }>> {
  await delayMs(400);
  const remember: "on" | "off" = formData.get("remember") === "on" ? "on" : "off";
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember,
  });
  if (!parsed.success) {
    return { ok: false, formErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const outcome = isPlaywrightDeterministicEmail(parsed.data.email) ? "success" : pickOutcome();
  if (outcome === "conflict") {
    return {
      ok: false,
      message: "Email ou senha incorretos (simulação: conflito 30%).",
    };
  }
  if (outcome === "error") {
    return { ok: false, message: "Falha temporária. Tente novamente (simulação 10%)." };
  }
  const u = mockUserFromEmail(parsed.data.email);
  const session: MockSession = {
    userId: u.id,
    email: u.email,
    name: u.name,
    emailVerified: u.emailVerified,
    role: "admin",
    mfaVerified: false,
  };
  await setSession(session);
  const nextPath = safeRedirectPath(formData.get("next"), "/dashboard");
  redirect(nextPath);
}

export async function registerAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<{ user: MockSession }>> {
  await delayMs(500);
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    acceptTos: (formData.get("acceptTos") as string | null) ?? "off",
  });
  if (!parsed.success) {
    return { ok: false, formErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const outcome = isPlaywrightDeterministicEmail(parsed.data.email) ? "success" : pickOutcome();
  if (outcome === "conflict") {
    return { ok: false, message: "Já existe uma conta com este email (simulação 30%)." };
  }
  if (outcome === "error") {
    return { ok: false, message: "Não foi possível concluir o registo. Tente mais tarde." };
  }
  const u = mockUserFromEmail(parsed.data.email, parsed.data.name);
  const session: MockSession = {
    userId: u.id,
    email: u.email,
    name: u.name,
    emailVerified: false,
    role: "admin",
    mfaVerified: false,
  };
  await setSession(session);
  redirect("/onboarding");
}

export async function forgotPasswordAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  await delayMs(350);
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, formErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  return {
    ok: true,
    data: {
      message: "Se existir uma conta para este email, enviámos instruções para redefinir a senha.",
    },
  };
}

export async function resetPasswordAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  await delayMs(400);
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, formErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const t = parsed.data.token;
  if (t === "expired" || t.endsWith("-expired")) {
    return { ok: false, message: "O link de recuperação expirou. Peça um novo." };
  }
  return { ok: true, data: { message: "Senha atualizada. Já pode iniciar sessão." } };
}

export async function verifyMfaAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  await delayMs(300);
  const parsed = mfaCodeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { ok: false, formErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  if (parsed.data.code === "000000") {
    return { ok: false, message: "Código inválido" };
  }
  await updateSessionMfa();
  return { ok: true, data: { verified: true } };
}

export async function mfaRecoveryAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  await delayMs(300);
  const parsed = mfaRecoverySchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { ok: false, formErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  await updateSessionMfa();
  return { ok: true, data: { verified: true } };
}

async function updateSessionMfa() {
  const s = await getSession();
  if (s) {
    await setSession({ ...s, mfaVerified: true });
  }
}

export type LogoutFormState = { ok: boolean };

export async function logoutFormAction(
  _prev: LogoutFormState,
  _formData: FormData,
): Promise<LogoutFormState> {
  void _prev;
  void _formData;
  await clearSession();
  return { ok: true };
}
