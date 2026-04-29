"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import type { ActionResult } from "@/features/auth/actions";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

type St = ActionResult<{ message: string }> | null;

function PasswordStrength({ password }: { password: string }) {
  let score = 0;
  if (!password) return null;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  const strength = Math.min(4, Math.ceil((score / 5) * 4));
  const colors = ["bg-danger", "bg-warning", "bg-warning", "bg-success"];
  const labels = ["Fraca", "Média", "Boa", "Forte"];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < strength ? colors[strength - 1] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Força: <span className="font-medium">{labels[strength - 1]}</span>
      </p>
    </div>
  );
}

export function ResetForm() {
  const p = useSearchParams();
  const t = p.get("token");
  const [st, act, pe] = useActionState(resetPasswordAction, null as St);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!t || t === "expired" || t?.endsWith("-expired")) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-warning" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Link expirado</h2>
          <p className="text-sm text-muted-foreground">
            O link de recuperação expirou. Solicite um novo link.
          </p>
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/forgot-password">Solicitar novo link</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (st?.ok) {
    return (
      <div className="space-y-4">
        <Alert
          variant="success"
          title="Tudo pronto"
          description={st.data.message}
        />
        <Button asChild className="w-full">
          <Link href="/login">Ir para login</Link>
        </Button>
      </div>
    );
  }

  const passwordMismatch = password && confirmPassword && password !== confirmPassword;

  return (
    <form action={act} className="space-y-4 text-left">
      <input type="hidden" name="token" value={t} />

      <div>
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            id="r-p1"
            required
            minLength={8}
            label="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={
              st && !st.ok && st.formErrors
                ? st.formErrors.password?.[0]
                : undefined
            }
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <PasswordStrength password={password} />
      </div>

      <div className="relative">
        <Input
          name="confirmPassword"
          type={showConfirm ? "text" : "password"}
          id="r-p2"
          required
          minLength={8}
          label="Confirmar senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={
            st && !st.ok && st.formErrors
              ? st.formErrors.confirmPassword?.[0]
              : passwordMismatch
              ? "As senhas não coincidem"
              : undefined
          }
          autoComplete="new-password"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-10 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showConfirm ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {st && !st.ok && st.message ? (
        <Alert variant="danger" title="Erro" description={st.message} />
      ) : null}

      <Button
        isLoading={pe}
        className="w-full"
        type="submit"
        disabled={passwordMismatch || pe}
      >
        Guardar nova senha
      </Button>
    </form>
  );
}
