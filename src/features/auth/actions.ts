"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";

import {
  forgotPasswordSchema,
  loginSchema,
  mfaCodeSchema,
  mfaRecoverySchema,
  registerSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas";
import { auth } from "@/lib/auth";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; formErrors?: Record<string, string[]>; message?: string };

/** Só redireciona na mesma origem (caminho relativo) — evita open redirect. */
function safeRedirectPath(
  raw: string | null | FormDataEntryValue,
  fallback: string,
): string {
  if (typeof raw !== "string" || raw.trim() === "") return fallback;
  const s = raw.trim();
  if (!s.startsWith("/") || s.startsWith("//") || s.includes("://") || s.includes("..")) {
    return fallback;
  }
  return s;
}

function fieldErrors(parsed: { error: { flatten: () => { fieldErrors: Record<string, string[]> } } }) {
  return parsed.error.flatten().fieldErrors;
}

function authErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof APIError) {
    const code = err.body?.code;
    if (code === "INVALID_EMAIL_OR_PASSWORD") return "Email ou senha incorretos.";
    if (code === "USER_ALREADY_EXISTS") return "Já existe uma conta com este email.";
    if (code === "INVALID_TOKEN" || code === "EXPIRED_TOKEN") return "Link inválido ou expirado.";
    if (typeof err.body?.message === "string") return err.body.message;
  }
  return fallback;
}

export async function logoutAction(_formData?: FormData): Promise<void> {
  void _formData;
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

export async function loginAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<{ userId: string }>> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on" ? "on" : "off",
  });
  if (!parsed.success) {
    return { ok: false, formErrors: fieldErrors(parsed) as Record<string, string[]> };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        rememberMe: parsed.data.remember,
      },
      headers: await headers(),
    });
  } catch (err) {
    return { ok: false, message: authErrorMessage(err, "Falha ao iniciar sessão.") };
  }

  const nextPath = safeRedirectPath(formData.get("next"), "/dashboard");
  redirect(nextPath);
}

export async function registerAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<{ userId: string }>> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword") ?? formData.get("password"),
    acceptTos: (formData.get("acceptTos") as string | null) ?? "off",
  });
  if (!parsed.success) {
    return { ok: false, formErrors: fieldErrors(parsed) as Record<string, string[]> };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.name,
      },
      headers: await headers(),
    });
  } catch (err) {
    return { ok: false, message: authErrorMessage(err, "Não foi possível criar a conta.") };
  }

  redirect("/onboarding");
}

export async function forgotPasswordAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, formErrors: fieldErrors(parsed) as Record<string, string[]> };
  }

  try {
    await auth.api.requestPasswordReset({
      body: {
        email: parsed.data.email,
        redirectTo: "/reset-password",
      },
    });
  } catch {
    // Silenciamos erros aqui para não revelar se o email existe.
  }

  return {
    ok: true,
    data: {
      message: "Se existir uma conta para este email, enviamos instruções para redefinir a senha.",
    },
  };
}

export async function resetPasswordAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, formErrors: fieldErrors(parsed) as Record<string, string[]> };
  }

  try {
    await auth.api.resetPassword({
      body: { token: parsed.data.token, newPassword: parsed.data.password },
    });
  } catch (err) {
    return { ok: false, message: authErrorMessage(err, "Não foi possível redefinir a senha.") };
  }

  return { ok: true, data: { message: "Senha atualizada. Já pode iniciar sessão." } };
}

export async function verifyMfaAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<{ verified: true }>> {
  const parsed = mfaCodeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { ok: false, formErrors: fieldErrors(parsed) as Record<string, string[]> };
  }

  try {
    await auth.api.verifyTOTP({
      body: { code: parsed.data.code },
      headers: await headers(),
    });
  } catch (err) {
    return { ok: false, message: authErrorMessage(err, "Código inválido.") };
  }

  return { ok: true, data: { verified: true } };
}

export async function mfaRecoveryAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<{ verified: true }>> {
  const parsed = mfaRecoverySchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { ok: false, formErrors: fieldErrors(parsed) as Record<string, string[]> };
  }

  try {
    await auth.api.verifyBackupCode({
      body: { code: parsed.data.code },
      headers: await headers(),
    });
  } catch (err) {
    return { ok: false, message: authErrorMessage(err, "Código de recuperação inválido.") };
  }

  return { ok: true, data: { verified: true } };
}

export type LogoutFormState = { ok: boolean };

export async function logoutFormAction(
  _prev: LogoutFormState,
  _formData: FormData,
): Promise<LogoutFormState> {
  void _prev;
  void _formData;
  await auth.api.signOut({ headers: await headers() });
  return { ok: true };
}

export async function verifyEmailAction(token: string | null): Promise<ActionResult<{ message: string }>> {
  if (!token) {
    return { ok: false, message: "Token não fornecido." };
  }

  try {
    await auth.api.verifyEmail({
      query: { token },
      headers: await headers(),
    });
  } catch (err) {
    return { ok: false, message: authErrorMessage(err, "Link inválido ou expirado.") };
  }

  return { ok: true, data: { message: "Email verificado com sucesso." } };
}
