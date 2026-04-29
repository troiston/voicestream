"use client";

import { useState, useActionState, useEffect, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { mfaRecoveryAction, verifyMfaAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import type { ActionResult } from "@/features/auth/actions";

const OTP_LENGTH = 6;
const init: ActionResult<unknown> | null = null;

export function MfaView() {
  const [mode, setMode] = useState<"totp" | "rec">("totp");
  if (mode === "rec") {
    return <MfaRecovery setMode={setMode} />;
  }
  return (
    <div className="w-full max-w-sm space-y-4">
      <MfaTotp />
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setMode("rec")}
      >
        Tenho um código de recuperação
      </Button>
    </div>
  );
}

function MfaTotp() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [s, a, p] = useActionState(verifyMfaAction, init);

  // Auto-submit quando todos os 6 dígitos preenchidos
  useEffect(() => {
    if (digits.every((d) => d !== "")) {
      const form = new FormData();
      form.set("code", digits.join(""));
      a(form);
    }
  }, [digits, a]);

  // Redirecionar em sucesso
  useEffect(() => {
    if (s?.ok) {
      router.push("/dashboard");
    }
  }, [s, router]);

  // Cooldown timer para reenvio
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const next = [...digits];
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-base font-semibold">Código de 6 dígitos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Digite o código da sua aplicação autenticadora.
        </p>
      </div>

      <div
        role="group"
        aria-label="Código de verificação de 6 dígitos"
        className="flex gap-2 justify-center"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="w-12 h-14 text-center text-xl font-mono rounded-md border border-border bg-surface-1 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 transition-colors"
            disabled={p}
            aria-label={`Dígito ${i + 1}`}
          />
        ))}
      </div>

      {p && (
        <div className="flex justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      )}

      {s && !s.ok && s.message ? (
        <Alert variant="danger" title="Código inválido" description={s.message} />
      ) : null}
      {s && !s.ok && s.formErrors?.code?.[0] ? (
        <Alert
          variant="danger"
          title="Erro"
          description={s.formErrors.code[0]}
        />
      ) : null}

      <button
        type="button"
        onClick={() => setCooldown(30)}
        disabled={cooldown > 0}
        className="w-full text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
      >
        {cooldown > 0 ? `Reenviar código (${cooldown}s)` : "Reenviar código"}
      </button>
    </div>
  );
}

function MfaRecovery({ setMode }: { setMode: (m: "totp" | "rec") => void }) {
  const router = useRouter();
  const [s, a, p] = useActionState(mfaRecoveryAction, init);

  useEffect(() => {
    if (s?.ok) {
      router.push("/dashboard");
    }
  }, [s, router]);

  return (
    <form
      action={a}
      className="w-full max-w-sm space-y-4"
      aria-label="Código de recuperação"
    >
      <div>
        <h2 className="text-base font-semibold">Código de recuperação</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Digite um código de backup com pelo menos 8 caracteres.
        </p>
      </div>

      <Input
        name="code"
        required
        minLength={8}
        type="text"
        label="Código de backup"
        disabled={p}
        autoComplete="off"
        error={s && !s.ok && s.formErrors?.code ? s.formErrors.code[0] : undefined}
      />

      {s && !s.ok && s.message ? (
        <Alert variant="danger" title="Erro" description={s.message} />
      ) : null}

      <div className="flex gap-2">
        <Button
          isLoading={p}
          className="flex-1"
          type="submit"
          loadingLabel="A verificar"
        >
          Validar
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setMode("totp")}
          disabled={p}
        >
          Voltar
        </Button>
      </div>
    </form>
  );
}
