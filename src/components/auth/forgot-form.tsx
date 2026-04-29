"use client";

import { useActionState, useId } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { MailCheck } from "lucide-react";
import type { ActionResult } from "@/features/auth/actions";

type St = ActionResult<{ message: string }> | null;

export function ForgotForm() {
  const [st, act, p] = useActionState(forgotPasswordAction, null as St);
  const id = useId();

  // Estado SUCCESS: mostrar card em vez do form
  if (st?.ok) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <MailCheck className="h-16 w-16 text-success" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Instruções enviadas!</h2>
          <p className="text-sm text-muted-foreground">
            Se este e-mail estiver cadastrado, você receberá as instruções em breve.
          </p>
          <p className="text-xs text-muted-foreground">
            Não esqueça de verificar sua pasta de spam.
          </p>
        </div>
        <div className="flex justify-center">
          <Button asChild variant="secondary">
            <Link href="/login">Voltar para o login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={act}
      className="text-left space-y-2"
      aria-label="Pedir recuperação"
      aria-describedby={`${id}-h`}
    >
      <p id={`${id}-h`} className="text-xs text-foreground/50">
        Usamos a mesma mensagem para proteger privacidade.
      </p>
      <Input
        name="email"
        type="email"
        id="f-email"
        required
        autoComplete="email"
        label="Email"
        error={
          st && !st.ok && st.formErrors
            ? st.formErrors.email?.[0]
            : undefined
        }
      />
      {st && !st.ok && st.message ? (
        <Alert variant="danger" title="Atenção" description={st.message} />
      ) : null}
      <Button className="w-full" isLoading={p} type="submit" disabled={p}>
        Enviar instruções
      </Button>
    </form>
  );
}
