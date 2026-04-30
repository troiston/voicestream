"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import type { ActionResult } from "@/features/auth/actions";

type St = ActionResult<unknown> | null;

export function LoginForm() {
  const q = useSearchParams();
  const [st, act, p] = useActionState(loginAction, null as St);
  const [showPassword, setShowPassword] = useState(false);
  const passRef = useRef<HTMLInputElement>(null);
  const next = q.get("next") || "/dashboard";

  useEffect(() => {
    if (st && !st.ok && st.formErrors?.email) {
      document.getElementById("auth-email")?.focus();
    } else if (st && !st.ok && st.formErrors?.password) {
      passRef.current?.focus();
    }
  }, [st]);

  return (
    <form action={act} className="mt-4 space-y-3 text-left">
      <input type="hidden" name="next" value={next} readOnly />
      <Input
        name="email"
        type="email"
        id="auth-email"
        required
        autoComplete="email"
        label="Email"
        error={st && !st.ok && st.formErrors ? st.formErrors.email?.[0] : undefined}
      />
      <div className="relative">
        <Input
          ref={passRef}
          name="password"
          type={showPassword ? "text" : "password"}
          id="auth-pass"
          required
          minLength={8}
          autoComplete="current-password"
          label="Senha"
          error={st && !st.ok && st.formErrors ? st.formErrors.password?.[0] : undefined}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[2.25rem] text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      <div className="pt-0">
        <label className="inline-flex min-h-11 items-center gap-2 text-sm">
          <input className="h-4 w-4 rounded border-border" type="checkbox" name="remember" value="on" />
          Lembrar-me
        </label>
      </div>
      {st && !st.ok && st.message ? <Alert variant="danger" title="Não foi possível entrar" description={st.message} /> : null}
      <div className="pt-1">
        <Button type="submit" variant="primary" className="w-full" isLoading={p} disabled={p} loadingLabel="A entrar">
          Entrar
        </Button>
      </div>
    </form>
  );
}
