"use client";

import { useEffect, useId, useState } from "react";
import { CheckCircle } from "lucide-react";
import type { MockIntegration } from "@/lib/mocks/integrations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IntegrationConnectionDialogProps {
  integration: MockIntegration;
  onClose: () => void;
}

const PERMISSIONS = ["Ler eventos", "Criar eventos", "Sincronizar em tempo real", "Acessar informações de contacto"];

export function IntegrationConnectionDialog({
  integration,
  onClose,
}: IntegrationConnectionDialogProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const titleId = useId();
  const descId = useId();

  // Auto-progress through steps
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 0);
      return () => clearTimeout(timer);
    }
    if (step === 1) {
      const timer = setTimeout(() => setStep(2), 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div
        className="absolute inset-0 bg-foreground/30"
        role="presentation"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[min(100%,28rem)] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2",
          "rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-6 shadow-lg"
        )}
      >
        {step === 0 && (
          <div className="space-y-4">
            <div className="text-center">
              <div
                className="mx-auto h-16 w-16 rounded-lg flex items-center justify-center font-bold text-3xl"
                style={{
                  background: "var(--brand)/15",
                  color: "var(--brand)",
                }}
              >
                {integration.name.charAt(0)}
              </div>
              <h2 id={titleId} className="mt-4 text-lg font-semibold text-foreground">
                Autorizar {integration.name}
              </h2>
            </div>
            <p id={descId} className="text-sm text-muted-foreground text-center">
              {integration.detail}
            </p>
            <div className="mt-6 flex gap-2">
              <Button type="button" variant="secondary" className="flex-1 min-h-11" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1 btn-gradient min-h-11"
                onClick={() => setStep(1)}
              >
                Autorizar
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Permissões necessárias</h2>
            <p className="text-sm text-muted-foreground">
              {integration.name} pedirá as seguintes permissões:
            </p>
            <ul className="space-y-2">
              {PERMISSIONS.map((perm) => (
                <li key={perm} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 rounded bg-brand/20 flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-brand" />
                  </div>
                  {perm}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-2">
              <Button type="button" variant="secondary" className="flex-1 min-h-11" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="flex-1 btn-gradient min-h-11"
                onClick={() => setStep(2)}
              >
                Aceitar
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-success" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Conectado!</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {integration.name} foi conectado com sucesso à sua conta.
              </p>
            </div>
            <Badge variant="success" className="justify-center w-full h-6">
              Ligação ativa
            </Badge>
            <Button
              type="button"
              variant="primary"
              className="w-full btn-gradient min-h-11"
              onClick={handleClose}
            >
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
