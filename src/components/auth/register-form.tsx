"use client";

import { useActionState, useId, useState } from "react";
import { registerAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert } from "@/components/ui/alert";
import type { ActionResult } from "@/features/auth/actions";

type St = ActionResult<unknown> | null;

function calculatePasswordStrength(pw: string): number {
  if (!pw) return 0;
  const checks = [
    pw.length >= 8,
    /[A-Z]/.test(pw),
    /[0-9]/.test(pw),
    /[^A-Za-z0-9]/.test(pw),
  ];
  return checks.filter(Boolean).length;
}

function getStrengthLabel(score: number): string {
  const labels = ["", "Muito fraca", "Fraca", "Boa", "Forte"];
  return labels[score] || "";
}

function getStrengthColor(score: number): string {
  const colors = ["", "bg-danger", "bg-warning", "bg-warning", "bg-success"];
  return colors[score] || "";
}

interface PasswordStrengthProps {
  password: string;
}

function PasswordStrength({ password }: PasswordStrengthProps) {
  const score = calculatePasswordStrength(password);
  const label = getStrengthLabel(score);
  const color = getStrengthColor(score);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score ? color : "bg-surface-3"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Força da senha: {label}</p>
    </div>
  );
}

export function RegisterForm() {
  const [st, act, p] = useActionState(registerAction, null as St);
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const cb = useId();
  const passwordsMatch = pw && pwConfirm ? pw === pwConfirm : null;

  return (
    <form action={act} className="mt-2 space-y-3 text-left">
      <Input
        name="name"
        id="reg-name"
        required
        minLength={2}
        maxLength={100}
        autoComplete="name"
        label="O seu nome"
        error={st && !st.ok && st.formErrors ? st.formErrors.name?.[0] : undefined}
      />
      <Input
        name="email"
        type="email"
        id="reg-mail"
        required
        autoComplete="email"
        label="Email"
        error={st && !st.ok && st.formErrors ? st.formErrors.email?.[0] : undefined}
      />
      <div>
        <PasswordInput
          name="password"
          id="reg-pw"
          onChange={(e) => {
            setPw((e.target as HTMLInputElement).value);
          }}
          minLength={8}
          maxLength={128}
          required
          autoComplete="new-password"
          label="Senha"
          error={st && !st.ok && st.formErrors ? st.formErrors.password?.[0] : undefined}
        />
        <PasswordStrength password={pw} />
      </div>
      <div>
        <PasswordInput
          name="confirmPassword"
          id="reg-pw-confirm"
          onChange={(e) => {
            setPwConfirm((e.target as HTMLInputElement).value);
          }}
          minLength={8}
          maxLength={128}
          required
          autoComplete="new-password"
          label="Confirmar senha"
          error={
            passwordsMatch === false
              ? "As senhas não coincidem"
              : st && !st.ok && st.formErrors
              ? st.formErrors.confirmPassword?.[0]
              : undefined
          }
        />
      </div>

      <div className="pt-1">
        <div className="flex items-start gap-2 text-sm">
          <input
            className="mt-1.5 h-4 w-4 rounded border-border accent-brand"
            type="checkbox"
            name="acceptTos"
            value="on"
            id={cb}
            required
            defaultChecked={false}
          />
          <label className="leading-snug text-foreground" htmlFor={cb}>
            Li e aceito os{" "}
            <a className="text-brand hover:underline font-medium" href="/terms">
              termos de uso
            </a>{" "}
            e a{" "}
            <a className="text-brand hover:underline font-medium" href="/privacy">
              política de privacidade
            </a>
            .
          </label>
        </div>
        {st && !st.ok && st.formErrors?.acceptTos ? (
          <p className="mt-1.5 text-xs text-danger">{st.formErrors.acceptTos[0]}</p>
        ) : null}
      </div>
      {st && !st.ok && st.message ? (
        <Alert variant="danger" title="Não foi possível criar a conta" description={st.message} />
      ) : null}
      <div className="pt-1">
        <Button
          className="w-full"
          type="submit"
          variant="primary"
          isLoading={p}
          disabled={p || passwordsMatch === false}
        >
          Criar conta
        </Button>
      </div>
    </form>
  );
}
